import { dbQuery, generateEmailCode, sendMail } from "../../hooks";
import { APIResultType } from "../../types";

export const forgotPassword = async ({
  reply,
  emailAddress,
}: Omit<APIResultType, "data"> & { emailAddress: string }) => {
  const emailCode = await generateEmailCode();
  const results = await dbQuery("SELECT emailAddress FROM users WHERE emailAddress=?", [emailAddress]);
  if (!results.length) return reply.code(400).send("There is no user with that email address");
  await dbQuery("UPDATE users SET verificationCode=? WHERE emailAddress=?", [emailCode, emailAddress]);

  sendMail(
    emailAddress,
    "PetrolShare - Forgot your Password",
    `Hi!<br><br>We have received a request to reset your password. Please click <a href="https://petrolshare.freud-online.co.uk/email/reset-password?code=${emailCode}" target="_blank">here<a/> to confirm this change.<br><br>If this wasn't requested by you, feel free to ignore this and nothing will happen.<br><br>Thanks<br>The PetrolShare Team`
  );
};
