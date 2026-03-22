import Fastify, { FastifyInstance } from "fastify";
import mysql from "mysql";
require("dotenv").config();
import cors from "@fastify/cors";
import { deleteEmptyGroups } from "./hooks";
import { readdir } from "fs";

export const fastify: FastifyInstance = Fastify({});

fastify.register(require("@fastify/static"), {
  root: __dirname,
});

fastify.register(require("@fastify/view"), {
  engine: {
    ejs: require("ejs"),
  },
});

const prefix = "";

readdir(__dirname + "/routes", (_, files) => {
  for (let file of files) {
    fastify.register(require(__dirname + "/routes/" + file), {
      prefix: prefix,
    });
  }
  start();
});

fastify.register(cors);

export const conn = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
});

setInterval(() => {
  deleteEmptyGroups();
}, 86400000);

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
