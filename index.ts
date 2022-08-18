import Fastify, { FastifyInstance } from 'fastify'
import mysql from 'mysql'
require('dotenv').config()
import argon2 from 'argon2';
import cors from '@fastify/cors'

const fastify: FastifyInstance = Fastify({})
fastify.register(cors, {})

const conn = mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USERNAME, password: process.env.DB_PASSWORD, database: 'petrolshare'
})

conn.connect()

async function dbQuery(query: string, parameters?: Array<any>) {
    return new Promise<Array<any>>((res, rej) => {
        try {
            conn.query(query, parameters, ((err, results) => {
                res(results)
            }));
        }
        catch (err) {
            rej(err);
        }
    })
}

const generateCode: any = async () => {
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

fastify.post('/user/login', async (request: any, reply: any) => {
    const { body } = request

    if (!('emailAddress' in body) || !('password' in body)) {
        return reply.code(400).send('Missing required field!')
    }
    const results: Array<any> = await dbQuery('SELECT * from users WHERE emailAddress=?', [body['emailAddress']])
    if (!(results as Array<any>).length) return reply.code(400).send('Incorrect username or password.')
    if (await argon2.verify(results[0].password, body["password"])) {
        const code = results[0].authenticationKey || await generateCode()
        reply.code(200).send({ fullName: results[0].fullName, groupID: results[0].groupID, currentMileage: results[0].currentMileage, emailAddress: results[0].emailAddress, authenticationKey: code, userID: results[0].userID })

        if (!results[0].authenticationKey) {
            await dbQuery('UPDATE users SET authenticationKey=? WHERE emailAddress=?', [code, body['emailAddress']]).catch(err => console.log(err))
        }
    } else {
        reply.code(400).send('Incorrect username or password.')
    }
})

fastify.post('/user/register', async (request: any, reply: any) => {
    const { body } = request

    if (!('emailAddress' in body) || !('password' in body) || !('groupID' in body) || !('fullName' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    const results = await dbQuery('SELECT * from users WHERE emailAddress=?', [body['emailAddress']])
    if ((results as Array<any>).length) return reply.code(400).send('This user exists already!')
    const password = argon2.hash(body['password'])

    const code = await generateCode();

    await dbQuery('INSERT INTO users(groupID, fullName, emailAddress, password, authenticationKey) VALUES (?,?,?,?,?)', [body['groupID'], body['fullName'], body['emailAddress'], await password, code])

    reply.send(code)
})

fastify.get('/distance/get', async (request: any, reply: any) => {
    const { query } = request

    if (!('authenticationKey' in query)) {
        return reply.code(400).send('Missing required field!')
    }

    const results = await dbQuery('SELECT currentMileage from users WHERE authenticationKey=?', [query['authenticationKey']])
    if (!results) return reply.code(400).send('This user does not exist!')
    reply.send(results[0].currentMileage)
})

fastify.post('/distance/reset', async (request: any, reply: any) => {
    const { body } = request

    if (!body || !('authenticationKey' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    const results = await dbQuery('UPDATE users SET currentMileage=0 WHERE authenticationKey=?', [body['authenticationKey']])
    if (!results) return reply.code(400).send('This user does not exist!')

    const groupID = await retrieveGroupID(body['authenticationKey'])
    await dbQuery('UPDATE sessions SET sessionActive=false WHERE groupID=?', [groupID])

    reply.code(200)
})

fastify.post('/distance/add', async (request: any, reply: any) => {
    const { body } = request

    if (!body || !('distance' in body) || !('authenticationKey' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    const results = await dbQuery('UPDATE users SET currentMileage=currentMileage+? WHERE authenticationKey=?', [body['distance'], body['authenticationKey']])
    if (!results) return reply.code(400).send('This user does not exist!')
    const log = (await dbQuery('SELECT userID, groupID FROM users WHERE authenticationKey=?', [body['authenticationKey']]))[0]
    const sessionID = await retrieveSessionID(log.groupID)

    try {
        await dbQuery('INSERT INTO logs(userID, distance, date, groupID, sessionID) VALUES(?,?,?,?,?)', [log.userID, body["distance"], Date.now(), log.groupID, sessionID])
    } catch (err) {
        console.log(err);
    }

    reply.code(200)
})

fastify.get('/logs/get', async (request: any, reply: any) => {
    const { query } = request

    if (!('authenticationKey' in query)) {
        return reply.code(400).send('Missing required field!')
    }

    const results = await dbQuery('SELECT l.groupID, l.distance, l.date, l.logID, s.sessionStart, s.sessionEnd, s.sessionActive, s.sessionID FROM logs l LEFT JOIN sessions s USING (sessionID) WHERE l.groupID = ?', [await retrieveGroupID(query['authenticationKey'])])
    if (!results) return reply.code(400).send('There are no logs to be found')

    let flat: any = {}

    results.map(e => {
        if (!flat[e.sessionID]) flat[e.sessionID] = { logs: [] }

        flat[e.sessionID] = {
            sessionActive: e.sessionActive,
            sessionStart: e.sessionStart,
            sessionEnd: e.sessionEnd,
            logs: [...flat[e.sessionID].logs, { distance: e.distance, date: e.date, logID: e.logID }]
        }

    })

    reply.send(flat)
})


const retrieveGroupID = async (authenticationKey: string) => {
    return (await dbQuery('SELECT groupID FROM users WHERE authenticationKey=?', [authenticationKey]))[0].groupID
}

const retrieveSessionID = async (groupID: string) => {
    let res: any = await dbQuery('SELECT sessionID FROM sessions WHERE groupID=? AND sessionActive=true', [groupID])
    if (!res.length) {
        res = await dbQuery('INSERT INTO sessions (sessionStart, groupID, sessionActive) VALUES (?,?,?)', [Date.now(), groupID, true])
        return res.insertId
    }
    return res[0].sessionID
}

const retrieveID = async (authenticationKey: string) => {
    return await dbQuery('SELECT userID FROM users WHERE authenticationKey=?', [authenticationKey])
}

fastify.get('/preset/get', async (request: any, reply: any) => {
    const { query } = request

    if (!query || !('authenticationKey' in query)) {
        return reply.code(400).send('Missing required field!')
    }
    let userID = await retrieveID(query['authenticationKey'])

    if (!userID.length) {
        return reply.code(400).send('This user does not exist!')
    }

    userID = userID[0].userID

    const results = await dbQuery('SELECT presetName, distance, presetID FROM presets WHERE userID=?', [userID])
    if (!results) return reply.code(400).send('There are no presets!')

    reply.send(results)
})

fastify.post('/preset/add', async (request: any, reply: any) => {
    const { body } = request

    if (!body || !('presetName' in body) || !('distance' in body) || !('authenticationKey' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    let userID = await retrieveID(body['authenticationKey'])

    if (!userID.length) {
        return reply.code(400).send('This user does not exist!')
    }

    userID = userID[0].userID

    await dbQuery('INSERT INTO presets (presetName, distance, userID) VALUES (?,?,?)', [body['presetName'], body['distance'], userID])
    reply.code(200)
})

fastify.post('/preset/edit', async (request: any, reply: any) => {
    const { body } = request

    if (!body || !('presetID' in body) || !('presetName' in body) || !('distance' in body) || !('authenticationKey' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    let userID = await retrieveID(body['authenticationKey'])

    if (!userID.length) {
        return reply.code(400).send('This user does not exist!')
    }

    userID = userID[0].userID

    await dbQuery('UPDATE presets SET presetName=?, distance=? WHERE presetID=?', [body['presetName'], body['distance'], body['presetID']])
    reply.code(200)
})

fastify.post('/preset/delete', async (request: any, reply: any) => {
    const { body } = request

    if (!body || !('presetID' in body) || !('authenticationKey' in body)) {
        return reply.code(400).send('Missing required field!')
    }

    const userID = await retrieveID(body['authenticationKey'])

    if (!userID.length) {
        return reply.code(400).send('This user does not exist!')
    }


    await dbQuery('DELETE FROM presets WHERE presetID=?', [body['presetID']])
    reply.code(200)
})

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