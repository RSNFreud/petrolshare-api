import { FastifyReply } from "fastify";
import { dbQuery } from "../../hooks";

type FlatSession = {
  sessionID: string;
  sessionActive?: boolean;
  sessionStart?: string;
  sessionEnd?: string;
  logs: {
    fullName: string;
    distance: number;
    date: string;
    logID: string;
    pending: boolean;
  }[];
};

export const getSortedLogs = async (groupID: string, reply: FastifyReply) => {
  const sessions: { sessionStart: string; sessionEnd: string; sessionActive?: boolean; sessionID: string }[] =
    await dbQuery("SELECT sessionStart, sessionEnd, sessionActive, sessionID FROM sessions WHERE groupID = ?", [
      groupID,
    ]);
  if (!sessions) return reply.code(400).send("There are no sessions to be found");

  const logs: {
    groupID: string;
    fullName: string;
    distance: number;
    date: string;
    logID: string;
    approved: boolean;
    sessionID: string;
    userID: string;
  }[] = await dbQuery(
    "SELECT s.groupID, u.fullName, l.distance, l.date, l.logID, l.approved, l.userID, s.sessionID FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON u.userID = l.userID WHERE s.groupID = ? ORDER BY l.date DESC",
    [groupID],
  );

  const flat: {
    [key: string]: {
      sessionID?: string;
      sessionActive?: boolean;
      sessionStart?: string;
      sessionEnd?: string;
      logs: Array<any>;
    };
  } = {};
  sessions.map(({ sessionEnd, sessionID, sessionStart, sessionActive }) => {
    flat[sessionID] = {
      sessionID,
      sessionActive,
      sessionStart,
      sessionEnd,
      logs: [],
    };
  });

  logs.map((e) => {
    if (!flat[e.sessionID]) flat[e.sessionID] = { logs: [] };

    flat[e.sessionID] = {
      ...flat[e.sessionID],
      logs: [
        ...flat[e.sessionID].logs,
        {
          fullName: e.fullName,
          distance: e.distance,
          userID: e.userID,
          date: e.date,
          logID: e.logID,
          pending: !e.approved,
        },
      ],
    };
  });

  const sortedArr = Object.values(flat).sort((a, b) => String(b.sessionStart).localeCompare(String(a.sessionStart)));

  return sortedArr;
};
