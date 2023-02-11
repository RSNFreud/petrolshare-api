import Fastify, { FastifyInstance } from 'fastify'
import mysql, { OkPacket } from 'mysql'
require('dotenv').config()
import argon2 from 'argon2';
import cors from '@fastify/cors'
import nodemailer from "nodemailer";
import Expo from 'expo-server-sdk';

const fastify: FastifyInstance = Fastify({})
fastify.register(require('@fastify/static'), {
    root: __dirname,
})

fastify.register(require("@fastify/view"), {
    engine: {
        ejs: require("ejs"),
    },
});

fastify.register(cors, {})

const conn = mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USERNAME, password: process.env.DB_PASSWORD, database: 'petrolshare'
})
conn.connect()


const sendMail = async (address: string, subject: string, message: string) => {

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
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
        console.log('Google blocked email sending!');
    }
}

async function dbQuery(query: string, parameters?: Array<any>) {
    return new Promise<Array<any>>((res, rej) => {
        try {
            conn.query(query, parameters, ((err, results) => {
                if (err) rej(err)
                res(results)
            }));
        }
        catch (err) {
            rej(err);
        }
    })
}

async function dbInsert(query: string, parameters?: Array<any>) {
    return new Promise<OkPacket>((res, rej) => {
        try {
            conn.query(query, parameters, ((err, results) => {
                if (err) rej(err)
                res(results)
            }));
        }
        catch (err) {
            rej(err);
        }
    })
}

const generateEmailCode = async (): Promise<string> => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (var i = 0; i < 25; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }

    if ((await dbQuery('SELECT * from users where verificationCode=?', [result])).length) return generateEmailCode()
    return result
}

const generateCode = async (): Promise<string> => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (var i = 0; i < 25; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }

    if ((await dbQuery('SELECT * from users where authenticationKey=?', [result])).length) return generateCode()
    return result
}

const generateTempPassword = () => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*+=';
    const charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }

    return result
}

const retrieveGroupID = async (authenticationKey: string) => {
    return (await dbQuery('SELECT groupID FROM users WHERE authenticationKey=?', [authenticationKey]))[0].groupID
}

const retrieveSessionID = async (groupID: string) => {
    let res: OkPacket | Array<any> = await dbQuery('SELECT sessionID FROM sessions WHERE groupID=? AND sessionActive=true', [groupID])
    if (!res.length) {
        res = await dbInsert('INSERT INTO sessions (sessionStart, groupID, sessionActive) VALUES (?,?,?)', [Date.now(), groupID, true])
        return res.insertId
    }
    return res[0].sessionID
}

const retrieveID = async (authenticationKey: string) => {
    const res = await dbQuery('SELECT userID FROM users WHERE authenticationKey=?', [authenticationKey])
    if (!res.length) return
    return res[0].userID
}

const retrieveName = async (userID: string) => {
    const res = await dbQuery('SELECT fullName FROM users WHERE userID=?', [userID])
    if (!res.length) return ""
    return res[0].fullName as string
}

// USER
fastify.post<{ Body: { emailAddress: string, password: string } }>('/api/user/login', async (request, reply) => {
    const { body } = request

    if (!('emailAddress' in body) || !('password' in body)) {
        return reply.code(400).send('Missing required field!')
    }
    const results: Array<any> = await dbQuery('SELECT * from users WHERE emailAddress=?', [body['emailAddress']])
    if (!(results as Array<any>).length) return reply.code(400).send('Incorrect username or password.')

    if (!results[0]["verified"]) return reply.code(400).send('Please verify your account!')
    if (await argon2.verify(results[0].password, body["password"])) {
        const code = results[0].authenticationKey || await generateCode()
        reply.code(200).send({ fullName: results[0].fullName, groupID: results[0].groupID, emailAddress: results[0].emailAddress, authenticationKey: code, userID: results[0].userID })

        if (!results[0].authenticationKey) {
            await dbInsert('UPDATE users SET authenticationKey=? WHERE emailAddress=?', [code, body['emailAddress']]).catch(err => console.log(err))
        }

    } else {
        reply.code(400).send('Incorrect username or password.')
    }
})

