import { FastifyInstance } from "fastify";
import { dbQuery, verifyAuthenticatedUser } from "../hooks";
import { getSortedLogs } from "../functions/logs/getSortedLogs";
export default (fastify: FastifyInstance, _: any, done: () => void) => {
  fastify.get<{ Querystring: { authenticationKey: string } }>("/api/logs/get", async (request, reply) => {
    const userData = await verifyAuthenticatedUser(request.headers, reply);

    if (!userData) return;

    const { groupID } = userData;
    const logs = await getSortedLogs(groupID, reply);

    reply.send(logs);
  });

  fastify.post<{ Body: { authenticationKey: string; logID: string } }>("/api/logs/delete", async (request, reply) => {
    const { body } = request;
    const userData = await verifyAuthenticatedUser(request.headers, reply);

    if (!userData || !("logID" in body)) {
      return reply.code(400).send("Missing required field!");
    }

    const { userID } = userData;

    const results = await dbQuery(
      "SELECT u.userID, l.distance, l.logID, s.sessionActive FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON u.userID = l.userID WHERE l.logID = ?",
      [body["logID"]],
    );

    if (results[0].userID !== userID) {
      return reply.code(400).send("Insufficient permissions!");
    }

    await dbQuery("DELETE FROM logs WHERE logID=?", [body["logID"]]);

    if (!results) return reply.code(400).send("There are no logs to be found");
  });

  fastify.post<{
    Body: { authenticationKey: string; logID: string; distance: string };
  }>("/api/logs/edit", async (request, reply) => {
    const { body } = request;
    const userData = await verifyAuthenticatedUser(request.headers, reply);

    if (!userData || !("logID" in body) || !("distance" in body)) {
      return reply.code(400).send("Missing required field!");
    }

    const { userID } = userData;

    const results = await dbQuery(
      "SELECT u.userID, l.distance, l.logID, s.sessionActive FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON u.userID = l.userID WHERE l.logID = ?",
      [body["logID"]],
    );

    if (!results.length) return reply.code(400).send("No log found with that ID");

    if (results[0].userID !== userID) {
      return reply.code(400).send("Insufficient permissions!");
    }

    await dbQuery("UPDATE logs SET distance=? WHERE logID=?", [body["distance"], body["logID"]]);

    if (!results) return reply.code(400).send("There are no logs to be found");
  });
  done();
};
