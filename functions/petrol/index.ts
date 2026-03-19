import { dbQuery } from "../../hooks";

export type ResultsDBResponseType = {
  distance: string;
  sessionActive: boolean;
  initialOdometer: number;
  sessionID: number;
  fullName: string;
  notificationKey: string;
  userID: string;
};

export const getLogs = async (groupID: string): Promise<ResultsDBResponseType[] | null> => {
  const results = await dbQuery(
    "SELECT l.distance, s.sessionActive, s.initialOdometer, s.sessionID, u.fullName, u.notificationKey, u.userID FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON l.userID = u.userID WHERE s.groupID=? AND s.sessionActive=1 AND l.approved=1",
    [groupID],
  );

  return results;
};
