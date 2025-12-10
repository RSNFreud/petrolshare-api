import { dbQuery, generateEmailCode, sendMail } from "../../hooks";
import { APIResultType } from "../../types";

export const deactiveAccount = async ({ data: { userID, emailAddress } }: APIResultType) => {
  const emailCode = await generateEmailCode();

  await dbQuery("UPDATE users SET active=0, verificationCode=? WHERE userID=?", [emailCode, userID]);

  sendMail(
    emailAddress,
    "PetrolShare - Account Deactivation",
    `Hi!<br><br>We have received a request to deactivate your account. Please click <a href="https://petrolshare.freud-online.co.uk/email/deactivate?code=${emailCode}" target="_blank">here<a/> to confirm this change.<br><br>If this wasn't requested by you, feel free to ignore this and nothing will happen.<br><br>Thanks<br>The PetrolShare Team`
  );
};
