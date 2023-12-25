import { FastifyInstance } from "fastify";
import { retrieveGroupID, dbQuery, retrieveID } from "../hooks";
export default (fastify: FastifyInstance, _: any, done: () => void) => {

    fastify.get<{ Querystring: { authenticationKey: string } }>(
        "/api/logs/get",
        async (request, reply) => {
            const { query } = request;

            if (!("authenticationKey" in query)) {
                return reply.code(400).send("Missing required field!");
            }

            let sessions = await dbQuery(
                "SELECT sessionStart, sessionEnd, sessionActive, sessionID FROM sessions WHERE groupID = ?",
                [await retrieveGroupID(query["authenticationKey"])]
            );
            if (!sessions)
                return reply.code(400).send("There are no sessions to be found");

            let logs = await dbQuery(
                "SELECT s.groupID, u.fullName, l.distance, l.date, l.logID, l.approved, s.sessionID FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON u.userID = l.userID WHERE s.groupID = ? ORDER BY l.date DESC",
                [await retrieveGroupID(query["authenticationKey"])]
            );

            let flat: {
                [key: string]: {
                    sessionID?: string;
                    sessionActive?: string;
                    sessionStart?: string;
                    sessionEnd?: string;
                    logs: Array<any>;
                };
            } = {};
            sessions.map((e) => {
                if (!flat[e.sessionID]) flat[e.sessionID] = { logs: [] };

                flat[e.sessionID] = {
                    sessionID: e.sessionID,
                    sessionActive: e.sessionActive,
                    sessionStart: e.sessionStart,
                    sessionEnd: e.sessionEnd,
                    logs: [],
                };
            });

            logs.map((e) => {
                if (!flat[e.sessionID]) flat[e.sessionID] = { logs: [] };

                flat[e.sessionID] = {
                    ...flat[e.sessionID],
                    logs: [
                        ...flat[e.sessionID].logs,
                        {
                            fullName: e.fullName,
                            distance: e.distance,
                            date: e.date,
                            logID: e.logID,
                            pending: !e.approved
                        },
                    ],
                };
            });

            reply.send(flat);
        }
    );

    fastify.post<{ Body: { authenticationKey: string; logID: string } }>(
        "/api/logs/delete",
        async (request, reply) => {
            const { body } = request;

            if (!("authenticationKey" in body) || !("logID" in body)) {
                return reply.code(400).send("Missing required field!");
            }

            const userID = await retrieveID(body["authenticationKey"]);
            if (!userID) return reply.code(400).send("No user found!");

            const results = await dbQuery(
                "SELECT u.userID, l.distance, l.logID, s.sessionActive FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON u.userID = l.userID WHERE l.logID = ?",
                [body["logID"]]
            );

            if (results[0].userID !== userID) {
                return reply.code(400).send("Insufficient permissions!");
            }

            await dbQuery("DELETE FROM logs WHERE logID=?", [body["logID"]]);

            if (!results) return reply.code(400).send("There are no logs to be found");
        }
    );

    fastify.post<{
        Body: { authenticationKey: string; logID: string; distance: string };
    }>("/api/logs/edit", async (request, reply) => {
        const { body } = request;

        if (
            !("authenticationKey" in body) ||
            !("logID" in body) ||
            !("distance" in body)
        ) {
            return reply.code(400).send("Missing required field!");
        }

        const userID = await retrieveID(body["authenticationKey"]);
        if (!userID) return reply.code(400).send("No user found!");

        const results = await dbQuery(
            "SELECT u.userID, l.distance, l.logID, s.sessionActive FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON u.userID = l.userID WHERE l.logID = ?",
            [body["logID"]]
        );

        if (!results.length) return reply.code(400).send("No log found with that ID");

        if (results[0].userID !== userID) {
            return reply.code(400).send("Insufficient permissions!");
        }

        await dbQuery("UPDATE logs SET distance=? WHERE logID=?", [
            body["distance"],
            body["logID"],
        ]);

        if (!results) return reply.code(400).send("There are no logs to be found");
    });
    done()
}