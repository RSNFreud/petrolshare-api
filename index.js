"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fastify_1 = __importDefault(require("fastify"));
var mysql_1 = __importDefault(require("mysql"));
require('dotenv').config();
var argon2_1 = __importDefault(require("argon2"));
var cors_1 = __importDefault(require("@fastify/cors"));
var fastify = (0, fastify_1.default)({});
fastify.register(cors_1.default, {});
var conn = mysql_1.default.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USERNAME, password: process.env.DB_PASSWORD, database: 'petrolshare'
});
conn.connect();
function dbQuery(query, parameters) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    try {
                        conn.query(query, parameters, (function (err, results) {
                            res(results);
                        }));
                    }
                    catch (err) {
                        rej(err);
                    }
                })];
        });
    });
}
var generateCode = function () { return __awaiter(void 0, void 0, void 0, function () {
    var result, characters, charactersLength, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                result = '';
                characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                charactersLength = characters.length;
                for (i = 0; i < 25; i++) {
                    result += characters.charAt(Math.floor(Math.random() *
                        charactersLength));
                }
                return [4 /*yield*/, dbQuery('SELECT * from users where authenticationKey=?', [result])];
            case 1:
                if ((_a.sent()).length)
                    return [2 /*return*/, generateCode()];
                return [2 /*return*/, result];
        }
    });
}); };
fastify.post('/user/login', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, results, code, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                body = request.body;
                if (!('emailAddress' in body) || !('password' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, dbQuery('SELECT * from users WHERE emailAddress=?', [body['emailAddress']])];
            case 1:
                results = _b.sent();
                if (!results.length)
                    return [2 /*return*/, reply.code(400).send('Incorrect username or password.')];
                return [4 /*yield*/, argon2_1.default.verify(results[0].password, body["password"])];
            case 2:
                if (!_b.sent()) return [3 /*break*/, 7];
                _a = results[0].authenticationKey;
                if (_a) return [3 /*break*/, 4];
                return [4 /*yield*/, generateCode()];
            case 3:
                _a = (_b.sent());
                _b.label = 4;
            case 4:
                code = _a;
                reply.code(200).send({ fullName: results[0].fullName, groupID: results[0].groupID, emailAddress: results[0].emailAddress, authenticationKey: code, userID: results[0].userID });
                if (!!results[0].authenticationKey) return [3 /*break*/, 6];
                return [4 /*yield*/, dbQuery('UPDATE users SET authenticationKey=? WHERE emailAddress=?', [code, body['emailAddress']]).catch(function (err) { return console.log(err); })];
            case 5:
                _b.sent();
                _b.label = 6;
            case 6: return [3 /*break*/, 8];
            case 7:
                reply.code(400).send('Incorrect username or password.');
                _b.label = 8;
            case 8: return [2 /*return*/];
        }
    });
}); });
fastify.post('/user/register', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, results, password, code, _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                body = request.body;
                if (!('emailAddress' in body) || !('password' in body) || !('groupID' in body) || !('fullName' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, dbQuery('SELECT * from users WHERE emailAddress=?', [body['emailAddress']])];
            case 1:
                results = _d.sent();
                if (results.length)
                    return [2 /*return*/, reply.code(400).send('This user exists already!')];
                password = argon2_1.default.hash(body['password']);
                return [4 /*yield*/, generateCode()];
            case 2:
                code = _d.sent();
                _a = dbQuery;
                _b = ['INSERT INTO users(groupID, fullName, emailAddress, password, authenticationKey) VALUES (?,?,?,?,?)'];
                _c = [body['groupID'], body['fullName'], body['emailAddress']];
                return [4 /*yield*/, password];
            case 3: return [4 /*yield*/, _a.apply(void 0, _b.concat([_c.concat([_d.sent(), code])]))];
            case 4:
                _d.sent();
                reply.send(code);
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/user/change-group', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = request.body;
                if (!('authenticationKey' in body) || !('groupID' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, dbQuery('SELECT groupID FROM users WHERE groupID=?', [body['groupID']])];
            case 1:
                results = _a.sent();
                if (!results.length)
                    return [2 /*return*/, reply.code(400).send("There is no group with that ID")];
                return [4 /*yield*/, dbQuery('UPDATE users SET groupID=? WHERE authenticationKey=?', [body['groupID'], body['authenticationKey']])];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
fastify.get('/user/get', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var query, userID, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = request.query;
                if (!('authenticationKey' in query)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, retrieveID(query['authenticationKey'])];
            case 1:
                userID = (_a.sent())[0].userID;
                return [4 /*yield*/, dbQuery('SELECT fullName, groupID FROM users WHERE userID=?', [userID])];
            case 2:
                results = _a.sent();
                if (!results)
                    return [2 /*return*/, reply.send('No user found!').code(400)];
                reply.send(results);
                return [2 /*return*/];
        }
    });
}); });
fastify.get('/distance/get', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var query, userID, results, total;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = request.query;
                if (!('authenticationKey' in query)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, retrieveID(query['authenticationKey'])];
            case 1:
                userID = (_a.sent())[0].userID;
                return [4 /*yield*/, dbQuery('SELECT l.distance, s.sessionActive from logs l LEFT JOIN sessions s USING (sessionID) WHERE userID=? AND s.sessionActive=1', [userID])];
            case 2:
                results = _a.sent();
                if (!results)
                    return [2 /*return*/, reply.send(0)];
                total = 0;
                results.map(function (_a) {
                    var distance = _a.distance;
                    total += distance;
                });
                reply.send(Math.round(total * 10) / 10);
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/distance/reset', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, groupID;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = request.body;
                if (!body || !('authenticationKey' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, retrieveGroupID(body['authenticationKey'])];
            case 1:
                groupID = _a.sent();
                return [4 /*yield*/, dbQuery('UPDATE sessions SET sessionActive=false, sessionEnd=? WHERE groupID=?', [Date.now(), groupID])];
            case 2:
                _a.sent();
                retrieveSessionID(groupID);
                reply.code(200);
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/distance/add', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, results, log, sessionID, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = request.body;
                if (!body || !('distance' in body) || !('authenticationKey' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, dbQuery('SELECT * FROM users WHERE authenticationKey=?', [body['distance'], body['authenticationKey']])];
            case 1:
                results = _a.sent();
                if (!results)
                    return [2 /*return*/, reply.code(400).send('This user does not exist!')];
                return [4 /*yield*/, dbQuery('SELECT userID, groupID FROM users WHERE authenticationKey=?', [body['authenticationKey']])];
            case 2:
                log = (_a.sent())[0];
                return [4 /*yield*/, retrieveSessionID(log.groupID)];
            case 3:
                sessionID = _a.sent();
                _a.label = 4;
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, dbQuery('INSERT INTO logs(userID, distance, date, sessionID) VALUES(?,?,?,?)', [log.userID, body["distance"], Date.now(), sessionID])];
            case 5:
                _a.sent();
                return [3 /*break*/, 7];
            case 6:
                err_1 = _a.sent();
                console.log(err_1);
                return [3 /*break*/, 7];
            case 7:
                reply.code(200);
                return [2 /*return*/];
        }
    });
}); });
fastify.get('/logs/get', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var query, sessions, _a, _b, logs, _c, _d, flat;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                query = request.query;
                if (!('authenticationKey' in query)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                _a = dbQuery;
                _b = ['SELECT sessionStart, sessionEnd, sessionActive, sessionID FROM sessions WHERE groupID = ?'];
                return [4 /*yield*/, retrieveGroupID(query['authenticationKey'])];
            case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([[_e.sent()]]))];
            case 2:
                sessions = _e.sent();
                if (!sessions)
                    return [2 /*return*/, reply.code(400).send('There are no sessions to be found')];
                _c = dbQuery;
                _d = ['SELECT s.groupID, u.fullName, l.distance, l.date, l.logID, s.sessionID FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON u.userID = l.userID WHERE s.groupID = ? ORDER BY l.date DESC'];
                return [4 /*yield*/, retrieveGroupID(query['authenticationKey'])];
            case 3: return [4 /*yield*/, _c.apply(void 0, _d.concat([[_e.sent()]]))];
            case 4:
                logs = _e.sent();
                flat = {};
                sessions.map(function (e) {
                    if (!flat[e.sessionID])
                        flat[e.sessionID] = { logs: [] };
                    flat[e.sessionID] = {
                        sessionID: e.sessionID,
                        sessionActive: e.sessionActive,
                        sessionStart: e.sessionStart,
                        sessionEnd: e.sessionEnd,
                        logs: []
                    };
                });
                logs.map(function (e) {
                    if (!flat[e.sessionID])
                        flat[e.sessionID] = { logs: [] };
                    flat[e.sessionID] = __assign(__assign({}, flat[e.sessionID]), { logs: __spreadArray(__spreadArray([], flat[e.sessionID].logs, true), [{ fullName: e.fullName, distance: e.distance, date: e.date, logID: e.logID }], false) });
                });
                reply.send(flat);
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/logs/delete', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, userID, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = request.body;
                if (!('authenticationKey' in body) || !('logID' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, retrieveID(body['authenticationKey'])];
            case 1:
                userID = (_a.sent())[0].userID;
                return [4 /*yield*/, dbQuery('SELECT u.userID, l.distance, l.logID, s.sessionActive FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON u.userID = l.userID WHERE l.logID = ?', [body['logID']])];
            case 2:
                results = _a.sent();
                if (results[0].userID !== userID) {
                    return [2 /*return*/, reply.code(400).send('Insufficient permissions!')];
                }
                return [4 /*yield*/, dbQuery('DELETE FROM logs WHERE logID=?', [body["logID"]])];
            case 3:
                _a.sent();
                if (!results)
                    return [2 /*return*/, reply.code(400).send('There are no logs to be found')];
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/logs/edit', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, userID, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = request.body;
                if (!('authenticationKey' in body) || !('logID' in body) || !('distance' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, retrieveID(body['authenticationKey'])];
            case 1:
                userID = (_a.sent())[0].userID;
                return [4 /*yield*/, dbQuery('SELECT u.userID, l.distance, l.logID, s.sessionActive FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON u.userID = l.userID WHERE l.logID = ?', [body['logID']])];
            case 2:
                results = _a.sent();
                if (!results.length)
                    return [2 /*return*/, reply.code(400).send('No log found with that ID')];
                if (results[0].userID !== userID) {
                    return [2 /*return*/, reply.code(400).send('Insufficient permissions!')];
                }
                return [4 /*yield*/, dbQuery('UPDATE logs SET distance=? WHERE logID=?', [body["distance"], body["logID"]])];
            case 3:
                _a.sent();
                if (!results)
                    return [2 /*return*/, reply.code(400).send('There are no logs to be found')];
                return [2 /*return*/];
        }
    });
}); });
var retrieveGroupID = function (authenticationKey) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dbQuery('SELECT groupID FROM users WHERE authenticationKey=?', [authenticationKey])];
            case 1: return [2 /*return*/, (_a.sent())[0].groupID];
        }
    });
}); };
var retrieveSessionID = function (groupID) { return __awaiter(void 0, void 0, void 0, function () {
    var res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dbQuery('SELECT sessionID FROM sessions WHERE groupID=? AND sessionActive=true', [groupID])];
            case 1:
                res = _a.sent();
                if (!!res.length) return [3 /*break*/, 3];
                return [4 /*yield*/, dbQuery('INSERT INTO sessions (sessionStart, groupID, sessionActive) VALUES (?,?,?)', [Date.now(), groupID, true])];
            case 2:
                res = _a.sent();
                return [2 /*return*/, res.insertId];
            case 3: return [2 /*return*/, res[0].sessionID];
        }
    });
}); };
var retrieveID = function (authenticationKey) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dbQuery('SELECT userID FROM users WHERE authenticationKey=?', [authenticationKey])];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
fastify.get('/preset/get', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var query, userID, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = request.query;
                if (!query || !('authenticationKey' in query)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, retrieveID(query['authenticationKey'])];
            case 1:
                userID = _a.sent();
                if (!userID.length) {
                    return [2 /*return*/, reply.code(400).send('This user does not exist!')];
                }
                userID = userID[0].userID;
                return [4 /*yield*/, dbQuery('SELECT presetName, distance, presetID FROM presets WHERE userID=?', [userID])];
            case 2:
                results = _a.sent();
                if (!results)
                    return [2 /*return*/, reply.code(400).send('There are no presets!')];
                reply.send(results);
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/preset/add', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, userID;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = request.body;
                if (!body || !('presetName' in body) || !('distance' in body) || !('authenticationKey' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, retrieveID(body['authenticationKey'])];
            case 1:
                userID = _a.sent();
                if (!userID.length) {
                    return [2 /*return*/, reply.code(400).send('This user does not exist!')];
                }
                userID = userID[0].userID;
                return [4 /*yield*/, dbQuery('INSERT INTO presets (presetName, distance, userID) VALUES (?,?,?)', [body['presetName'], body['distance'], userID])];
            case 2:
                _a.sent();
                reply.code(200);
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/preset/edit', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, userID;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = request.body;
                if (!body || !('presetID' in body) || !('presetName' in body) || !('distance' in body) || !('authenticationKey' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, retrieveID(body['authenticationKey'])];
            case 1:
                userID = _a.sent();
                if (!userID.length) {
                    return [2 /*return*/, reply.code(400).send('This user does not exist!')];
                }
                userID = userID[0].userID;
                return [4 /*yield*/, dbQuery('UPDATE presets SET presetName=?, distance=? WHERE presetID=?', [body['presetName'], body['distance'], body['presetID']])];
            case 2:
                _a.sent();
                reply.code(200);
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/preset/delete', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, userID;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = request.body;
                if (!body || !('presetID' in body) || !('authenticationKey' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, retrieveID(body['authenticationKey'])];
            case 1:
                userID = _a.sent();
                if (!userID.length) {
                    return [2 /*return*/, reply.code(400).send('This user does not exist!')];
                }
                return [4 /*yield*/, dbQuery('DELETE FROM presets WHERE presetID=?', [body['presetID']])];
            case 2:
                _a.sent();
                reply.code(200);
                return [2 /*return*/];
        }
    });
}); });
// Run the server!
var start = function () { return __awaiter(void 0, void 0, void 0, function () {
    var err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, fastify.listen({ port: 3434 })];
            case 1:
                _a.sent();
                console.log('Listening to traffic on 3434');
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                fastify.log.error(err_2);
                process.exit(1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
start();
