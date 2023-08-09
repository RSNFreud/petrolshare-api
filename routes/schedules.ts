import { FastifyInstance } from "fastify";
import { dbInsert, dbQuery, retrieveGroupID, retrieveID } from "../hooks";

export default (fastify: FastifyInstance, _: any, done: () => void) => {

    fastify.post<{
        Body: {
            authenticationKey: string; allDay: string, startDate: string, endDate: string, summary: string, repeating: string, custom: { number: string, repeatingFormat: string, repeatingDays: string[], endDate: string }
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

        const startDate = new Date(body.startDate)
        const endDate = new Date(body.endDate)

        if (startDate.getTime() < new Date().getTime()) {
            return reply.code(400).send("Please choose a valid date time combination!")
        }

        const tempStart = new Date(startDate)

        const endTimeInterval = new Date(tempStart.setMinutes(tempStart.getMinutes() + 29))

        if (!body.allDay && (endDate.getTime() <= endTimeInterval.getTime())) {
            return reply.code(400).send("Please choose a valid end date combination more then 30 minutes after your start time!")
        }

        const isUnique = await checkForDuplicates(groupID, startDate, endDate)
        let linkedID
        if (isUnique.length === 0) {
            const { insertId } = await dbInsert("INSERT INTO schedules(allDay, startDate, endDate, summary, groupID, userID) VALUES (?,?,?,?,?,?)", [body.allDay, startDate, endDate, body.summary, groupID, userID])
            linkedID = insertId
        } else return reply.code(400).send("There is a schedule in the date range selected already!")

        if (body.repeating === 'notRepeating') return reply.code(200).send()
        let interval = 0
        let limit = 365
        let count = 1;
        const invalidDates = []
        let repeatingFormat = 'day';

        switch (body.repeating) {
            case 'weekly':
                interval = 7
                limit = 52 * 2
                break;
            case 'monthly':
                repeatingFormat = 'monthly'
                interval = 1
                limit = 24
                break;
            case 'daily':
            case 'custom':
                interval = 1
                limit = 365
                break;
            default:
                break;
        }

        if (body.repeating === "custom" && body.custom.repeatingFormat !== "monthly") interval = 1
        if (body.repeating === "custom" && body.custom.repeatingFormat === "weekly") limit = 52 * 2
        if (body.repeating === "custom" && body.custom.repeatingFormat === "monthly") {
            limit = 24
            repeatingFormat = 'monthly'
        }
        if (body.repeating === "custom" && parseInt(body.custom.number) > 1) interval = interval * parseInt(body.custom.number)
        limit--
        while (count !== limit) {
            let tempStart = new Date(startDate)
            let tempEnd = new Date(endDate)
            let start = new Date(tempStart.setDate(startDate.getDate() + (interval * count)))
            let end = new Date(tempEnd.setDate(endDate.getDate() + (interval * count)))

            if (body.repeating === "custom" && start > new Date(body.custom.endDate)) {
                count = limit
                continue;
            }

            count++
            if (body.repeating === "custom" && body.custom.repeatingDays.length && body.custom.repeatingFormat === 'weekly' && !(body.custom.repeatingDays.filter(day => parseInt(day) === start.getDay()).length)) continue
            if (repeatingFormat === "monthly") {
                start = new Date(tempStart.setMonth(startDate.getMonth() + (interval * count)))
                end = new Date(tempEnd.setMonth(endDate.getMonth() + (interval * count)))
            }

            const isUnique = await checkForDuplicates(groupID, start, end)
            if (isUnique.length === 0) {
                dbInsert("INSERT INTO schedules(allDay, startDate, endDate, summary, groupID, userID, linkedSessionID) VALUES (?,?,?,?,?,?,?)", [body.allDay, start, end, body.summary, groupID, userID, linkedID])
            } else invalidDates.push(startDate.getTime())
        }

        if (invalidDates.length === 0) return reply.code(200).send()
        else return reply.code(400).send(invalidDates)
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
        if (
            (startDate.getTime() >= dateRow.startDate.getTime() && startDate.getTime() <= dateRow.endDate.getTime()) ||
            (endDate.getTime() >= dateRow.startDate.getTime() && endDate.getTime() <= dateRow.endDate.getTime()) ||
            (startDate.getTime() <= dateRow.startDate.getTime() && endDate.getTime() >= dateRow.endDate.getTime())
        ) {
            return dateRow.userID;
        }
    }

    return ""
    // check if start is after end time
}