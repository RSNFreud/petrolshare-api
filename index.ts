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



fastify.post('/user/login', async (request: any, reply: any) => {
    const { body } = request

    if (!('emailAddress' in body) || !('password' in body)) {
        return reply.code(400).send('Missing required field!')
    }
    const results: Array<any> = await dbQuery('SELECT * from users WHERE emailAddress=?', [body['emailAddress']])
    if (!(results as Array<any>).length) return reply.code(400).send('Incorrect username or password.')
    if (await argon2.verify(results[0].password, body["password"])) {
        reply.code(200).send({ fullName: results[0].fullName, groupID: results[0].groupID, currentMileage: results[0].currentMileage })
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

    const res = await dbQuery('INSERT INTO users(groupID, fullName, emailAddress, password) VALUES (?,?,?,?)', [body['groupID'], body['fullName'], body['emailAddress'], await password])
    console.log(res);

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