fastify.post<{ Body: { emailAddress: string, notificationKey: string } }>('/api/notify/register', async (request, reply) => {
    const { body } = request


    if (!('emailAddress' in body) || !('notificationKey' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    console.log(body["notificationKey"]);

    await dbInsert('UPDATE users SET notificationKey=? WHERE emailAddress=?', [body["notificationKey"], body["emailAddress"]])
})

fastify.post<{ Body: { emailAddress: string, notificationKey: string } }>('/api/notify/deregister', async (request, reply) => {
    const { body } = request

    if (!('emailAddress' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    await dbInsert('UPDATE users SET notificationKey=null WHERE emailAddress=?', [body["notificationKey"], body["emailAddress"]])
})

fastify.post<{ Body: { emailAddress: string, password: string, fullName: string } }>('/api/user/register', async (request, reply) => {
    const { body } = request

    if (!('emailAddress' in body) || !('password' in body) || !('fullName' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    const results = await dbQuery('SELECT * from users WHERE emailAddress=?', [body['emailAddress']])
    if ((results as Array<any>).length) return reply.code(400).send('This user exists already!')
    const password = argon2.hash(body['password'])

    const code = await generateCode();
    const emailCode = await generateEmailCode()

    await dbInsert('INSERT INTO users( fullName, emailAddress, password, authenticationKey, verificationCode) VALUES (?,?,?,?,?)', [body['fullName'], body['emailAddress'], await password, code, emailCode])
    sendMail(body['emailAddress'], 'Verify your Mail', `Hey ${body['fullName']},<br><br>Thank you for registering for PetrolShare!<br><br>In order to activate your account, please visit <a href="https://petrolshare.freud-online.co.uk/email/verify?code=${emailCode}" target="__blank">this link!</a><br><br>Thanks,<br><br><b>The PetrolShare Team</b>`)

    reply.send(code)
})

fastify.post<{ Body: { authenticationKey: string, groupID: string } }>('/api/group/create', async (request, reply) => {
    const { body } = request

    if (!('authenticationKey' in body) || !('groupID' in body)) {
        return reply.code(400).send('Missing required field!')
    }
    await dbQuery('UPDATE users SET groupID=? WHERE authenticationKey=?', [body['groupID'], body['authenticationKey']])
    await dbInsert('INSERT INTO groups (groupID) VALUES (?)', [body['groupID']])
})

fastify.post<{ Body: { authenticationKey: string, distance: string, petrol: string, currency: string } }>('/api/group/update', async (request, reply) => {
    const { body } = request

    if (!('authenticationKey' in body) || !('distance' in body) || !('petrol' in body) || !('currency' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    const groupID = await retrieveGroupID(body['authenticationKey'])

    await dbQuery('UPDATE groups SET distance=?, petrol=?, currency=? WHERE groupID=?', [body['distance'], body['petrol'], body['currency'], groupID])
})

fastify.get<{ Querystring: { authenticationKey: string } }>('/api/group/get', async (request, reply) => {
    const { query } = request

    if (!('authenticationKey' in query)) {
        return reply.code(400).send('Missing required field!')
    }

    const groupID = await retrieveGroupID(query['authenticationKey'])

    const res = await dbQuery('SELECT * FROM groups WHERE groupID=?', [groupID])
    if (!res) return
    reply.send(res[0])
})

fastify.get<{ Querystring: { authenticationKey: string } }>('/api/group/get-members', async (request, reply) => {
    const { query } = request

    if (!('authenticationKey' in query)) {
        return reply.code(400).send('Missing required field!')
    }

    const groupID = await retrieveGroupID(query['authenticationKey'])

    const res = await dbQuery('SELECT fullName FROM users WHERE groupID=?', [groupID])
    if (!res) return

    reply.send(res.map(e => e.fullName))
})

fastify.post<{ Body: { authenticationKey: string, groupID: string } }>('/api/user/change-group', async (request, reply) => {
    const { body } = request

    if (!('authenticationKey' in body) || !('groupID' in body)) {
        return reply.code(400).send('Missing required field!')
    }
    const results = await dbQuery('SELECT groupID FROM users WHERE groupID=?', [body['groupID']])

    if (!results.length) return reply.code(400).send("There is no group with that ID")
    await dbQuery('UPDATE users SET groupID=? WHERE authenticationKey=?', [body['groupID'], body['authenticationKey']])

})

fastify.post<{ Body: { authenticationKey: string, newEmail: string } }>('/api/user/change-email', async (request, reply) => {
    const { body } = request

    if (!('authenticationKey' in body) || !('newEmail' in body)) {
        return reply.code(400).send('Missing required field!')
    }
    const emailCode = await generateEmailCode();
    const results = await dbQuery('SELECT emailAddress FROM users WHERE userID=?', [await retrieveID(body['authenticationKey'])])
    if (!results.length) return reply.code(400).send("There is no user with that ID")
    await dbQuery('UPDATE users SET verificationCode=?, tempEmail=? WHERE authenticationKey=?', [emailCode, body['newEmail'], body['authenticationKey']])

    sendMail(body['newEmail'], 'PetrolShare - Change Email Address', `Hi!<br><br>We have received a request to change your email to this address. Please click <a href="https://petrolshare.freud-online.co.uk/email/verify?code=${emailCode}" target="_blank">here<a/> to confirm this change.<br><br>If this wasn't requested by you, feel free to ignore this and nothing will happen.<br><br>Thanks<br>The PetrolShare Team`)
})

fastify.post<{ Body: { emailAddress: string } }>('/api/user/forgot-password', async (request, reply) => {
    const { body } = request

    if (!('emailAddress' in body)) {
        return reply.code(400).send('Missing required field!')
    }
    const emailCode = await generateEmailCode();
    const results = await dbQuery('SELECT emailAddress FROM users WHERE emailAddress=?', [body['emailAddress']])
    if (!results.length) return reply.code(400).send("There is no user with that email address")
    await dbQuery('UPDATE users SET verificationCode=? WHERE emailAddress=?', [emailCode, body['emailAddress']])

    sendMail(body['emailAddress'], 'PetrolShare - Forgot your Password', `Hi!<br><br>We have received a request to reset your password. Please click <a href="https://petrolshare.freud-online.co.uk/email/reset-password?code=${emailCode}" target="_blank">here<a/> to confirm this change.<br><br>If this wasn't requested by you, feel free to ignore this and nothing will happen.<br><br>Thanks<br>The PetrolShare Team`)
})

fastify.post<{ Body: { authenticationKey: string, newName: string } }>('/api/user/change-name', async (request, reply) => {
    const { body } = request

    if (!('authenticationKey' in body) || !('newName' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    const results = await dbQuery('SELECT fullName FROM users WHERE userID=?', [await retrieveID(body['authenticationKey'])])
    if (!results.length) return reply.code(400).send("There is no user with that ID")
    await dbQuery('UPDATE users SET fullName=? WHERE authenticationKey=?', [body['newName'], body['authenticationKey']])
})

fastify.post<{ Body: { authenticationKey: string, newPassword: string } }>('/api/user/change-password', async (request, reply) => {
    const { body } = request

    if (!('authenticationKey' in body) || !('newPassword' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    const results = await dbQuery('SELECT fullName FROM users WHERE userID=?', [await retrieveID(body['authenticationKey'])])
    if (!results.length) return reply.code(400).send("There is no user with that ID")
    const password = await argon2.hash(body['newPassword'])

    await dbQuery('UPDATE users SET password=?, authenticationKey=null WHERE authenticationKey=?', [password, body['authenticationKey']])
})

fastify.get<{ Querystring: { authenticationKey: string } }>('/api/user/verify', async (request, reply) => {
    const { query } = request

    if (!('authenticationKey' in query)) {
        return reply.code(400).send('Missing required field!')
    }

    const results: Array<any> = await dbQuery('SELECT * from users WHERE authenticationKey=?', [query['authenticationKey']])

    if (!results) return reply.code(400).send('No user found!')

    reply.code(200).send({ fullName: results[0].fullName, groupID: results[0].groupID, emailAddress: results[0].emailAddress, userID: results[0].userID })
})

fastify.get<{ Querystring: { authenticationKey: string } }>('/api/user/get', async (request, reply) => {
    const { query } = request

    if (!('authenticationKey' in query)) {
        return reply.code(400).send('Missing required field!')
    }

    let userID = await retrieveID(query['authenticationKey'])

    if (!userID) return reply.code(400).send('No user found!')

    const results = await dbQuery('SELECT fullName, groupID FROM users WHERE userID=?', [userID])

    if (!results.length) return reply.code(400).send('No user found!')

    reply.send(results)
})

// DISTANCE
fastify.get<{ Querystring: { authenticationKey: string } }>('/api/distance/get', async (request, reply) => {
    const { query } = request

    if (!('authenticationKey' in query)) {
        return reply.code(400).send('Missing required field!')
    }

    const userID = await retrieveID(query['authenticationKey'])
    if (!userID) return reply.code(400).send('No user found!')

    const results = await dbQuery('SELECT l.distance, s.sessionActive from logs l LEFT JOIN sessions s USING (sessionID) WHERE userID=? AND s.sessionActive=1 AND s.groupID=?', [userID, await retrieveGroupID(query['authenticationKey'])])

    if (!results.length) return reply.send(0)

    let total = 0;
    results.map(({ distance }) => {
        total += distance
    })
    reply.send(Math.round(total * 100) / 100)
})

fastify.post<{ Body: { authenticationKey: string } }>('/api/distance/reset', async (request, reply) => {
    const { body } = request

    if (!body || !('authenticationKey' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    const groupID = await retrieveGroupID(body['authenticationKey'])
    await dbQuery('UPDATE sessions SET sessionActive=false, sessionEnd=? WHERE groupID=?', [Date.now(), groupID])
    retrieveSessionID(groupID)

    reply.code(200)
})

fastify.post<{ Body: { authenticationKey: string, distance: string } }>('/api/distance/add', async (request, reply) => {
    const { body } = request

    if (!body || !('distance' in body) || !('authenticationKey' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    const results = await dbQuery('SELECT * FROM users WHERE authenticationKey=?', [body['distance'], body['authenticationKey']])
    if (!results) return reply.code(400).send('This user does not exist!')
    const log = (await dbQuery('SELECT userID, groupID FROM users WHERE authenticationKey=?', [body['authenticationKey']]))[0]
    const sessionID = await retrieveSessionID(log.groupID)

    try {
        await dbInsert('INSERT INTO logs(userID, distance, date, sessionID) VALUES(?,?,?,?)', [log.userID, body["distance"], Date.now(), sessionID])
    } catch (err) {
        console.log(err);
    }

    reply.code(200)
})

// LOGS
fastify.get<{ Querystring: { authenticationKey: string } }>('/api/logs/get', async (request, reply) => {
    const { query } = request

    if (!('authenticationKey' in query)) {
        return reply.code(400).send('Missing required field!')
    }

    let sessions = await dbQuery('SELECT sessionStart, sessionEnd, sessionActive, sessionID FROM sessions WHERE groupID = ?', [await retrieveGroupID(query['authenticationKey'])])
    if (!sessions) return reply.code(400).send('There are no sessions to be found')

    let logs = await dbQuery('SELECT s.groupID, u.fullName, l.distance, l.date, l.logID, s.sessionID FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON u.userID = l.userID WHERE s.groupID = ? ORDER BY l.date DESC', [await retrieveGroupID(query['authenticationKey'])])

    let flat: {
        [key: string]: {
            sessionID?: string,
            sessionActive?: string,
            sessionStart?: string,
            sessionEnd?: string,
            logs: Array<any>
        }
    } = {}
    sessions.map(e => {
        if (!flat[e.sessionID]) flat[e.sessionID] = { logs: [] }

        flat[e.sessionID] = {
            sessionID: e.sessionID,
            sessionActive: e.sessionActive,
            sessionStart: e.sessionStart,
            sessionEnd: e.sessionEnd,
            logs: []
        }

    })

    logs.map(e => {
        if (!flat[e.sessionID]) flat[e.sessionID] = { logs: [] }

        flat[e.sessionID] = {
            ...flat[e.sessionID],
            logs: [...flat[e.sessionID].logs, { fullName: e.fullName, distance: e.distance, date: e.date, logID: e.logID }]
        }

    })

    reply.send(flat)
})

fastify.post<{ Body: { authenticationKey: string, logID: string } }>('/api/logs/delete', async (request, reply) => {
    const { body } = request

    if (!('authenticationKey' in body) || !('logID' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    const userID = await retrieveID(body['authenticationKey'])
    if (!userID) return reply.code(400).send('No user found!')

    const results = await dbQuery('SELECT u.userID, l.distance, l.logID, s.sessionActive FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON u.userID = l.userID WHERE l.logID = ?', [body['logID']])

    if (results[0].userID !== userID) {
        return reply.code(400).send('Insufficient permissions!')
    }

    await dbQuery('DELETE FROM logs WHERE logID=?', [body["logID"]])

    if (!results) return reply.code(400).send('There are no logs to be found')


})

fastify.post<{ Body: { authenticationKey: string, logID: string, distance: string } }>('/api/logs/edit', async (request, reply) => {
    const { body } = request

    if (!('authenticationKey' in body) || !('logID' in body) || !('distance' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    const userID = await retrieveID(body['authenticationKey'])
    if (!userID) return reply.code(400).send('No user found!')

    const results = await dbQuery('SELECT u.userID, l.distance, l.logID, s.sessionActive FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON u.userID = l.userID WHERE l.logID = ?', [body['logID']])

    if (!results.length) return reply.code(400).send('No log found with that ID')

    if (results[0].userID !== userID) {
        return reply.code(400).send('Insufficient permissions!')
    }

    await dbQuery('UPDATE logs SET distance=? WHERE logID=?', [body["distance"], body["logID"]])

    if (!results) return reply.code(400).send('There are no logs to be found')
})

// PRESETS
fastify.get<{ Querystring: { authenticationKey: string } }>('/api/preset/get', async (request, reply) => {
    const { query } = request

    if (!query || !('authenticationKey' in query)) {
        return reply.code(400).send('Missing required field!')
    }
    let userID = await retrieveID(query['authenticationKey'])
    if (!userID) return reply.code(400).send('No user found!')

    const results = await dbQuery('SELECT presetName, distance, presetID FROM presets WHERE userID=?', [userID])
    if (!results) return reply.code(400).send('There are no presets!')

    reply.send(results)
})

fastify.post<{ Body: { authenticationKey: string, presetName: string, distance: string } }>('/api/preset/add', async (request, reply) => {
    const { body } = request

    if (!body || !('presetName' in body) || !('distance' in body) || !('authenticationKey' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    let userID = await retrieveID(body['authenticationKey'])
    if (!userID) return reply.code(400).send('No user found!')

    await dbInsert('INSERT INTO presets (presetName, distance, userID) VALUES (?,?,?)', [body['presetName'], body['distance'], userID])
    reply.code(200)
})

fastify.post<{ Body: { authenticationKey: string, presetName: string, presetID: string, distance: string } }>('/api/preset/edit', async (request, reply) => {
    const { body } = request

    if (!body || !('presetID' in body) || !('presetName' in body) || !('distance' in body) || !('authenticationKey' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    let userID = await retrieveID(body['authenticationKey'])
    if (!userID) return reply.code(400).send('No user found!')


    await dbQuery('UPDATE presets SET presetName=?, distance=? WHERE presetID=?', [body['presetName'], body['distance'], body['presetID']])
    reply.code(200)
})

fastify.post<{ Body: { authenticationKey: string, presetID: string } }>('/api/preset/delete', async (request, reply) => {
    const { body } = request

    if (!body || !('presetID' in body) || !('authenticationKey' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    const userID = await retrieveID(body['authenticationKey'])
    if (!userID) return reply.code(400).send('No user found!')

    await dbQuery('DELETE FROM presets WHERE presetID=?', [body['presetID']])
    reply.code(200)
})

// PETROL
fastify.post<{ Body: { authenticationKey: string, totalPrice: number, litersFilled: number, odometer: number } }>('/api/petrol/add', async (request, reply) => {
    const { body } = request

    if (!body || !('totalPrice' in body) || !('litersFilled' in body) || !('authenticationKey' in body) || !('odometer' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    // const results = await dbQuery('SELECT l.distance, s.sessionActive, s.initialOdometer, s.sessionID, u.fullName, u.notificationKey, u.userID FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON l.userID = u.userID WHERE s.groupID=? AND s.sessionID=63', [await retrieveGroupID(body['authenticationKey'])])
    const results = await dbQuery('SELECT l.distance, s.sessionActive, s.initialOdometer, s.sessionID, u.fullName, u.notificationKey, u.userID FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON l.userID = u.userID WHERE s.groupID=? AND s.sessionActive=1', [await retrieveGroupID(body['authenticationKey'])])

    if (!results || !results.length) return reply.code(400).send('No logs found')

    let distances: { [key: string]: { distance: number, fullName: string, paymentDue?: number, paid?: boolean, liters?: string } } = {}

    for (let i = 0; i < results.length; i++) {
        const e: {
            distance: string,
            sessionActive: number,
            initialOdometer: number,
            sessionID: number,
            fullName: string,
            userID: string
        } = results[i];


        if (!(e.userID in distances)) {
            distances[e.userID] = { distance: 0, fullName: e["fullName"] }
        }
        distances[e.userID] = { distance: distances[e.userID].distance + parseFloat(e.distance), fullName: e["fullName"] }
    }

    let totalDistance = Object.values(distances).reduce((a, b) => a + b["distance"], 0)

    const pricePerLiter = body['totalPrice'] / body['litersFilled']
    const totalCarDistance = body['odometer'] - results[0]['initialOdometer']

    const litersPerKm = body['litersFilled'] / (results[0]['initialOdometer'] && totalCarDistance > 0 ? totalCarDistance : totalDistance)
    const userID = await retrieveID(body['authenticationKey'])

    Object.entries(distances).map(([key, value]) => {
        distances[key] = { fullName: value.fullName, paymentDue: Math.round((value.distance * litersPerKm * pricePerLiter) * 100) / 100, paid: parseInt(key) === userID, distance: Math.round(value.distance * 100) / 100, liters: (value.distance * litersPerKm).toFixed(2) }
    })
    if (results[0]['initialOdometer'] && totalCarDistance !== totalDistance && (totalCarDistance - totalDistance > 0)) {
        distances[0] = { fullName: 'Unaccounted Distance', paymentDue: Math.round(((totalCarDistance - totalDistance) * litersPerKm * pricePerLiter) * 100) / 100, paid: false, distance: Math.round((totalCarDistance - totalDistance) * 100) / 100 }
    }

    await dbInsert('UPDATE sessions SET sessionActive=0, sessionEnd=? WHERE groupID=? AND sessionActive=1', [Date.now(), await retrieveGroupID(body['authenticationKey'])])
    await dbInsert('INSERT INTO sessions (sessionStart, groupID, sessionActive, initialOdometer) VALUES (?,?,?,?)', [Date.now(), await retrieveGroupID(body['authenticationKey']), true, body['odometer']])

    const res: any = await dbInsert('INSERT INTO invoices (invoiceData, sessionID, totalPrice, totalDistance, userID, litersFilled, pricePerLiter) VALUES (?,?,?,?,?,?,?)', [JSON.stringify(distances), results[0].sessionID, body['totalPrice'], Math.round((totalCarDistance > 0 ? totalCarDistance : totalDistance) * 100) / 100, await retrieveID(body['authenticationKey']), body['litersFilled'], pricePerLiter])
    let notifications = results.filter(e => e.userID !== userID)
    notifications = notifications.reduce((map, obj) => {
        map[obj.userID] = obj
        return map
    }, {})

    sendNotification(Object.values(notifications), "You have a new invoice waiting!", { route: "Invoices", invoiceID: res["insertId"] })
    reply.send(res['insertId'])
})

// INVOICES

fastify.get<{ Querystring: { authenticationKey: string, invoiceID: string } }>('/api/invoices/get', async (request, reply) => {
    const { query } = request

    if (!query || !('authenticationKey' in query)) {
        return reply.code(400).send('Missing required field!')
    }
    let userID = await retrieveID(query['authenticationKey'])
    if (!userID) return reply.code(400).send('No user found!')

    if (!('invoiceID' in query)) {
        const results: Array<any> = await dbQuery('SELECT i.invoiceID, s.sessionEnd FROM invoices i LEFT JOIN sessions s USING (sessionID) WHERE s.groupID=? ORDER BY s.sessionEnd DESC', [await retrieveGroupID(query['authenticationKey'])])
        if (!results.length) return reply.code(400).send('There are no invoices in that group!')
        return reply.send(results)
    }

    let results = await dbQuery('SELECT u.fullName, i.invoiceData, i.totalDistance, i.pricePerLiter, s.sessionEnd, i.totalPrice FROM invoices i LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u USING (userID) WHERE i.invoiceID=? AND s.groupID=?', [query["invoiceID"], await retrieveGroupID(query['authenticationKey'])])
    if (!results.length) return reply.code(400).send('There are no invoices with that ID!')

    for (let i = 0; i < results.length; i++) {
        const e: {
            fullName: string,
            invoiceData: string,
            totalDistance: string,
            sessionEnd: string,
            totalPrice: string
        } = results[i];
        let data: { [key: string]: { distance: number, fullName: string, paymentDue?: number, paid?: boolean } } = JSON.parse(e.invoiceData)

        for (let i = 0; i < Object.keys(data).length; i++) {
            let key = Object.keys(data)[i];
            const name = await retrieveName(key)
            if (name) data[key]["fullName"] = name
            e.invoiceData = JSON.stringify(data)
        }
    }

    await dbInsert('UPDATE invoices SET invoiceData=? WHERE invoiceID=?', [results[0].invoiceData, query["invoiceID"]])
    reply.send(results[0])
})

fastify.post<{ Body: { authenticationKey: string, invoiceID: string, userID: string } }>('/api/invoices/pay', async (request, reply) => {
    const { body } = request

    if (!body || !('authenticationKey' in body) || !('invoiceID' in body) || !('userID' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    let userID = await retrieveID(body['authenticationKey'])
    if (!userID) return reply.code(400).send('No user found!')


    let results: any = await dbQuery('SELECT i.invoiceData FROM invoices i LEFT JOIN sessions s USING(sessionID) WHERE i.invoiceID=? AND s.groupID=?', [body["invoiceID"], await retrieveGroupID(body['authenticationKey'])])
    if (!results.length) return reply.code(400).send('There are no invoices with that ID!')

    results = JSON.parse(results[0].invoiceData)

    if (results[body["userID"]]) {
        results[body["userID"]] = {
            ...results[body["userID"]], paid: true
        }
    } else {
        return reply.code(400).send('No user found with that ID!')
    }
    await dbInsert('UPDATE invoices SET invoiceData=? WHERE invoiceID=?', [JSON.stringify(results), body["invoiceID"]])

    reply.send()
})

fastify.post<{ Body: { authenticationKey: string, invoiceID: string, userID: string, distance: string } }>('/api/invoices/assign', async (request, reply) => {
    const { body } = request

    if (!body || !('authenticationKey' in body) || !('invoiceID' in body) || !('userID' in body) || !('distance' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    let userID = await retrieveID(body['authenticationKey'])
    if (!userID) return reply.code(400).send('No user found!')

    let data: any = await dbQuery('SELECT i.invoiceData, i.totalDistance, i.litersFilled, i.totalPrice, s.initialOdometer, s.sessionID FROM invoices i LEFT JOIN sessions s USING(sessionID) WHERE i.invoiceID=? AND s.groupID=?', [body["invoiceID"], await retrieveGroupID(body['authenticationKey'])])
    if (!data.length) return reply.code(400).send('There are no invoices with that ID!')

    let results = JSON.parse(data[0].invoiceData)
    if (!results['0']) return reply.code(400).send('No unindentified distance to assign!')

    let totalDistance = data[0]["totalDistance"]
    const pricePerLiter = data[0]['totalPrice'] / data[0]['litersFilled']
    const litersPerKm = data[0]['litersFilled'] / totalDistance

    if (results[body["userID"]]) {
        const newDistance = parseFloat(body["distance"]) + parseFloat(results[body["userID"]].distance)
        const unidentified: { fullName: string, distance: string } = results['0']
        const newUnidentified = parseFloat(unidentified.distance) - parseFloat(body["distance"])

        results[body["userID"]] = {
            ...results[body["userID"]], distance: newDistance.toFixed(2), paymentDue: (newDistance * litersPerKm * pricePerLiter).toFixed(2), liters: (newDistance * litersPerKm).toFixed(2)
        }
        if (newUnidentified <= 0) delete results["0"]
        else
            results['0'] = {
                ...results["0"], distance: newUnidentified.toFixed(2), paymentDue: (newUnidentified * litersPerKm * pricePerLiter).toFixed(2)
            }

    } else {
        return reply.code(400).send('No user found with that ID!')
    }

    await dbInsert('INSERT INTO logs(userID, distance, date, sessionID) VALUES(?,?,?,?)', [body["userID"], body["distance"], Date.now(), data[0]["sessionID"]])
    await dbInsert('UPDATE invoices SET invoiceData=? WHERE invoiceID=?', [JSON.stringify(results), body["invoiceID"]])

    reply.send()
})

// EMAIL

fastify.get<{ Querystring: { authenticationKey: string, code: string } }>('/email/verify', async (request, reply) => {
    const { query } = request

    if (!query || !('code' in query)) {
        return reply.code(400).send('Missing required field!')
    }

    const results = await dbQuery('SELECT fullName, verified, tempEmail FROM users WHERE verificationCode=?', [query['code']])
    if (!results.length) return reply.code(400).sendFile('fail.html')

    if (results[0].verified && results[0].tempEmail)
        await dbInsert('UPDATE users SET emailAddress=?, verificationCode=null, tempEmail=null WHERE verificationCode=?', [results[0].tempEmail, query['code']])
    else
        await dbInsert('UPDATE users SET verified=1, verificationCode=null WHERE verificationCode=?', [query['code']])
    await reply.sendFile('success.html')
})

fastify.post<{ Body: { emailAddress: string } }>('/email/resend', async (request, reply) => {
    const { body } = request

    if (!body || !('emailAddress' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    const emailCode = await generateEmailCode()

    await dbInsert('UPDATE users SET verificationCode=? WHERE emailAddress=?', [emailCode, body['emailAddress']])

    sendMail(body['emailAddress'], 'Verify your Mail', `Hey,<br><br>Thank you for registering for PetrolShare!<br><br>In order to activate your account, please visit <a href="https://petrolshare.freud-online.co.uk/email/verify?code=${emailCode}" target="__blank">this link!</a><br><br>Thanks,<br><br><b>The PetrolShare Team</b>`)
})

fastify.get<{ Querystring: { code: string } }>('/email/reset-password', async (request, reply) => {
    const { query } = request

    if (!query || !('code' in query)) {
        return reply.code(400).send('Missing required field!')
    }

    const results = await dbQuery('SELECT fullName, verified FROM users WHERE verificationCode=?', [query['code']])
    if (!results.length) return reply.code(400).sendFile('fail.html')
    const password = generateTempPassword()

    await dbInsert('UPDATE users SET password=?, authenticationKey=null, verificationCode=null WHERE verificationCode=?', [await argon2.hash(password), query['code']])

    await reply.view('reset-password.ejs', { password: password })
})

fastify.get<{ Querystring: { code: string } }>('/test', async (request, reply) => {
    sendNotification([{ notificationKey: "ExponentPushToken[kAgk8YHT1CczurXj67C80_]" }], 'Testing...', { route: 'Invoices', invoiceID: 440 })
})

// NOTIFY

const sendNotification = async (notifKeys: Array<any>, message: string, route?: { route: string, invoiceID?: number }) => {
    let expo = new Expo({})

    if (!notifKeys) return
    let messages = [];

    for (let pushToken of notifKeys) {
        if (!pushToken["notificationKey"]) continue

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
        })
    }
    if (!messages) return
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    (async () => {

        for (let chunk of chunks) {
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error(error);
            }
        }
    })();
    let receiptIds = [];
    for (let ticket of tickets) {
        // NOTE: Not all tickets have IDs; for example, tickets for notifications
        // that could not be enqueued will have error information and no receipt ID.
        if (ticket.id) {
            receiptIds.push(ticket.id);
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
                    let { status, message, details } = receipts[receiptId];
                    if (status === 'ok') {
                        continue;
                    } else if (status === 'error') {
                        console.error(
                            `There was an error sending a notification: ${message}`
                        );
                        if (details && details.error) {
                            console.error(`The error code is ${details.error}`);
                        }
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
    })();
}


// Run the server!
const start = async () => {
    try {
        await fastify.listen({ port: 3434 })
        console.log('Listening to traffic on 3434');
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()