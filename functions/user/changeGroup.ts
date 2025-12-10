import { dbQuery, retrieveGroupData } from "../../hooks";
import { APIResultType } from "../../types";

const MAX_GROUP_MEMBERS = 2;

export const changeGroup = async ({
  data: { userID, groupID },
  reply,
  newGroupID,
}: APIResultType & { newGroupID: string }) => {
  let cleanGroupID = newGroupID;
  if (cleanGroupID.includes("petrolshare.freud-online.co.uk")) {
    cleanGroupID = cleanGroupID.split("groupID=")[1];
  }
  const results = await retrieveGroupData(cleanGroupID);

  if (!results) return reply.code(400).send("There was no group found with that ID!");

  const isPreviousGroupPremium = (await dbQuery("SELECT premium FROM groups WHERE groupID=?", [groupID]))[0]?.premium;
  const isNewGroupPremium = results?.premium;
  const groupMemberCount = await dbQuery("SELECT null FROM users WHERE groupID=?", [cleanGroupID]);
  const lastInGroup = Boolean(groupMemberCount.length);

  if (!isNewGroupPremium && groupMemberCount.length >= MAX_GROUP_MEMBERS)
    return reply
      .code(400)
      .send(
        "This group has reached the max member count. To join, they need to upgrade to Premium by clicking the banner inside the app."
      );

  await dbQuery("UPDATE users SET groupID=? WHERE userID=?", [newGroupID, userID]);

  reply.send({
    groupID: newGroupID,
    message:
      lastInGroup && !isPreviousGroupPremium
        ? "You are the last member of this group and as such the group will be deleted within the next 24 hours"
        : "",
  });
};
