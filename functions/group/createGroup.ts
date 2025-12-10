import { checkIfLast, dbQuery, generateGroupID, dbInsert, retrieveGroupData } from "../../hooks";
import { APIResultType } from "../../types";

export const createGroup = async ({
  data: { userID },
  reply,
  previousGroupID,
}: APIResultType & { previousGroupID: string }) => {
  const lastInGroup = await checkIfLast(previousGroupID);
  const isPremium = (await retrieveGroupData(previousGroupID))?.premium || false;
  const groupID = await generateGroupID();

  // Insert the new groupID into the groups table
  await dbInsert("INSERT INTO groups (groupID) VALUES (?)", [groupID]);
  // Set the groupID of the user to the new groupID
  await dbQuery("UPDATE users SET groupID=? WHERE userID=?", [groupID, userID]);

  reply.send({
    groupID: groupID,
    message:
      lastInGroup && !isPremium
        ? "You are the last member of this group and as such the group will be deleted within the next 24 hours"
        : "",
  });
};
