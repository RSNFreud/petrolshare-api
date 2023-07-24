import { FastifyInstance } from "fastify";
import { dbInsert, dbQuery, retrieveGroupID, retrieveID } from "../hooks";

export default (fastify: FastifyInstance, _: any, done: () => void) => {

    fastify.post<{
        Body: {
            authenticationKey: string; allDay: string, startDate: string, startTime?: string, endDate: string, endTime?: string, summary: string, repeating: string, custom: { number: string, repeatingFormat: string, repeatingDays: string[], ends: { option: string, endDate: string } }
        }
    }>("/api/schedules/add", async (request, reply) => {
        const { body } = request;

        if (
            !body ||
            !("startDate" in body) ||
            !("allDay" in body) ||
            !("endDate" in body) ||
            !("authenticationKey" in body)
        ) {
            return reply.code(400).send("Missing required field!");
        }

        let groupID = await retrieveGroupID(body["authenticationKey"]);
        let userID = await retrieveID(body["authenticationKey"]);
        if (!groupID || !userID) return reply.code(400).send("No user found!");

        const startDate = convertToDate(body.startDate, body.startTime, Boolean(body.allDay))
        const endDate = convertToDate(body.endDate, body.endTime, Boolean(body.allDay))

        if (startDate.getTime < new Date().getTime) {
            return reply.code(400).send("Please choose a valid date time combination!")
        }

        const tempStart = new Date(startDate)
        const endTimeInterval = new Date(tempStart.setMinutes(tempStart.getMinutes() + 29))


        if (!body.allDay && (endDate.getTime() <= endTimeInterval.getTime())) {
            return reply.code(400).send("Please choose a valid end date combination more then 30 minutes after your start time!")
        }
        if (body.repeating !== "notRepeating") return
        const isUnique = await checkForDuplicates(groupID, convertToDate(body.startDate, body.startTime), convertToDate(body.endDate, body.endTime))

        console.log(isUnique.length, isUnique);


        if (isUnique.length === 0) {

            // dbInsert("INSERT INTO schedules(allDay, startDate, endDate, summary, groupID, userID) VALUES (?,?,?,?,?,?)", [body.allDay, startDate, endDate, body.summary, groupID, userID])
            reply.code(200);
        } else reply.code(400).send("There is a schedule in the date range selected already!")

    });

    fastify.get<{
        Querystring: { authenticationKey: string }
    }>("/api/schedules/get", async (request, reply) => {
        const { query } = request;

        if (!query || !("authenticationKey" in query)) {
            return reply.code(400).send("Missing required field!");
        }

        const groupID = await retrieveGroupID(query["authenticationKey"]);
        if (!groupID) return reply.code(400).send("No group found!");

        const data: { startDate: Date, endDate: Date, allDay: boolean, summary?: string, userID: string }[] = await dbQuery('SELECT startDate, endDate, allDay, summary, userID FROM schedules WHERE groupID=?', [groupID])
        console.log(data);


        for (let i = 0; i < data.length; i++) {
            let value = data[i];
            const name = await dbQuery('SELECT fullName, emailAddress FROM users WHERE userID=?', [value.userID]);
            if (name) data[i] = { ...value, ...name[0] };
        }
        reply.send(data);
    });

    done()
}

const checkForDuplicates = async (groupID: string, startDate: Date, endDate: Date) => {
    const dates = await dbQuery('SELECT startDate, endDate, userID FROM schedules WHERE groupID=?', [groupID])

    for (let i = 0; i < dates.length; i++) {
        const dateRow: { startDate: Date, endDate: Date, userID: string } = dates[i];
        console.log(startDate.toLocaleDateString(), dateRow.startDate.toLocaleDateString(), endDate.toLocaleDateString(), dateRow.endDate.toLocaleDateString());
        // Check if start time is after everyones end time
        if (startDate.getTime() >= dateRow.startDate.getTime() && endDate.getTime() <= dateRow.endDate.getTime()) return dateRow.userID

        // Check if end date isnt in the middle of another schedule
        if (endDate.getTime() === dateRow.endDate.getTime() || startDate.getTime() === dateRow.startDate.getTime()) return dateRow.userID

        if (dateRow.startDate.getTime() >= startDate.getTime() && endDate.getTime() <= dateRow.endDate.getTime()) return dateRow.userID
    }

    return ""
    // check if start is after end time
}

const convertToDate = (date: string, time?: string, allDay?: boolean) => {
    let dateObj = new Date(date)
    dateObj = new Date(dateObj.setUTCHours(0, 0, 0, 0))

    if (allDay || !time) return dateObj
    const timeObj = new Date(time)

    return new Date(`${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()} ${timeObj.getHours()}:${timeObj.getMinutes()}:00`);

}

