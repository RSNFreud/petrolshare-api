import { FastifyInstance } from "fastify";
import { dbInsert, generateUniqueURL, sendNotification, verifyAuthenticatedUser } from "../hooks";
import { getLogs, ResultsDBResponseType } from "../functions/petrol";

export default (fastify: FastifyInstance, _: any, done: () => void) => {
  fastify.post<{
    Body: {
      authenticationKey: string;
      totalPrice: number;
      litersFilled: number;
      odometer: number;
    };
  }>("/api/petrol/add", async (request, reply) => {
    const { body } = request;
    const userData = await verifyAuthenticatedUser(request.headers, reply);

    if (!body || !("totalPrice" in body) || !("litersFilled" in body) || !userData || !("odometer" in body)) {
      return reply.code(400).send("Missing required field!");
    }

    const { groupID, userID } = userData;

    const results = await getLogs(groupID);

    if (!results) return reply.code(400).send("No logs found");

    let distances: {
      [key: string]: {
        distance: number;
        fullName: string;
        paymentDue?: number;
        paid?: boolean;
        liters?: string;
      };
    } = {};

    for (let i = 0; i < results.length; i++) {
      const e = results[i];

      distances[e.userID] = {
        distance: (distances[e.userID]?.distance || 0) + parseFloat(e.distance),
        fullName: e["fullName"],
      };
    }
    const totalDistance = Object.values(distances).reduce((a, b) => a + b["distance"], 0);

    const { initialOdometer } = results[0];
    const { totalPrice, litersFilled, odometer } = body;

    const pricePerLiter = totalPrice / litersFilled;
    const totalCarDistance = initialOdometer ? odometer - initialOdometer : totalDistance;

    const litersPerKm = litersFilled / (initialOdometer && totalCarDistance > 0 ? totalCarDistance : totalDistance);

    Object.entries(distances).map(([key, value]) => {
      distances[key] = {
        fullName: value.fullName,
        paymentDue: Math.round(value.distance * litersPerKm * pricePerLiter * 100) / 100,
        paid: parseInt(key) === parseInt(userID),
        distance: Math.round(value.distance * 100) / 100,
        liters: (value.distance * litersPerKm).toFixed(2),
      };
    });

    if (initialOdometer && totalCarDistance !== totalDistance && totalCarDistance - totalDistance > 0) {
      distances[0] = {
        fullName: "Unaccounted Distance",
        paymentDue: Math.round((totalCarDistance - totalDistance) * litersPerKm * pricePerLiter * 100) / 100,
        paid: false,
        distance: Math.round((totalCarDistance - totalDistance) * 100) / 100,
      };
    }

    await dbInsert("UPDATE sessions SET sessionActive=0, sessionEnd=? WHERE groupID=? AND sessionActive=1", [
      Date.now().toString(),
      groupID,
    ]);
    await dbInsert("INSERT INTO sessions (sessionStart, groupID, sessionActive, initialOdometer) VALUES (?,?,?,?)", [
      Date.now().toString(),
      groupID,
      true,
      odometer.toString(),
    ]);

    const res = await dbInsert(
      "INSERT INTO invoices (invoiceData, sessionID, totalPrice, totalDistance, userID, litersFilled, pricePerLiter, uniqueURL) VALUES (?,?,?,?,?,?,?,?)",
      [
        JSON.stringify(distances),
        results[0].sessionID,
        totalPrice,
        Math.round((totalCarDistance > 0 ? totalCarDistance : totalDistance) * 100) / 100,
        userData.userID,
        litersFilled,
        pricePerLiter,
        await generateUniqueURL(),
      ],
    );
    let notifications = results.filter((e) => e.userID !== userID);

    const parsedNotifications = notifications.reduce(
      (map, obj) => {
        map[obj.userID] = obj;
        return map;
      },
      {} as { [key: string]: ResultsDBResponseType },
    );

    sendNotification(Object.values(parsedNotifications), "You have a new invoice waiting!", {
      route: "Invoices",
      invoiceID: res["insertId"],
    });
    reply.send(res["insertId"]);
  });

  fastify.get("/api/petrol/check-validity", async (request, reply) => {
    const userData = await verifyAuthenticatedUser(request.headers, reply);

    if (!userData) {
      return reply.code(400).send("Missing required field!");
    }

    const logs = (await getLogs(userData.groupID))?.length || 0;

    await reply.send(Boolean(logs).toString());
  });
  done();
};
