"use strict";
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
                reply.code(200).send({ fullName: results[0].fullName, groupID: results[0].groupID, currentMileage: results[0].currentMileage, emailAddress: results[0].emailAddress, authenticationKey: code, userID: results[0].userID });
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
fastify.get('/data/mileage', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var query, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = request.query;
                if (!('authenticationKey' in query)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, dbQuery('SELECT currentMileage from users WHERE authenticationKey=?', [query['authenticationKey']])];
            case 1:
                results = _a.sent();
                if (!results)
                    return [2 /*return*/, reply.code(400).send('This user does not exist!')];
                reply.send(results[0].currentMileage);
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/data/reset', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = request.body;
                if (!body || !('authenticationKey' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, dbQuery('UPDATE users SET currentMileage=0 WHERE authenticationKey=?', [body['authenticationKey']])];
            case 1:
                results = _a.sent();
                if (!results)
                    return [2 /*return*/, reply.code(400).send('This user does not exist!')];
                reply.code(200);
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/data/add', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = request.body;
                if (!body || !('distance' in body) || !('authenticationKey' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, dbQuery('UPDATE users SET currentMileage=currentMileage+? WHERE authenticationKey=?', [body['distance'], body['authenticationKey']])];
            case 1:
                results = _a.sent();
                if (!results)
                    return [2 /*return*/, reply.code(400).send('This user does not exist!')];
                reply.code(200);
                return [2 /*return*/];
        }
    });
}); });
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
    var err_1;
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
                err_1 = _a.sent();
                fastify.log.error(err_1);
                process.exit(1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
start();
