import { FastifyInstance } from "fastify";
import { retrieveGroupID, dbQuery, dbInsert, retrieveID, retrieveSessionID, sendNotification, retrieveName } from "../hooks";

export default (fastify: FastifyInstance, _: any, done: () => void) => {
    fastify.get<{ Querystring: { authenticationKey: string } }>(
        "/api/distance/get",
        async (request, reply) => {
            const { query } = request;

            if (!("authenticationKey" in query)) {
                return reply.code(400).send("Missing required field!");
            }

            const userID = await retrieveID(query["authenticationKey"]);
            if (!userID) return reply.code(400).send("No user found!");

            const results = await dbQuery(
                "SELECT l.distance, s.sessionActive from logs l LEFT JOIN sessions s USING (sessionID) WHERE userID=? AND s.sessionActive=1 AND s.groupID=? AND approved=1",
                [userID, await retrieveGroupID(query["authenticationKey"])]
            );

            if (!results.length) return reply.send(0);

            let total = 0;
            results.map(({ distance }) => {
                total += distance;
            });
            reply.send(Math.round(total * 100) / 100);
        }
    );

    fastify.post<{ Body: { authenticationKey: string } }>(
        "/api/distance/reset",
        async (request, reply) => {
            const { body } = request;

            if (!body || !("authenticationKey" in body)) {
                return reply.code(400).send("Missing required field!");
            }

            const groupID = await retrieveGroupID(body["authenticationKey"]);
            await dbQuery(
                "UPDATE sessions SET sessionActive=false, sessionEnd=? WHERE groupID=?",
                [Date.now(), groupID]
            );
            retrieveSessionID(groupID);

            reply.code(200);
        }
    );

    fastify.post<{ Body: { authenticationKey: string; distance: string } }>(
        "/api/distance/add",
        async (request, reply) => {
            const { body } = request;

            if (!body || !("distance" in body) || !("authenticationKey" in body)) {
                return reply.code(400).send("Missing required field!");
            }

            const results = await dbQuery(
                "SELECT * FROM users WHERE authenticationKey=?",
                [body["distance"], body["authenticationKey"]]
            );
            if (!results) return reply.code(400).send("This user does not exist!");
            const log = (
                await dbQuery(
                    "SELECT userID, groupID FROM users WHERE authenticationKey=?",
                    [body["authenticationKey"]]
                )
            )[0];
            const sessionID = await retrieveSessionID(log.groupID);

            try {
                await dbInsert(
                    "INSERT INTO logs(userID, distance, date, sessionID) VALUES(?,?,?,?)",
                    [log.userID, body["distance"], Date.now(), sessionID]
                );
            } catch (err) {
                console.log(err);
            }

            reply.code(200);
        }
    );

    fastify.post<{
        Body: { authenticationKey: string; distance: string; userID: string };
    }>("/api/distance/assign", async (request, reply) => {
        const { body } = request;

        if (
            !body ||
            !("distance" in body) ||
            !("authenticationKey" in body) ||
            !("userID" in body)
        ) {
            return reply.code(400).send("Missing required field!");
        }

        const userData = await dbQuery(
            "SELECT fullName, userID, groupID FROM users WHERE authenticationKey=?",
            [body["authenticationKey"]]
        );
        if (!userData.length)
            return reply.code(400).send("This user does not exist!");
        const sessionID = await retrieveSessionID(userData[0].groupID);
        if (!sessionID) return reply.code(400).send("This user does not exist!");

        const groupData = await dbQuery(
            "SELECT distance FROM groups WHERE groupID=?",
            [userData[0].groupID]
        );

        const user = await dbQuery(
            "SELECT notificationKey FROM users WHERE userID=?",
            [body["userID"]]
        );
        if (!user.length) return reply.code(400).send("This user does not exist!");

        sendNotification(
            [{ notificationKey: user[0].notificationKey }],
            `${userData[0].fullName} has requested to add the distance of ${body["distance"]}${groupData[0].distance} to your account! Click on this notification to respond`,
            { route: "Dashboard" }
        );

        try {
            await dbInsert(
                "INSERT INTO logs(userID, distance, date, sessionID, approved, assignedBy) VALUES(?,?,?,?,0,?)",
                [
                    body["userID"],
                    body["distance"],
                    Date.now(),
                    sessionID,
                    userData[0].userID,
                ]
            );
        } catch (err) {
            console.log(err);
        }

        reply.code(200);
    });

    fastify.post<{ Body: { authenticationKey: string; logID: string } }>(
        "/api/distance/dismiss",
        async (request, reply) => {
            const { body } = request;

            if (!body || !("logID" in body) || !("authenticationKey" in body)) {
                return reply.code(400).send("Missing required field!");
            }

            const userData = retrieveID(body["authenticationKey"]);
            if (!userData) return reply.code(400).send("This user does not exist!");

            try {
                await dbQuery("DELETE FROM logs WHERE logID=?", [body["logID"]]);
            } catch (err) {
                console.log(err);
            }

            reply.code(200);
        }
    );

    fastify.post<{ Body: { authenticationKey: string; logID: string } }>(
        "/api/distance/approve",
        async (request, reply) => {
            const { body } = request;

            if (!body || !("logID" in body) || !("authenticationKey" in body)) {
                return reply.code(400).send("Missing required field!");
            }

            const userData = retrieveID(body["authenticationKey"]);
            if (!userData) return reply.code(400).send("This user does not exist!");

            try {
                await dbQuery("UPDATE logs SET approved=1 WHERE logID=?", [
                    body["logID"],
                ]);
            } catch (err) {
                console.log(err);
            }

            reply.code(200);
        }
    );

    fastify.get<{ Querystring: { authenticationKey: string } }>(
        "/api/distance/check-distance",
        async (request, reply) => {
            const { query } = request;

            if (!query || !("authenticationKey" in query)) {
                return reply.code(400).send("Missing required field!");
            }

            const userData = await dbQuery(
                "SELECT userID, groupID FROM users WHERE authenticationKey=?",
                [query["authenticationKey"]]
            );
            if (!userData.length)
                return reply.code(400).send("This user does not exist!");
            const sessionID = await retrieveSessionID(userData[0].groupID);
            if (!sessionID) return reply.code(400).send("This user does not exist!");

            const groupData = await dbQuery(
                "SELECT distance, assignedBy, logID FROM logs WHERE sessionID=? AND approved=0 AND userID=?",
                [sessionID, userData[0].userID]
            );

            if (groupData.length) {
                reply.send({
                    distance: groupData[0].distance,
                    assignedBy: await retrieveName(groupData[0].assignedBy),
                    id: groupData[0].logID,
                });
            } else reply.code(200);
        }
    );
    done()
}