import { dbInsert, dbQuery } from "../../hooks";
import { APIResultType } from "../../types";

export const resetDistance = async ({ reply, data }: APIResultType) => {
  if (!data || !data.groupID) {
    return reply.code(400).send("Missing required field!");
  }

  const { groupID } = data;
  await dbQuery("UPDATE sessions SET sessionActive=0, sessionEnd=? WHERE groupID=?", [Date.now().toString(), groupID]);
  await dbInsert("INSERT INTO sessions (sessionStart, groupID, sessionActive) VALUES (?,?,?)", [
    Date.now().toString(),
    groupID,
    "1",
  ]);
  await reply.code(200).send();
};
