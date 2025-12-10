import { dbInsert, dbQuery, retrieveGroupData, retrieveSessionID, sendNotification } from "../../hooks";
import { APIResultType, UserDataType } from "../../types";

export const assignDistance = async ({
  data: { userID, groupID, fullName },
  reply,
  userID: assigneeUserID,
  distance,
}: APIResultType & { userID: string; distance: string }) => {
  const sessionID = await retrieveSessionID(groupID);
  const groupData = await retrieveGroupData(groupID);

  const user: UserDataType | null = (
    await dbQuery("SELECT notificationKey FROM users WHERE userID=?", [assigneeUserID])
  )?.[0];
  if (!user || !groupData) return reply.send(400);

  if (!user.notificationKey)
    return reply.status(412).send("The user has not set up notifications yet and cannot be notified.");

  sendNotification(
    [{ notificationKey: user.notificationKey }],
    `${fullName} has requested to add the distance of ${distance}${groupData.distance} to your account! Click on this notification to respond`,
    { route: "Dashboard" }
  );

  dbInsert("INSERT INTO logs(userID, distance, date, sessionID, approved, assignedBy) VALUES(?,?,?,?,0,?)", [
    assigneeUserID,
    distance,
    Date.now().toString(),
    sessionID.toString(),
    userID,
  ]);

  reply.code(200);
};
