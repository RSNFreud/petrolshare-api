import { dbInsert, dbQuery, retrieveSessionID } from "../../hooks";
import { APIResultType } from "../../types";

export const addDistance = async ({ data: { userID }, reply, distance }: APIResultType & { distance: string }) => {
  const results = (await dbQuery("SELECT * FROM users WHERE userID=?", [userID]))?.[0];
  if (!results) return reply.code(400).send("This user does not exist!");

  const sessionID = await retrieveSessionID(results.groupID);

  dbInsert("INSERT INTO logs(userID, distance, date, sessionID) VALUES(?,?,?,?)", [
    results.userID,
    distance,
    Date.now(),
    sessionID,
  ]);

  reply.code(200);
};
