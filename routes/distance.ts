import { FastifyInstance } from "fastify";
import { verifyAuthenticatedUser } from "../hooks";
import { addDistance } from "../functions/distance/addDistance";
import { assignDistance } from "../functions/distance/assignDistance";
import { rejectAssignedDistance } from "../functions/distance/rejectAssignedDistance";
import { approveAssignedDistance } from "../functions/distance/approveAssignedDistance";
import { checkAssignedDistance } from "../functions/distance/checkAssignedDistance";

export default (fastify: FastifyInstance, _: any, done: () => void) => {
  // Add distance to the user
  fastify.post<{ Body: { distance: string } }>("/api/distance/add", async ({ headers, body }, reply) => {
    const user = await verifyAuthenticatedUser(headers, reply);
    if (!user) return;

    if (!("distance" in body)) {
      return reply.code(400).send("Missing required field!");
    }

    await addDistance({ reply, data: user, distance: body.distance });
  });

  // Assign distance to another user
  fastify.post<{
    Body: { distance: string; userID: string };
  }>("/api/distance/assign", async ({ headers, body }, reply) => {
    const user = await verifyAuthenticatedUser(headers, reply);
    if (!user) return;

    if (!("distance" in body) || !("userID" in body)) {
      return reply.code(400).send("Missing required field!");
    }
    await assignDistance({ reply, data: user, distance: body.distance, userID: body.userID });
  });

  // Reject the distance assigned to you by another user
  fastify.post<{ Body: { logID: string } }>("/api/distance/assign/reject", async ({ headers, body }, reply) => {
    const user = await verifyAuthenticatedUser(headers, reply);
    if (!user) return;

    if (!("logID" in body)) {
      return reply.code(400).send("Missing required field!");
    }

    await rejectAssignedDistance({ reply, logID: body.logID, data: user });
  });

  // Approve the distance assigned to you by another user
  fastify.post<{ Body: { logID: string } }>("/api/distance/assign/approve", async ({ headers, body }, reply) => {
    const user = await verifyAuthenticatedUser(headers, reply);
    if (!user) return;

    if (!("logID" in body)) {
      return reply.code(400).send("Missing required field!");
    }

    await approveAssignedDistance({ reply, logID: body.logID, data: user });
  });

  // Checks if a user has been assigned a distance
  fastify.get("/api/distance/assign", async ({ headers }, reply) => {
    const user = await verifyAuthenticatedUser(headers, reply);
    if (!user) return;
    await checkAssignedDistance({ reply, data: user });
  });

  done();
};
