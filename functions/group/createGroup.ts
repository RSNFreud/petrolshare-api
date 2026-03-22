import { dbQuery, generateGroupID, dbInsert } from "../../hooks";
import { APIResultType } from "../../types";

export const createGroup = async ({
  data: { userID },
  reply,
  body,
}: APIResultType & {
  body: {
    currency: string;
    distance: string;
    petrol: string;
  };
}) => {
  const groupID = await generateGroupID();
  const { currency, distance, petrol } = body;

  // Insert the new groupID into the groups table
  await dbInsert("INSERT INTO groups (groupID, distance, petrol, currency) VALUES (?,?,?,?)", [
    groupID,
    distance,
    petrol,
    currency,
  ]);
  // Set the groupID of the user to the new groupID
  await dbQuery("UPDATE users SET groupID=? WHERE userID=?", [groupID, userID]);

  reply.send(groupID);
};
