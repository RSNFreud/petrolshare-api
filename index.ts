import Fastify, { FastifyInstance } from "fastify";
import mysql from "mysql";
require("dotenv").config();
import cors from "@fastify/cors";
import { deleteEmptyGroups, sendNotification } from "./hooks";
import invoices from "./routes/invoices";
import distance from "./routes/distance";
import email from "./routes/email";
import group from "./routes/group";
import logs from "./routes/logs";
import notify from "./routes/notify";
import petrol from "./routes/petrol";
import presets from "./routes/presets";
import user from "./routes/user";

export const fastify: FastifyInstance = Fastify({});

fastify.register(require("@fastify/static"), {
    root: __dirname,
});

fastify.register(require("@fastify/view"), {
    engine: {
        ejs: require("ejs"),
    },
});

fastify.register(distance)
fastify.register(email)
fastify.register(group)
fastify.register(invoices)
fastify.register(logs)
fastify.register(notify)
fastify.register(petrol)
fastify.register(presets)
fastify.register(user)

fastify.register(cors);

export const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "petrolshare",
});
conn.connect();

setInterval(() => {
    deleteEmptyGroups();
}, 86400000);

// EMAIL
fastify.get<{ Querystring: { code: string } }>(
    "/test",
    async (request, reply) => {
        sendNotification(
            [{ notificationKey: "ExponentPushToken[kAgk8YHT1CczurXj67C80_]" }],
            "Testing...",
            { route: "Invoices", invoiceID: 440 }
        );
    }
);

// Run the server!
const start = async () => {
    try {
        await fastify.listen({ port: 3434 });
        console.log("Listening to traffic on 3434");
    } catch (err) {
        console.log(err);

        fastify.log.error(err);
        process.exit(1);
    }
};
start();