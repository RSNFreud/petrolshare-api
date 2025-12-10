import { dbQuery } from "../../hooks";
import { APIResultType } from "../../types";

export const approveAssignedDistance = async ({ reply, logID }: APIResultType & { logID: string }) => {
  dbQuery("UPDATE logs SET approved=1 WHERE logID=?", [logID]);
  reply.code(200);
};
