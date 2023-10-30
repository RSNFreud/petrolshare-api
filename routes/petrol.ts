import { FastifyInstance } from "fastify";
import { dbQuery, retrieveGroupID, retrieveID, dbInsert, generateUniqueURL, sendNotification } from "../hooks";

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

        if (
            !body ||
            !("totalPrice" in body) ||
            !("litersFilled" in body) ||
            !("authenticationKey" in body) ||
            !("odometer" in body)
        ) {
            return reply.code(400).send("Missing required field!");
        }

        // const results = await dbQuery('SELECT l.distance, s.sessionActive, s.initialOdometer, s.sessionID, u.fullName, u.notificationKey, u.userID FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON l.userID = u.userID WHERE s.groupID=? AND s.sessionID=63', [await retrieveGroupID(body['authenticationKey'])])
        const results = await dbQuery(
            "SELECT l.distance, s.sessionActive, s.initialOdometer, s.sessionID, u.fullName, u.notificationKey, u.userID FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON l.userID = u.userID WHERE s.groupID=? AND s.sessionActive=1 AND l.approved=1",
            [await retrieveGroupID(body["authenticationKey"])]
        );

        if (!results || !results.length) return reply.code(400).send("No logs found");

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
            const e: {
                distance: string;
                sessionActive: number;
                initialOdometer: number;
                sessionID: number;
                fullName: string;
                userID: string;
            } = results[i];

            if (!(e.userID in distances)) {
                distances[e.userID] = { distance: 0, fullName: e["fullName"] };
            }
            distances[e.userID] = {
                distance: distances[e.userID].distance + parseFloat(e.distance),
                fullName: e["fullName"],
            };
        }

        let totalDistance = Object.values(distances).reduce(
            (a, b) => a + b["distance"],
            0
        );

        const pricePerLiter = body["totalPrice"] / body["litersFilled"];
        const totalCarDistance = body["odometer"] - results[0]["initialOdometer"];

        const litersPerKm =
            body["litersFilled"] /
            (results[0]["initialOdometer"] && totalCarDistance > 0
                ? totalCarDistance
                : totalDistance);
        const userID = await retrieveID(body["authenticationKey"]);

        Object.entries(distances).map(([key, value]) => {
            distances[key] = {
                fullName: value.fullName,
                paymentDue:
                    Math.round(value.distance * litersPerKm * pricePerLiter * 100) / 100,
                paid: parseInt(key) === userID,
                distance: Math.round(value.distance * 100) / 100,
                liters: (value.distance * litersPerKm).toFixed(2),
            };
        });
        if (
            results[0]["initialOdometer"] &&
            totalCarDistance !== totalDistance &&
            totalCarDistance - totalDistance > 0
        ) {
            distances[0] = {
                fullName: "Unaccounted Distance",
                paymentDue:
                    Math.round(
                        (totalCarDistance - totalDistance) * litersPerKm * pricePerLiter * 100
                    ) / 100,
                paid: false,
                distance: Math.round((totalCarDistance - totalDistance) * 100) / 100,
            };
        }

        await dbInsert(
            "UPDATE sessions SET sessionActive=0, sessionEnd=? WHERE groupID=? AND sessionActive=1",
            [Date.now(), await retrieveGroupID(body["authenticationKey"])]
        );
        await dbInsert(
            "INSERT INTO sessions (sessionStart, groupID, sessionActive, initialOdometer) VALUES (?,?,?,?)",
            [
                Date.now(),
                await retrieveGroupID(body["authenticationKey"]),
                true,
                body["odometer"],
            ]
        );

        const res: any = await dbInsert(
            "INSERT INTO invoices (invoiceData, sessionID, totalPrice, totalDistance, userID, litersFilled, pricePerLiter, uniqueURL) VALUES (?,?,?,?,?,?,?,?)",
            [
                JSON.stringify(distances),
                results[0].sessionID,
                body["totalPrice"],
                Math.round(
                    (totalCarDistance > 0 ? totalCarDistance : totalDistance) * 100
                ) / 100,
                await retrieveID(body["authenticationKey"]),
                body["litersFilled"],
                pricePerLiter,
                await generateUniqueURL()
            ]
        );
        let notifications = results.filter((e) => e.userID !== userID);
        notifications = notifications.reduce((map, obj) => {
            map[obj.userID] = obj;
            return map;
        }, {});

        sendNotification(
            Object.values(notifications),
            "You have a new invoice waiting!",
            { route: "Invoices", invoiceID: res["insertId"] }
        );
        reply.send(res["insertId"]);
    });
    done()
}