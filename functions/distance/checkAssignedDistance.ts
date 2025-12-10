import { dbQuery, getName, retrieveSessionID } from "../../hooks";
import { APIResultType } from "../../types";

export const checkAssignedDistance = async ({ reply, data: { userID, groupID } }: APIResultType) => {
  const sessionID = await retrieveSessionID(groupID);

  const groupData = (
    await dbQuery("SELECT distance, assignedBy, logID FROM logs WHERE sessionID=? AND approved=0 AND userID=?", [
      sessionID.toString(),
      userID,
    ])
  )?.[0];

  if (!groupData) return reply.code(200);

  reply.send({
    distance: groupData[0].distance,
    assignedBy: await getName(groupData.assignedBy),
    id: groupData[0].logID,
  });
};
