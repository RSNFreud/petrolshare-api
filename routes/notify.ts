import { FastifyInstance } from "fastify";
import { dbInsert } from "../hooks";

export default (fastify: FastifyInstance, _: any, done: () => void) => {
    fastify.post<{ Body: { emailAddress: string; notificationKey: string } }>(
        "/api/notify/register",
        async (request, reply) => {
            const { body } = request;

            if (!("emailAddress" in body) || !("notificationKey" in body)) {
                return reply.code(400).send("Missing required field!");
            }

            console.log(body["notificationKey"]);

            await dbInsert("UPDATE users SET notificationKey=? WHERE emailAddress=?", [
                body["notificationKey"],
                body["emailAddress"],
            ]);
        }
    );

    fastify.post<{ Body: { emailAddress: string; notificationKey: string } }>(
        "/api/notify/deregister",
        async (request, reply) => {
            const { body } = request;

            if (!("emailAddress" in body)) {
                return reply.code(400).send("Missing required field!");
            }

            await dbInsert(
                "UPDATE users SET notificationKey=null WHERE emailAddress=?",
                [body["notificationKey"], body["emailAddress"]]
            );
        }
    );
    done()
}