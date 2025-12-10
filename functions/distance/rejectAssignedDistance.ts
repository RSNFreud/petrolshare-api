import { dbQuery } from "../../hooks";
import { APIResultType } from "../../types";

export const rejectAssignedDistance = async ({ reply, logID }: APIResultType & { logID: string }) => {
  dbQuery("DELETE FROM logs WHERE logID=?", [logID]);
  reply.code(200);
};
