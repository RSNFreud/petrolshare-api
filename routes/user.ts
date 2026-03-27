import argon2 from "argon2";
import { dbQuery, generateCode, verifyAuthenticatedUser, getData, dbInsert } from "../hooks";
import { FastifyInstance } from "fastify";
import { login } from "../functions/user/login";
import { register } from "../functions/user/register";
import { deactiveAccount } from "../functions/user/deactivateAccount";
import { changeGroup } from "../functions/user/changeGroup";
import { changeEmail } from "../functions/user/changeEmail";
import { forgotPassword } from "../functions/user/forgotPassword";

export default (fastify: FastifyInstance, _: any, done: () => void) => {
  // Login
  fastify.post<{ Body: { emailAddress: string; password: string } }>("/api/user/login", async (request, reply) => {
    await login(request, reply);
  });

  // Register
  fastify.post<{
    Body: { emailAddress: string; password: string; fullName: string };
  }>("/api/user/register", async (request, reply) => {
    await register(request, reply);
  });

  // Deactivate a users account
  fastify.post("/api/user/deactivate", async ({ headers }, reply) => {
    const user = await verifyAuthenticatedUser(headers, reply);
    if (!user) return;
    await deactiveAccount({ reply, data: user });
  });

  // Change the group of a user
  fastify.post<{ Body: { groupID: string } }>("/api/user/change-group", async ({ body, headers }, reply) => {
    const user = await verifyAuthenticatedUser(headers, reply);
    if (!user) return;

    if (!("groupID" in body)) {
      return reply.code(400).send("Missing required field!");
    }

    await changeGroup({ data: user, reply, newGroupID: body.groupID });
  });

  fastify.post<{ Body: { newEmail: string } }>("/api/user/change-email", async ({ body, headers }, reply) => {
    const user = await verifyAuthenticatedUser(headers, reply);
    if (!user) return;
    if (!("newEmail" in body)) {
      return reply.code(400).send("Missing required field!");
    }

    await changeEmail({ data: user, newEmail: body.newEmail, reply });
  });

  // Send password request email
  fastify.post<{ Body: { emailAddress: string } }>("/api/user/forgot-password", async (request, reply) => {
    const { body } = request;

    if (!("emailAddress" in body)) {
      return reply.code(400).send("Missing required field!");
    }
    await forgotPassword({ reply, emailAddress: body.emailAddress });
  });

  // Change name of a user
  fastify.post<{ Body: { newName: string } }>("/api/user/change-name", async ({ body, headers }, reply) => {
    const user = await verifyAuthenticatedUser(headers, reply);
    if (!user) return;

    if (!("newName" in body)) {
      return reply.code(400).send("Missing required field!");
    }

    await dbQuery("UPDATE users SET fullName=? WHERE userID=?", [body["newName"], user.userID]);
  });

  // Change the password of a user
  fastify.post<{ Body: { newPassword: string } }>("/api/user/change-password", async ({ body, headers }, reply) => {
    const user = await verifyAuthenticatedUser(headers, reply);
    if (!user) return;

    if (!("newPassword" in body)) {
      return reply.code(400).send("Missing required field!");
    }
    const password = await argon2.hash(body["newPassword"]);

    await dbQuery("UPDATE users SET password=?, authenticationKey=null WHERE userID=?", [password, user.userID]);
  });

  // Fetch user data
  fastify.get("/api/user/fetch", async ({ headers }, reply) => {
    const user = await verifyAuthenticatedUser(headers, reply);
    if (!user) return;
    const code = user.authenticationKey || (await generateCode());
    await dbInsert("UPDATE users SET lastActive=? WHERE userID=?", [new Date(), user.userID]);
    reply.code(200).send(await getData(user, code));
  });

  done();
};
