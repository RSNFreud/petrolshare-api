import { FastifyInstance } from "fastify";
import { dbInsert, dbQuery, verifyAuthenticatedUser } from "../hooks";

export default (fastify: FastifyInstance, _: any, done: () => void) => {
  fastify.get<{ Querystring: { authenticationKey: string } }>("/api/preset/get", async (request, reply) => {
    const { query } = request;
    const userData = await verifyAuthenticatedUser(request.headers, reply);

    if (!query || !userData) {
      return reply.code(400).send("Missing required field!");
    }
    const { userID } = userData;

    const results = await dbQuery("SELECT presetName, distance, presetID FROM presets WHERE userID=?", [userID]);
    if (!results) return reply.code(400).send("There are no presets!");

    reply.send(results);
  });

  fastify.post<{
    Body: { authenticationKey: string; presetName: string; distance: string };
  }>("/api/preset/add", async (request, reply) => {
    const { body } = request;
    const userData = await verifyAuthenticatedUser(request.headers, reply);

    if (!body || !("presetName" in body) || !("distance" in body) || !userData) {
      return reply.code(400).send("Missing required field!");
    }
    const { userID } = userData;

    await dbInsert("INSERT INTO presets (presetName, distance, userID) VALUES (?,?,?)", [
      body["presetName"],
      body["distance"],
      userID,
    ]);
    reply.code(200);
  });

  fastify.post<{
    Body: {
      authenticationKey: string;
      presetName: string;
      presetID: string;
      distance: string;
    };
  }>("/api/preset/edit", async (request, reply) => {
    const { body } = request;
    const userData = await verifyAuthenticatedUser(request.headers, reply);

    if (!body || !("presetID" in body) || !("presetName" in body) || !("distance" in body) || !userData) {
      return reply.code(400).send("Missing required field!");
    }

    await dbQuery("UPDATE presets SET presetName=?, distance=? WHERE presetID=?", [
      body["presetName"],
      body["distance"],
      body["presetID"],
    ]);
    reply.code(200);
  });

  fastify.post<{ Body: { authenticationKey: string; presetID: string } }>(
    "/api/preset/delete",
    async (request, reply) => {
      const { body } = request;
      const userData = await verifyAuthenticatedUser(request.headers, reply);

      if (!body || !("presetID" in body) || !userData) {
        return reply.code(400).send("Missing required field!");
      }

      await dbQuery("DELETE FROM presets WHERE presetID=?", [body["presetID"]]);
      reply.code(200);
    }
  );
  done();
};
