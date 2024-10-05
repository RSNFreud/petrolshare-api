import argon2 from "argon2";
import {
  retrieveGroupID,
  dbQuery,
  checkIfLast,
  generateEmailCode,
  retrieveID,
  sendMail,
  dbInsert,
  generateCode,
  UserTableType,
} from "../hooks";
import { FastifyInstance } from "fastify";

export default (fastify: FastifyInstance, _: any, done: () => void) => {
  fastify.post<{ Body: { emailAddress: string; password: string } }>("/api/user/login", async (request, reply) => {
    const { body } = request;
    if (!("emailAddress" in body) || !("password" in body)) {
      return reply.code(400).send("Missing required field!");
    }
    const results: UserTableType[] = await dbQuery("SELECT * from users WHERE emailAddress=?", [body["emailAddress"]]);
    if (!results.length) return reply.code(400).send("Incorrect username or password.");

    if (!results[0]["verified"]) return reply.code(400).send("Please verify your account!");
    if (!results[0]["active"])
      return reply.code(400).send("Your account has been deactivated! Please check your email to reactivate");
    if (await argon2.verify(results[0].password, body["password"])) {
      const code = results[0].authenticationKey || (await generateCode());
      const [groupData]: { premium: number }[] = await dbQuery("SELECT * FROM groups WHERE groupID=?", [
        results[0].groupID,
      ]);
      reply.code(200).send({
        fullName: results[0].fullName,
        groupID: results[0].groupID,
        emailAddress: results[0].emailAddress,
        authenticationKey: code,
        userID: results[0].userID,
        ...groupData,
      });

      if (!results[0].authenticationKey) {
        await dbInsert("UPDATE users SET authenticationKey=? WHERE emailAddress=?", [code, body["emailAddress"]]).catch(
          (err) => console.log(err)
        );
      }
    } else {
      reply.code(400).send("Incorrect username or password.");
    }
  });

  fastify.post<{
    Body: { emailAddress: string; password: string; fullName: string };
  }>("/api/user/register", async (request, reply) => {
    const { body } = request;

    if (!("emailAddress" in body) || !("password" in body) || !("fullName" in body)) {
      return reply.code(400).send("Missing required field!");
    }

    const results = await dbQuery("SELECT * from users WHERE emailAddress=?", [body["emailAddress"]]);
    if ((results as Array<any>).length)
      return reply
        .code(400)
        .send("A user with this email address already exists. Please click 'Forgot Password' to recover your account.");
    const password = argon2.hash(body["password"]);

    const code = await generateCode();
    const emailCode = await generateEmailCode();

    await dbInsert(
      "INSERT INTO users( fullName, emailAddress, password, authenticationKey, verificationCode) VALUES (?,?,?,?,?)",
      [body["fullName"], body["emailAddress"], await password, code, emailCode]
    );
    sendMail(
      body["emailAddress"],
      "Verify your Mail",
      `Hey ${body["fullName"]},<br><br>Thank you for registering for PetrolShare!<br><br>In order to activate your account, please visit <a href="https://petrolshare.freud-online.co.uk/email/verify?code=${emailCode}" target="__blank">this link!</a><br><br>Thanks,<br><br><b>The PetrolShare Team</b>`
    );

    reply.send(code);
  });

  fastify.post<{ Body: { authenticationKey: string } }>("/api/user/deactivate", async (request, reply) => {
    const { body } = request;

    if (!("authenticationKey" in body)) {
      return reply.code(400).send("Missing required field!");
    }
    const emailCode = await generateEmailCode();
    const results = await dbQuery("SELECT emailAddress FROM users WHERE userID=?", [
      await retrieveID(body["authenticationKey"]),
    ]);
    if (!results.length) return reply.code(400).send("There is no user with that ID");
    await dbQuery("UPDATE users SET active=0, verificationCode=? WHERE authenticationKey=?", [
      emailCode,
      body["authenticationKey"],
    ]);

    sendMail(
      results[0]["emailAddress"],
      "PetrolShare - Account Deactivation",
      `Hi!<br><br>We have received a request to deactivate your account. Please click <a href="https://petrolshare.freud-online.co.uk/email/deactivate?code=${emailCode}" target="_blank">here<a/> to confirm this change.<br><br>If this wasn't requested by you, feel free to ignore this and nothing will happen.<br><br>Thanks<br>The PetrolShare Team`
    );
  });

  fastify.post<{ Body: { authenticationKey: string; groupID: string } }>(
    "/api/user/change-group",
    async (request, reply) => {
      const { body } = request;

      if (!("authenticationKey" in body) || !("groupID" in body)) {
        return reply.code(400).send("Missing required field!");
      }
      let groupID = body["groupID"];

      if (groupID.includes("petrolshare.freud-online.co.uk")) {
        groupID = groupID.split("groupID=")[1];
      }
      const results = await dbQuery("SELECT groupID, premium FROM groups WHERE groupID=?", [groupID]);

      if (!results.length) return reply.code(400).send("There was no group found with that ID!");

      const isPremium = (
        await dbQuery("SELECT premium FROM groups WHERE groupID=?", [await retrieveGroupID(body["authenticationKey"])])
      )[0]?.premium;
      const isNewPremium = results[0]?.premium;
      const groupMemberCount = await dbQuery("SELECT null FROM users WHERE groupID=?", [groupID]);
      const lastInGroup = await checkIfLast(body["authenticationKey"]);

      if (!isNewPremium && groupMemberCount.length >= 2)
        return reply
          .code(400)
          .send(
            "This group has reached the max member count. To join, they need to upgrade to Premium by clicking the banner inside the app."
          );

      await dbQuery("UPDATE users SET groupID=? WHERE authenticationKey=?", [
        results[0]["groupID"],
        body["authenticationKey"],
      ]);

      reply.send({
        groupID: results[0]["groupID"],
        message:
          lastInGroup && !isPremium
            ? "You are the last member of this group and as such the group will be deleted within the next 24 hours"
            : "",
      });
    }
  );

  fastify.post<{ Body: { authenticationKey: string; newEmail: string } }>(
    "/api/user/change-email",
    async (request, reply) => {
      const { body } = request;

      if (!("authenticationKey" in body) || !("newEmail" in body)) {
        return reply.code(400).send("Missing required field!");
      }
      const emailCode = await generateEmailCode();
      const results = await dbQuery("SELECT emailAddress FROM users WHERE userID=?", [
        await retrieveID(body["authenticationKey"]),
      ]);
      if (!results.length) return reply.code(400).send("There is no user with that ID");
      await dbQuery("UPDATE users SET verificationCode=?, tempEmail=? WHERE authenticationKey=?", [
        emailCode,
        body["newEmail"],
        body["authenticationKey"],
      ]);

      sendMail(
        body["newEmail"],
        "PetrolShare - Change Email Address",
        `Hi!<br><br>We have received a request to change your email to this address. Please click <a href="https://petrolshare.freud-online.co.uk/email/verify?code=${emailCode}" target="_blank">here<a/> to confirm this change.<br><br>If this wasn't requested by you, feel free to ignore this and nothing will happen.<br><br>Thanks<br>The PetrolShare Team`
      );
    }
  );

  fastify.post<{ Body: { emailAddress: string } }>("/api/user/forgot-password", async (request, reply) => {
    const { body } = request;

    if (!("emailAddress" in body)) {
      return reply.code(400).send("Missing required field!");
    }
    const emailCode = await generateEmailCode();
    const results = await dbQuery("SELECT emailAddress FROM users WHERE emailAddress=?", [body["emailAddress"]]);
    if (!results.length) return reply.code(400).send("There is no user with that email address");
    await dbQuery("UPDATE users SET verificationCode=? WHERE emailAddress=?", [emailCode, body["emailAddress"]]);

    sendMail(
      body["emailAddress"],
      "PetrolShare - Forgot your Password",
      `Hi!<br><br>We have received a request to reset your password. Please click <a href="https://petrolshare.freud-online.co.uk/email/reset-password?code=${emailCode}" target="_blank">here<a/> to confirm this change.<br><br>If this wasn't requested by you, feel free to ignore this and nothing will happen.<br><br>Thanks<br>The PetrolShare Team`
    );
  });

  fastify.post<{ Body: { authenticationKey: string; newName: string } }>(
    "/api/user/change-name",
    async (request, reply) => {
      const { body } = request;

      if (!("authenticationKey" in body) || !("newName" in body)) {
        return reply.code(400).send("Missing required field!");
      }

      const results = await dbQuery("SELECT fullName FROM users WHERE userID=?", [
        await retrieveID(body["authenticationKey"]),
      ]);
      if (!results.length) return reply.code(400).send("There is no user with that ID");
      await dbQuery("UPDATE users SET fullName=? WHERE authenticationKey=?", [
        body["newName"],
        body["authenticationKey"],
      ]);
    }
  );

  fastify.post<{ Body: { authenticationKey: string; newPassword: string } }>(
    "/api/user/change-password",
    async (request, reply) => {
      const { body } = request;

      if (!("authenticationKey" in body) || !("newPassword" in body)) {
        return reply.code(400).send("Missing required field!");
      }

      const results = await dbQuery("SELECT fullName FROM users WHERE userID=?", [
        await retrieveID(body["authenticationKey"]),
      ]);
      if (!results.length) return reply.code(400).send("There is no user with that ID");
      const password = await argon2.hash(body["newPassword"]);

      await dbQuery("UPDATE users SET password=?, authenticationKey=null WHERE authenticationKey=?", [
        password,
        body["authenticationKey"],
      ]);
    }
  );

  fastify.get<{ Querystring: { authenticationKey: string } }>("/api/user/verify", async (request, reply) => {
    const { query } = request;

    if (!("authenticationKey" in query)) {
      return reply.code(400).send("Missing required field!");
    }

    const results: UserTableType[] = await dbQuery("SELECT * from users WHERE authenticationKey=?", [
      query["authenticationKey"],
    ]);

    if (!results) return reply.code(400).send("Your account session has expired! Please re-login");
    if (!results[0]?.active)
      return reply.code(400).send("This account has been deactivated. Please check your emails to reactivate!");

    const [groupData]: { premium: number }[] = await dbQuery("SELECT * FROM groups WHERE groupID=?", [
      results[0].groupID,
    ]);
    reply.code(200).send({
      fullName: results[0].fullName,
      groupID: results[0].groupID,
      emailAddress: results[0].emailAddress,
      authenticationKey: query["authenticationKey"],
      userID: results[0].userID,
      ...groupData,
    });
  });

  fastify.get<{ Querystring: { authenticationKey: string } }>("/api/user/get", async (request, reply) => {
    const { query } = request;

    if (!("authenticationKey" in query)) {
      return reply.code(400).send("Missing required field!");
    }

    let userID = await retrieveID(query["authenticationKey"]);

    if (!userID) return reply.code(400).send("No user found!");

    const results = await dbQuery("SELECT fullName, groupID FROM users WHERE userID=?", [userID]);

    if (!results.length) return reply.code(400).send("No user found!");

    const groupData = await dbQuery("SELECT * FROM groups WHERE groupID=?", [results[0].groupID]);

    const distance = await dbQuery(
      "SELECT l.distance, s.sessionActive from logs l LEFT JOIN sessions s USING (sessionID) WHERE userID=? AND s.sessionActive=1 AND s.groupID=? AND approved=1",
      [userID, results[0].groupID]
    );

    let total = 0;
    distance.map(({ distance }) => {
      total += distance;
    });

    reply.send({ ...results[0], ...groupData[0], currentMileage: Math.round(total * 100) / 100 });
  });

  done();
};
