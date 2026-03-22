import { FastifyInstance } from "fastify";
import { dbQuery, dbInsert, verifyAuthenticatedUser } from "../hooks";
import { resetDistance } from "../functions/group/resetDistance";
import { createGroup } from "../functions/group/createGroup";
import { checkGroupStatus } from "../functions/user/checkGroupStatus";

export default (fastify: FastifyInstance, _: any, done: () => void) => {
  // Resets the group distance
  fastify.post("/api/group/reset", async ({ headers }, reply) => {
    const user = await verifyAuthenticatedUser(headers, reply);
    if (!user) return;

    await resetDistance({ reply, data: user });
  });

  // Create a new group
  fastify.post<{ Body: { currency: string; distance: string; petrol: string } }>(
    "/api/group/create",
    async ({ headers, body }, reply) => {
      const user = await verifyAuthenticatedUser(headers, reply);
      if (!user) return;

      await createGroup({ data: user, reply, body });
    },
  );

  fastify.post<{
    Body: {
      distance: string;
      petrol: string;
      currency: string;
    };
  }>("/api/group/update", async (request, reply) => {
    const { body } = request;
    const userData = await verifyAuthenticatedUser(request.headers, reply);

    if (!userData || !("distance" in body) || !("petrol" in body) || !("currency" in body)) {
      return reply.code(400).send("Missing required field!");
    }

    const { groupID } = userData;
    await dbQuery("UPDATE groups SET distance=?, petrol=?, currency=? WHERE groupID=?", [
      body["distance"],
      body["petrol"],
      body["currency"],
      groupID,
    ]);
    await resetDistance({ reply, data: userData });
  });

  fastify.get("/api/group/get", async (request, reply) => {
    const userData = await verifyAuthenticatedUser(request.headers, reply);

    if (!userData) return;

    const { groupID } = userData;
    const res = await dbQuery("SELECT * FROM groups WHERE groupID=?", [groupID]);
    if (!res) return;
    reply.send(res[0]);
  });

  fastify.post("/api/group/subscribe", async (request, reply) => {
    const userData = await verifyAuthenticatedUser(request.headers, reply);

    if (!userData) return;

    const { groupID } = userData;

    const res = await dbInsert("UPDATE groups SET premium=1 WHERE groupID=?", [groupID]);
    reply.code(200).send(res?.changedRows);
  });

  fastify.post("/api/group/unsubscribe", async (request, reply) => {
    const userData = await verifyAuthenticatedUser(request.headers, reply);

    if (!userData) return;

    const { groupID } = userData;

    const res = await dbInsert("UPDATE groups SET premium=0 WHERE groupID=?", [groupID]);
    reply.code(200).send(res?.changedRows);
  });

  fastify.get("/api/group/get-members", async (request, reply) => {
    const userData = await verifyAuthenticatedUser(request.headers, reply);

    if (!userData) return;

    const { groupID } = userData;

    const res = await dbQuery("SELECT fullName, userID FROM users WHERE groupID=?", [groupID]);
    if (!res) return;

    reply.send(res);
  });

  fastify.post<{ Body: { groupID: string } }>("/api/group/validate-id", async (request, reply) => {
    const userData = await verifyAuthenticatedUser(request.headers, reply);

    const { body } = request;

    if (!userData || !body?.groupID) {
      return reply.code(400).send("Missing required field!");
    }

    return checkGroupStatus({ data: userData, reply, newGroupID: body.groupID });
  });

  done();
};
