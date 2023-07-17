import { FastifyInstance } from "fastify";
import { retrieveGroupID, dbQuery, checkIfLast, dbInsert, generateGroupID } from "../hooks";

export default (fastify: FastifyInstance, _: any, done: () => void) => {
    fastify.post<{ Body: { authenticationKey: string; groupID: string } }>(
        "/api/group/create",
        async (request, reply) => {
            const { body } = request;

            if (!("authenticationKey" in body) || !("groupID" in body)) {
                return reply.code(400).send("Missing required field!");
            }

            const lastInGroup = await checkIfLast(body["authenticationKey"]);
            const groupIDExists = await dbQuery(
                "SELECT premium FROM groups WHERE groupID=?",
                [body["groupID"]]
            );
            let groupID = body["groupID"];
            if (groupIDExists.length) groupID = generateGroupID();
            const isPremium = groupIDExists.length ? false : groupIDExists[0]?.premium;

            await dbQuery("UPDATE users SET groupID=? WHERE authenticationKey=?", [
                groupID,
                body["authenticationKey"],
            ]);
            await dbInsert("INSERT INTO groups (groupID) VALUES (?)", [groupID]);
            reply.send({
                groupID: groupID,
                message:
                    lastInGroup && !isPremium
                        ? "You are the last member of this group and as such the group will be deleted within the next 24 hours"
                        : "",
            });
            reply.send(groupID);
        }
    );

    fastify.post<{
        Body: {
            authenticationKey: string;
            distance: string;
            petrol: string;
            currency: string;
        };
    }>("/api/group/update", async (request, reply) => {
        const { body } = request;

        if (
            !("authenticationKey" in body) ||
            !("distance" in body) ||
            !("petrol" in body) ||
            !("currency" in body)
        ) {
            return reply.code(400).send("Missing required field!");
        }

        const groupID = await retrieveGroupID(body["authenticationKey"]);

        await dbQuery(
            "UPDATE groups SET distance=?, petrol=?, currency=? WHERE groupID=?",
            [body["distance"], body["petrol"], body["currency"], groupID]
        );
    });

    fastify.get<{ Querystring: { authenticationKey: string } }>(
        "/api/group/get",
        async (request, reply) => {
            const { query } = request;

            if (!("authenticationKey" in query)) {
                return reply.code(400).send("Missing required field!");
            }

            const groupID = await retrieveGroupID(query["authenticationKey"]);

            const res = await dbQuery("SELECT * FROM groups WHERE groupID=?", [
                groupID,
            ]);
            if (!res) return;
            reply.send(res[0]);
        }
    );

    fastify.post<{ Body: { authenticationKey: string } }>(
        "/api/group/subscribe",
        async (request, reply) => {
            const { body } = request;

            if (!("authenticationKey" in body)) {
                return reply.code(400).send("Missing required field!");
            }

            const groupID = await retrieveGroupID(body["authenticationKey"]);

            const res = await dbInsert("UPDATE groups SET premium=1 WHERE groupID=?", [
                groupID,
            ]);
            reply.code(200).send(res?.changedRows);
        }
    );

    fastify.get<{ Querystring: { authenticationKey: string } }>(
        "/api/group/get-members",
        async (request, reply) => {
            const { query } = request;

            if (!("authenticationKey" in query)) {
                return reply.code(400).send("Missing required field!");
            }

            const groupID = await retrieveGroupID(query["authenticationKey"]);

            const res = await dbQuery(
                "SELECT fullName, userID FROM users WHERE groupID=?",
                [groupID]
            );
            if (!res) return;

            reply.send(res);
        }
    );

    done()
}