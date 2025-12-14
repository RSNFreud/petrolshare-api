import { FastifyReply } from "fastify";
import { dbQuery, generateUniqueURL, dbInsert } from "../../hooks";

export const getInvoice = async ({ invoiceID, reply }: { reply: FastifyReply; invoiceID: string }) => {
  const [results]: {
    fullName: string;
    invoiceData: string;
    totalDistance: string;
    sessionEnd: string;
    totalPrice: string;
    uniqueURL: string;
    groupID: string;
  }[] = await dbQuery(
    "SELECT u.fullName, i.invoiceData, i.totalDistance, i.uniqueURL, i.pricePerLiter, s.sessionEnd, s.groupID, i.totalPrice, u.emailAddress FROM invoices i LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u USING (userID) WHERE i.invoiceID=?",
    [invoiceID]
  );
  if (!results) return reply.code(400).send("There are no invoices with that ID!");

  const [groupData] = await dbQuery("SELECT distance, currency, petrol FROM groups WHERE groupID=?", [results.groupID]);

  const invoiceData = JSON.parse(results.invoiceData) as {
    [key: string]: {
      distance: number;
      liters: number;
      emailAddress: string;
      fullName: string;
      paymentDue: number;
      paid: boolean;
    };
  };

  const dataWithNames = await Promise.all(
    Object.entries(invoiceData).map(async ([userID, originalData]) => {
      const name = await dbQuery("SELECT fullName, emailAddress FROM users WHERE userID=?", [userID]);
      return {
        ...originalData,
        fullName: name[0]?.fullName || originalData.fullName,
        userID,
      };
    })
  );

  const uniqueURL = results?.uniqueURL || (await generateUniqueURL());

  const dbFormat = dataWithNames.reduce((acc, data) => ({ ...acc, [data.userID || 0]: data }), {});

  await dbInsert("UPDATE invoices SET invoiceData=?, uniqueURL=? WHERE invoiceID=?", [
    JSON.stringify(dbFormat),
    uniqueURL,
    invoiceID,
  ]);
  reply.send({ ...results, invoiceData: JSON.stringify(dataWithNames), uniqueURL, ...groupData });
};
