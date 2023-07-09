import { FastifyInstance } from "fastify";
import { dbQuery, dbInsert, generateEmailCode, sendMail, generateTempPassword } from "../hooks";
import argon2 from "argon2";
import path from "path";

export default (fastify: FastifyInstance, _: any, done: () => void) => {
    fastify.get<{ Querystring: { authenticationKey: string; code: string } }>(
        "/email/verify",
        async (request, reply) => {
            const { query } = request;

            if (!query || !("code" in query)) {
                return reply.code(400).send("Missing required field!");
            }

            const results = await dbQuery(
                "SELECT fullName, verified, tempEmail FROM users WHERE verificationCode=?",
                [query["code"]]
            );
            if (!results.length) return reply.code(400).sendFile("pages/fail.html");

            if (results[0].verified && results[0].tempEmail)
                await dbInsert(
                    "UPDATE users SET emailAddress=?, verificationCode=null, tempEmail=null WHERE verificationCode=?",
                    [results[0].tempEmail, query["code"]]
                );
            else
                await dbInsert(
                    "UPDATE users SET verified=1, verificationCode=null WHERE verificationCode=?",
                    [query["code"]]
                );
            await reply.sendFile("pages/success.html");
        }
    );

    fastify.post<{ Body: { emailAddress: string } }>(
        "/email/resend",
        async (request, reply) => {
            const { body } = request;

            if (!body || !("emailAddress" in body)) {
                return reply.code(400).send("Missing required field!");
            }

            const emailCode = await generateEmailCode();

            await dbInsert("UPDATE users SET verificationCode=? WHERE emailAddress=?", [
                emailCode,
                body["emailAddress"],
            ]);

            sendMail(
                body["emailAddress"],
                "Verify your Mail",
                `Hey,<br><br>Thank you for registering for PetrolShare!<br><br>In order to activate your account, please visit <a href="https://petrolshare.freud-online.co.uk/email/verify?code=${emailCode}" target="__blank">this link!</a><br><br>Thanks,<br><br><b>The PetrolShare Team</b>`
            );
        }
    );

    fastify.get<{ Querystring: { code: string } }>(
        "/email/reset-password",
        async (request, reply) => {
            const { query } = request;
            console.log(path.resolve("pages/fail.html"));


            if (!query || !("code" in query)) {
                return reply.code(400).send("Missing required field!");
            }

            const results = await dbQuery(
                "SELECT fullName, verified FROM users WHERE verificationCode=?",
                [query["code"]]
            );
            if (!results.length) return reply.code(400).sendFile("fail.html");
            const password = generateTempPassword();

            await dbInsert(
                "UPDATE users SET password=?, authenticationKey=null, verificationCode=null WHERE verificationCode=?",
                [await argon2.hash(password), query["code"]]
            );

            await reply.view("pages/reset-password.ejs", { password: password });
        }
    );

    fastify.get<{ Querystring: { code: string } }>(
        "/email/deactivate",
        async (request, reply) => {
            const { query } = request;

            if (!query || !("code" in query)) {
                return reply.code(400).send("Missing required field!");
            }

            const results = await dbQuery(
                "SELECT fullName, emailAddress FROM users WHERE verificationCode=?",
                [query["code"]]
            );
            const verificationCode = await generateEmailCode();
            if (!results.length) return reply.code(400).sendFile("pages/fail.html");

            await dbInsert(
                "UPDATE users SET active=0, verificationCode=? WHERE verificationCode=?",
                [verificationCode, query["code"]]
            );
            sendMail(
                results[0]["emailAddress"],
                "PetrolShare - Account Deactivated",
                `Hi!<br><br>Your account has now been deactivated and will be deleted in the next 24 hours. Please click <a href="https://petrolshare.freud-online.co.uk/email/activate?code=${verificationCode}" target="_blank">here<a/> to reactivate it.<br><br>Thanks<br>The PetrolShare Team`
            );
            await reply.sendFile("pages/deactivated.html");
        }
    );

    fastify.get<{ Querystring: { code: string } }>(
        "/email/activate",
        async (request, reply) => {
            const { query } = request;

            if (!query || !("code" in query)) {
                return reply.code(400).send("Missing required field!");
            }

            const results = await dbQuery(
                "SELECT fullName, emailAddress FROM users WHERE verificationCode=?",
                [query["code"]]
            );
            if (!results.length) return reply.code(400).sendFile("pages/fail.html");

            await dbInsert(
                "UPDATE users SET active=1, verificationCode=NULL WHERE verificationCode=?",
                [query["code"]]
            );
            await reply.sendFile("pages/activated.html");
        }
    );
    done()
}