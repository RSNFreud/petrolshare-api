import { FastifyInstance } from "fastify";
import { retrieveID, dbQuery, retrieveGroupID, generateUniqueURL, dbInsert, retrieveName, sendNotification } from "../hooks";


export default (fastify: FastifyInstance, _: any, done: () => void) => {
    fastify.get<{ Querystring: { authenticationKey: string; invoiceID: string } }>(
        "/api/invoices/get",
        async (request, reply) => {
            const { query } = request;

            if (!query || !("authenticationKey" in query)) {
                return reply.code(400).send("Missing required field!");
            }
            let userID = await retrieveID(query["authenticationKey"]);
            if (!userID) return reply.code(400).send("No user found!");

            if (!("invoiceID" in query)) {
                const results: Array<any> = await dbQuery(
                    "SELECT i.invoiceID, s.sessionEnd FROM invoices i LEFT JOIN sessions s USING (sessionID) WHERE s.groupID=? ORDER BY s.sessionEnd DESC",
                    [await retrieveGroupID(query["authenticationKey"])]
                );
                if (!results.length)
                    return reply.code(400).send("There are no invoices in that group!");
                return reply.send(results);
            }

            let results = await dbQuery(
                "SELECT u.fullName, i.invoiceData, i.totalDistance, i.uniqueURL, i.pricePerLiter, s.sessionEnd, i.totalPrice, u.emailAddress FROM invoices i LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u USING (userID) WHERE i.invoiceID=?",
                [query["invoiceID"]]
            );
            if (!results.length)
                return reply.code(400).send("There are no invoices with that ID!");

            for (let i = 0; i < results.length; i++) {
                const e: {
                    fullName: string;
                    invoiceData: string;
                    totalDistance: string;
                    sessionEnd: string;
                    totalPrice: string;
                } = results[i];
                let data: {
                    [key: string]: {
                        distance: number;
                        fullName: string;
                        paymentDue?: number;
                        paid?: boolean;
                    };
                } = JSON.parse(e.invoiceData);

                for (let i = 0; i < Object.keys(data).length; i++) {
                    let key = Object.keys(data)[i];
                    console.log(key);
                    const name = await dbQuery('SELECT fullName, emailAddress FROM users WHERE userID=?', [key]);
                    if (name) data[key] = { ...data[key], ...name[0] };
                    e.invoiceData = JSON.stringify(data);
                }
            }


            let uniqueURL = results[0]?.uniqueURL

            if (uniqueURL === null) {
                uniqueURL = await generateUniqueURL()
                results[0].uniqueURL = uniqueURL
            }

            await dbInsert("UPDATE invoices SET invoiceData=?, uniqueURL=? WHERE invoiceID=?", [
                results[0].invoiceData, uniqueURL,
                query["invoiceID"],
            ]);
            reply.send(results[0]);
        }
    );
    fastify.get<{ Querystring: { uniqueURL: string } }>(
        "/api/invoices/public/get",
        async (request, reply) => {
            const { query } = request;

            if (!query || !("uniqueURL" in query)) {
                return reply.code(400).send("Missing required field!");
            }

            let results = await dbQuery(
                "SELECT u.fullName, i.invoiceData, i.totalDistance, u.userID, i.uniqueURL, i.pricePerLiter, s.sessionEnd, i.totalPrice FROM invoices i LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u USING (userID) WHERE i.uniqueURL=?",
                [query["uniqueURL"]]
            );
            if (!results.length)
                return reply.code(400).send("There are no invoices with that ID!");

            const groupID = await dbQuery('SELECT groupID FROM users WHERE userID=?', [results[0].userID])
            const groupData = groupID ? await dbQuery('SELECT distance, currency, petrol FROM groups WHERE groupID=?', [groupID[0].groupID]) : undefined

            for (let i = 0; i < results.length; i++) {
                const e: {
                    fullName: string;
                    invoiceData: string;
                    totalDistance: string;
                    sessionEnd: string;
                    totalPrice: string;
                } = results[i];
                let data: {
                    [key: string]: {
                        distance: number;
                        fullName: string;
                        paymentDue?: number;
                        paid?: boolean;
                    };
                } = JSON.parse(e.invoiceData);

                for (let i = 0; i < Object.keys(data).length; i++) {
                    let key = Object.keys(data)[i];
                    const name = await retrieveName(key);
                    if (name) data[key]["fullName"] = name;
                    e.invoiceData = JSON.stringify(data);
                }
            }


            await dbInsert("UPDATE invoices SET invoiceData=? WHERE uniqueURL=?", [
                results[0].invoiceData,
                query["uniqueURL"],
            ]);
            delete results[0]?.userID
            if (groupData)
                reply.send({ ...results[0], ...groupData[0] });
            else
                reply.send(results[0]);
        }
    );
    fastify.post<{
        Body: { authenticationKey: string; invoiceID: string; userID: string };
    }>("/api/invoices/pay", async (request, reply) => {
        const { body } = request;

        if (
            !body ||
            !("authenticationKey" in body) ||
            !("invoiceID" in body) ||
            !("userID" in body)
        ) {
            return reply.code(400).send("Missing required field!");
        }

        let userID = await retrieveID(body["authenticationKey"]);
        if (!userID) return reply.code(400).send("No user found!");

        let results: any = await dbQuery(
            "SELECT i.invoiceData FROM invoices i LEFT JOIN sessions s USING(sessionID) WHERE i.invoiceID=? AND s.groupID=?",
            [body["invoiceID"], await retrieveGroupID(body["authenticationKey"])]
        );
        if (!results.length)
            return reply.code(400).send("There are no invoices with that ID!");

        results = JSON.parse(results[0].invoiceData);

        if (results[body["userID"]]) {
            results[body["userID"]] = {
                ...results[body["userID"]],
                paid: true,
            };
        } else {
            return reply.code(400).send("No user found with that ID!");
        }
        await dbInsert("UPDATE invoices SET invoiceData=? WHERE invoiceID=?", [
            JSON.stringify(results),
            body["invoiceID"],
        ]);

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

        if (
            !body ||
            !("authenticationKey" in body) ||
            !("invoiceID" in body) ||
            !("userID" in body) ||
            !("distance" in body)
        ) {
            return reply.code(400).send("Missing required field!");
        }

        let userID = await retrieveID(body["authenticationKey"]);
        if (!userID) return reply.code(400).send("No user found!");

        let data: any = await dbQuery(
            "SELECT i.invoiceData, i.totalDistance, i.litersFilled, i.totalPrice, s.initialOdometer, s.sessionID FROM invoices i LEFT JOIN sessions s USING(sessionID) WHERE i.invoiceID=? AND s.groupID=?",
            [body["invoiceID"], await retrieveGroupID(body["authenticationKey"])]
        );
        if (!data.length)
            return reply.code(400).send("There are no invoices with that ID!");

        let results = JSON.parse(data[0].invoiceData);
        if (!results["0"])
            return reply.code(400).send("No unindentified distance to assign!");

        let totalDistance = data[0]["totalDistance"];
        const pricePerLiter = data[0]["totalPrice"] / data[0]["litersFilled"];
        const litersPerKm = data[0]["litersFilled"] / totalDistance;

        const newDistance = results[body["userID"]]
            ? parseFloat(body["distance"]) +
            parseFloat(results[body["userID"]].distance)
            : parseFloat(body["distance"]);
        const unidentified: { fullName: string; distance: string } = results["0"];
        const newUnidentified =
            parseFloat(unidentified.distance) - parseFloat(body["distance"]);

        if (results[body["userID"]])
            results[body["userID"]] = {
                ...results[body["userID"]],
                distance: newDistance.toFixed(2),
                paymentDue: (newDistance * litersPerKm * pricePerLiter).toFixed(2),
                liters: (newDistance * litersPerKm).toFixed(2),
            };
        else {
            const fullName = await retrieveName(body["userID"]);
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

        await dbInsert(
            "INSERT INTO logs(userID, distance, date, sessionID) VALUES(?,?,?,?)",
            [body["userID"], body["distance"], Date.now(), data[0]["sessionID"]]
        );
        await dbInsert("UPDATE invoices SET invoiceData=? WHERE invoiceID=?", [
            JSON.stringify(results),
            body["invoiceID"],
        ]);

        reply.send();
    });
    fastify.post<{ Body: { authenticationKey: string, fullName: string, invoiceID: number } }>('/api/invoices/alert', async (request, reply) => {
        const { body } = request

        if (!body || !('authenticationKey' in body) || !('fullName' in body) || !('invoiceID' in body)) {
            return reply.code(400).send('Missing required field!')
        }

        let userID = await retrieveID(body['authenticationKey'])
        if (!userID) return reply.code(400).send('No user found!')

        const user = await dbQuery('SELECT notificationKey FROM users WHERE fullName=?', [body['fullName']])

        if (!user.length)
            return reply.code(400).send('There is no user with that name!')

        if (user[0].notificationKey) {
            sendNotification([{ notificationKey: user[0].notificationKey }], `You have a payment request waiting and havent dealt with it yet! ${body['fullName']} has asked for your attention on it!`, { route: "Payments", invoiceID: body["invoiceID"] })
        } else {
            return reply.code(400).send('This user is using the web version of the app and as such we cannot send them notifications!')
        }

        reply.send()
    })

    done()
}