import { OkPacket } from "mysql";
require("dotenv").config();
import nodemailer from "nodemailer";
import { conn } from ".";
import Expo, { ExpoPushTicket } from "expo-server-sdk";
import { FastifyRequest, FastifyReply } from "fastify";
import { GroupDataType, UserDataType } from "./types";

export const sendMail = async (address: string, subject: string, message: string) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  try {
    let info = await transporter.sendMail({
      from: '"PetrolShare" <petrolshare@freud-online.co.uk>',
      to: address,
      subject: subject,
      html: message,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.log("Google blocked email sending!");
  }
};

export async function dbQuery(query: string, parameters?: Array<string | Date | undefined>) {
  return new Promise<any[]>((res, rej) => {
    try {
      conn.query(query, parameters, (err, results) => {
        if (err) rej(err);
        res(results);
      });
    } catch (err) {
      rej(err);
    }
  });
}

export async function dbInsert(query: string, parameters?: Array<string | boolean | undefined | number>) {
  return new Promise<OkPacket>((res, rej) => {
    try {
      conn.query(query, parameters, (err, results) => {
        if (err) rej(err);
        res(results);
      });
    } catch (err) {
      console.log("====================================");
      console.log(err);
      console.log("====================================");
      rej(err);
    }
  });
}

export const generateEmailCode = async (): Promise<string> => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (var i = 0; i < 25; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  if ((await dbQuery("SELECT * from users where verificationCode=?", [result])).length) return generateEmailCode();
  return result;
};
export const generateUniqueURL = async (): Promise<string> => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (var i = 0; i < 25; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  if ((await dbQuery("SELECT * from invoices where uniqueURL=?", [result])).length) return generateUniqueURL();
  return result;
};

export const generateCode = async (): Promise<string> => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (var i = 0; i < 25; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  if ((await dbQuery("SELECT * from users where authenticationKey=?", [result])).length) return generateCode();
  return result;
};

export const generateTempPassword = () => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*+=";
  const charactersLength = characters.length;
  for (var i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

export const generateGroupID = async (): Promise<string> => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (var i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  const isExist = await dbQuery("SELECT null FROM groups WHERE groupID=?", [result]);

  if (isExist.length) return generateGroupID();

  return result;
};

export const retrieveSessionID = async (groupID: string): Promise<string> => {
  let res: OkPacket | { sessionID: string }[] = await dbQuery(
    "SELECT sessionID FROM sessions WHERE groupID=? AND sessionActive=true",
    [groupID]
  );
  if (!res.length) {
    res = await dbInsert("INSERT INTO sessions (sessionStart, groupID, sessionActive) VALUES (?,?,?)", [
      Date.now().toString(),
      groupID,
      "1",
    ]);
    return String(res.insertId);
  }
  return res[0].sessionID;
};

export const retrieveData = async (authenticationKey: string): Promise<UserDataType | null> =>
  (
    await dbQuery(
      "SELECT userID, fullName, groupID, active, emailAddress, notificationKey FROM users WHERE authenticationKey=?",
      [authenticationKey]
    )
  )?.[0];

export const retrieveGroupData = async (groupID: string): Promise<GroupDataType | null> =>
  (await dbQuery("SELECT distance, petrol, currency, premium FROM groups WHERE groupID=?", [groupID]))?.[0];

export const deleteEmptyGroups = async () => {
  const currentGroups = await dbQuery("SELECT u.groupID, g.premium FROM users u LEFT JOIN groups g USING (groupID)");
  const allGroups = await dbQuery("SELECT groupID, premium FROM groups");

  allGroups.map(async ({ groupID, premium }) => {
    if (currentGroups.filter(({ groupID: id }) => id === groupID).length || premium) return;
    await dbQuery("DELETE FROM groups WHERE groupID=?", [groupID]);
  });
};

export const checkIfLast = async (groupID: string) => {
  const lastUser = (await dbQuery("SELECT null FROM users WHERE groupID=?", [groupID])).length;
  return Boolean(lastUser);
};

export const sendNotification = async (
  notifKeys: Array<{ notificationKey: string }>,
  message: string,
  route?: { route: string; invoiceID?: number }
) => {
  let expo = new Expo({});

  if (!notifKeys) return;
  let messages = [];

  for (let pushToken of notifKeys) {
    if (!pushToken["notificationKey"]) continue;

    // // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken["notificationKey"])) {
      console.error(`Push token ${pushToken["notificationKey"]} is not a valid Expo push token`);
      continue;
    }

    // // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    messages.push({
      to: pushToken["notificationKey"],
      body: message,
      data: route && { route: route.route, invoiceID: route.invoiceID },
    });
  }

  if (!messages) return;
  let chunks = expo.chunkPushNotifications(messages);
  let tickets: ExpoPushTicket[] = [];
  (async () => {
    for (let chunk of chunks) {
      try {
        console.log("Sending notification...");

        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
  })();
  let receiptIds: string[] = [];
  for (let ticket of tickets) {
    // NOTE: Not all tickets have IDs; for example, tickets for notifications
    // that could not be enqueued will have error information and no receipt ID.
    if ("id" in ticket) {
      receiptIds.push(ticket?.id);
    }
  }

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    // Like sending notifications, there are different strategies you could use
    // to retrieve batches of receipts from the Expo service.
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);

        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (let receiptId in receipts) {
          let reciept = receipts[receiptId];
          if (reciept.status === "ok") {
            continue;
          } else if (reciept.status === "error") {
            console.error(`There was an error sending a notification: ${reciept.message}`);
            if (reciept.details && reciept.details.error) {
              console.error(`The error code is ${reciept.details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  })();
};

export const getName = async (userID: string): Promise<string | null> =>
  (await dbQuery("SELECT fullName FROM users WHERE userID=?", [userID]))?.[0]?.fullName || null;

export const verifyAuthenticatedUser = async (
  headers: FastifyRequest["headers"],
  reply: FastifyReply
): Promise<UserDataType | null> => {
  const authHeader = headers["authorization"]?.replace("Bearer ", "").trim();

  if (!authHeader) {
    reply.code(400).send("Missing authentication key!");
    return null;
  }

  const user = await retrieveData(authHeader);

  if (!user) {
    reply.code(400).send("Invalid authentication key!");
    return null;
  }

  return { ...user, authenticationKey: authHeader };
};

export const getData = async (userData: UserDataType, authenticationKey: string) => {
  const { groupID, userID, fullName, emailAddress } = userData;
  const groupData = await retrieveGroupData(groupID);

  const distance = await dbQuery(
    "SELECT l.distance, s.sessionActive from logs l LEFT JOIN sessions s USING (sessionID) WHERE userID=? AND s.sessionActive=1 AND s.groupID=? AND approved=1",
    [userID, groupID]
  );

  let total = 0;
  distance.map(({ distance }) => {
    total += distance;
  });

  return {
    fullName: fullName,
    groupID: groupID,
    emailAddress: emailAddress,
    authenticationKey: authenticationKey,
    userID: userID,
    currentMileage: Math.round(total * 100) / 100,
    ...groupData,
  };
};
