import { dbQuery, generateCode, dbInsert, getData } from "../../hooks";
import { FastifyReply, FastifyRequest } from "fastify";
import argon2 from "argon2";
import { UserDataType } from "../../types";

export const login = async (
  { body }: FastifyRequest<{ Body: { emailAddress: string; password: string } }>,
  reply: FastifyReply
) => {
  if (!("emailAddress" in body) || !("password" in body)) {
    return reply.code(400).send("Missing required field!");
  }

  const userData: UserDataType = (
    await dbQuery("SELECT * from users WHERE emailAddress=?", [body["emailAddress"]])
  )?.[0];

  if (!userData) return reply.code(400).send("Incorrect username or password.");

  if (!userData.verified) {
    return reply.code(400).send("Please verify your account!");
  }

  if (!userData.active) {
    return reply.code(400).send("Your account has been deactivated! Please check your email to reactivate");
  }

  const isCorrectPassword = await argon2.verify(userData.password, body["password"]);
  if (!isCorrectPassword) {
    return reply.code(400).send("Incorrect username or password.");
  }

  const authenticationKey = userData.authenticationKey || (await generateCode());
  const data = await getData(userData, authenticationKey);

  await reply.code(200).send(data);

  if (!userData.authenticationKey) {
    await dbInsert("UPDATE users SET authenticationKey=? WHERE emailAddress=?", [
      authenticationKey,
      body["emailAddress"],
    ]).catch((err) => console.log(err));
  }
};
