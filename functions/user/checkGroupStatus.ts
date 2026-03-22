import { retrieveGroupData } from "../../hooks";
import { APIResultType } from "../../types";

export const checkGroupStatus = async ({ data, reply, newGroupID }: APIResultType & { newGroupID: string }) => {
  const { groupID } = data;
  const results = await retrieveGroupData(newGroupID);

  if (!results) return reply.code(400).send("There was no group found with that ID!");
  if (groupID === newGroupID) return reply.code(400).send("You are already in this group!");

  return reply.send(200);
};
