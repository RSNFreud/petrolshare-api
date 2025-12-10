import { dbQuery, generateEmailCode, sendMail } from "../../hooks";
import { APIResultType } from "../../types";

export const changeEmail = async ({ data: { userID }, newEmail }: APIResultType & { newEmail: string }) => {
  const emailCode = await generateEmailCode();

  await dbQuery("UPDATE users SET verificationCode=?, tempEmail=? WHERE userID=?", [emailCode, newEmail, userID]);

  sendMail(
    newEmail,
    "PetrolShare - Change Email Address",
    `Hi!<br><br>We have received a request to change your email to this address. Please click <a href="https://petrolshare.freud-online.co.uk/email/verify?code=${emailCode}" target="_blank">here<a/> to confirm this change.<br><br>If this wasn't requested by you, feel free to ignore this and nothing will happen.<br><br>Thanks<br>The PetrolShare Team`
  );
};
