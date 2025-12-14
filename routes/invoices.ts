import { FastifyInstance } from "fastify";
import { dbQuery, generateUniqueURL, dbInsert, sendNotification, verifyAuthenticatedUser, getName } from "../hooks";
import { getInvoice } from "../functions/invoice/getInvoice";

export default (fastify: FastifyInstance, _: any, done: () => void) => {
  fastify.get<{ Querystring: { invoiceID: string } }>("/api/invoices/get", async (request, reply) => {
    const { query } = request;
    const userData = await verifyAuthenticatedUser(request.headers, reply);

    if (!query || !userData) {
      return reply.code(400).send("Missing required field!");
    }
    let { groupID } = userData;

    const results: Array<any> = await dbQuery(
      "SELECT i.invoiceID, s.sessionEnd FROM invoices i LEFT JOIN sessions s USING (sessionID) WHERE s.groupID=? ORDER BY s.sessionEnd DESC",
      [groupID]
    );
    if (!results.length) return reply.code(400).send("There are no invoices in that group!");
    return reply.send(results);
  });

  fastify.get<{ Params: { invoiceID: string } }>("/api/invoices/get/:invoiceID", async (request, reply) => {
    const invoiceID = request.params?.invoiceID;
    const userData = await verifyAuthenticatedUser(request.headers, reply);
    if (!invoiceID || !userData) {
      return reply.code(400).send("Missing required field!");
    }
    return getInvoice({ invoiceID: invoiceID, reply });
  });

  fastify.get<{ Params: { uniqueURL: string } }>("/api/invoices/public/get/:uniqueURL", async (request, reply) => {
    const uniqueURL = request.params?.uniqueURL;

    if (!uniqueURL) {
      return reply.code(400).send("Missing required field!");
    }

    const [invoiceID] = await dbQuery("SELECT invoiceID FROM invoices WHERE uniqueURL=?", [uniqueURL]);

    if (!invoiceID) return reply.code(400).send("There are no invoices with that ID!");
    return getInvoice({ invoiceID: invoiceID.invoiceID, reply });
  });

  fastify.post<{
    Body: { authenticationKey: string; invoiceID: string; userID: string };
  }>("/api/invoices/pay", async (request, reply) => {
    const { body } = request;
    const userData = await verifyAuthenticatedUser(request.headers, reply);

    if (!body || !userData || !("invoiceID" in body) || !("userID" in body)) {
      return reply.code(400).send("Missing required field!");
    }
    const { groupID } = userData;

    let results: any = await dbQuery(
      "SELECT i.invoiceData FROM invoices i LEFT JOIN sessions s USING(sessionID) WHERE i.invoiceID=? AND s.groupID=?",
      [body["invoiceID"], groupID]
    );
    if (!results.length) return reply.code(400).send("There are no invoices with that ID!");

    results = JSON.parse(results[0].invoiceData);

    if (results[body["userID"]]) {
      results[body["userID"]] = {
        ...results[body["userID"]],
        paid: true,
      };
    } else {
      return reply.code(400).send("No user found with that ID!");
    }
    await dbInsert("UPDATE invoices SET invoiceData=? WHERE invoiceID=?", [JSON.stringify(results), body["invoiceID"]]);

    reply.send();
  });

  fastify.post<{
    Body: {
      authenticationKey: string;
      invoiceID: string;
      userID: string;
      distance: string;
    };
  }>("/api/invoices/assign", async (request, reply) => {
    const { body } = request;
    const userData = await verifyAuthenticatedUser(request.headers, reply);
    if (!body || !userData || !("invoiceID" in body) || !("userID" in body) || !("distance" in body)) {
      return reply.code(400).send("Missing required field!");
    }

    const { groupID } = userData;

    let data: any = await dbQuery(
      "SELECT i.invoiceData, i.totalDistance, i.litersFilled, i.totalPrice, s.initialOdometer, s.sessionID FROM invoices i LEFT JOIN sessions s USING(sessionID) WHERE i.invoiceID=? AND s.groupID=?",
      [body["invoiceID"], groupID]
    );
    if (!data.length) return reply.code(400).send("There are no invoices with that ID!");

    let results = JSON.parse(data[0].invoiceData);
    if (!results["0"]) return reply.code(400).send("No unindentified distance to assign!");

    let totalDistance = data[0]["totalDistance"];
    const pricePerLiter = data[0]["totalPrice"] / data[0]["litersFilled"];
    const litersPerKm = data[0]["litersFilled"] / totalDistance;

    const newDistance = results[body["userID"]]
      ? parseFloat(body["distance"]) + parseFloat(results[body["userID"]].distance)
      : parseFloat(body["distance"]);
    const unidentified: { fullName: string; distance: string } = results["0"];
    const newUnidentified = parseFloat(unidentified.distance) - parseFloat(body["distance"]);

    if (results[body["userID"]])
      results[body["userID"]] = {
        ...results[body["userID"]],
        distance: newDistance.toFixed(2),
        paymentDue: (newDistance * litersPerKm * pricePerLiter).toFixed(2),
        liters: (newDistance * litersPerKm).toFixed(2),
      };
    else {
      const fullName = await getName(body["userID"]);
      if (!fullName) return reply.code(400).send("No user found with that ID!");
      results[body["userID"]] = {
        fullName: fullName,
        distance: newDistance.toFixed(2),
        paid: false,
        paymentDue: (newDistance * litersPerKm * pricePerLiter).toFixed(2),
        liters: (newDistance * litersPerKm).toFixed(2),
      };
    }
    if (newUnidentified <= 0) delete results["0"];
    else
      results["0"] = {
        ...results["0"],
        distance: newUnidentified.toFixed(2),
        paymentDue: (newUnidentified * litersPerKm * pricePerLiter).toFixed(2),
      };

    await dbInsert("INSERT INTO logs(userID, distance, date, sessionID) VALUES(?,?,?,?)", [
      body["userID"],
      body["distance"],
      Date.now(),
      data[0]["sessionID"],
    ]);
    await dbInsert("UPDATE invoices SET invoiceData=? WHERE invoiceID=?", [JSON.stringify(results), body["invoiceID"]]);

    reply.send();
  });

  fastify.post<{ Body: { authenticationKey: string; fullName: string; invoiceID: number } }>(
    "/api/invoices/alert",
    async (request, reply) => {
      const { body } = request;
      const userData = await verifyAuthenticatedUser(request.headers, reply);

      if (!body || !userData || !("fullName" in body) || !("invoiceID" in body)) {
        return reply.code(400).send("Missing required field!");
      }

      const user = await dbQuery("SELECT notificationKey FROM users WHERE fullName=?", [body["fullName"]]);

      if (!user.length) return reply.code(400).send("There is no user with that name!");

      if (user[0].notificationKey) {
        sendNotification(
          [{ notificationKey: user[0].notificationKey }],
          `You have a payment request waiting and havent dealt with it yet! ${body["fullName"]} has asked for your attention on it!`,
          { route: "invoices", invoiceID: body["invoiceID"] }
        );
      } else {
        return reply
          .code(400)
          .send("This user is using the web version of the app and as such we cannot send them notifications!");
      }

      reply.send();
    }
  );

  done();
};
