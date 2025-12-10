import { FastifyReply, FastifyRequest } from "fastify";
import argon2 from "argon2";
import { dbQuery, generateCode, generateEmailCode, dbInsert, sendMail } from "../../hooks";
import { UserDataType } from "../../types";

export const register = async (
  { body }: FastifyRequest<{ Body: { emailAddress: string; password: string; fullName: string } }>,
  reply: FastifyReply
) => {
  if (!("emailAddress" in body) || !("password" in body) || !("fullName" in body)) {
    return reply.code(400).send("Missing required field!");
  }

  const userData: UserDataType = (
    await dbQuery("SELECT * from users WHERE emailAddress=?", [body["emailAddress"]])
  )?.[0];

  if (userData)
    return reply
      .code(400)
      .send("A user with this email address already exists. Please click 'Forgot Password' to recover your account.");

  const password = await argon2.hash(body["password"]);

  const authenticationKey = await generateCode();
  const emailCode = await generateEmailCode();

  await dbInsert(
    "INSERT INTO users( fullName, emailAddress, password, authenticationKey, verificationCode) VALUES (?,?,?,?,?)",
    [body["fullName"], body["emailAddress"], password, authenticationKey, emailCode]
  );
  sendMail(
    body["emailAddress"],
    "Verify your Mail",
    `Hey ${body["fullName"]},<br><br>Thank you for registering for PetrolShare!<br><br>In order to activate your account, please visit <a href="https://petrolshare.freud-online.co.uk/email/verify?code=${emailCode}" target="__blank">this link!</a><br><br>Thanks,<br><br><b>The PetrolShare Team</b>`
  );

  reply.send(authenticationKey);
};
