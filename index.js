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
var nodemailer_1 = __importDefault(require("nodemailer"));
var expo_server_sdk_1 = __importDefault(require("expo-server-sdk"));
var fastify = (0, fastify_1.default)({});
fastify.register(require('@fastify/static'), {
    root: __dirname,
});
fastify.register(require("@fastify/view"), {
    engine: {
        ejs: require("ejs"),
    },
});
fastify.register(cors_1.default, {});
var conn = mysql_1.default.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USERNAME, password: process.env.DB_PASSWORD, database: 'petrolshare'
});
conn.connect();
var sendMail = function (address, subject, message) { return __awaiter(void 0, void 0, void 0, function () {
    var transporter, info, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                transporter = nodemailer_1.default.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.EMAIL_ADDRESS,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, transporter.sendMail({
                        from: '"PetrolShare" <petrolshare@freud-online.co.uk>',
                        to: address,
                        subject: subject,
                        html: message,
                    })];
            case 2:
                info = _a.sent();
                console.log("Message sent: %s", info.messageId);
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                console.log('Google blocked email sending!');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
function dbQuery(query, parameters) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    try {
                        conn.query(query, parameters, (function (err, results) {
                            if (err)
                                rej(err);
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
function dbInsert(query, parameters) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    try {
                        conn.query(query, parameters, (function (err, results) {
                            if (err)
                                rej(err);
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
var generateEmailCode = function () { return __awaiter(void 0, void 0, void 0, function () {
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
                return [4 /*yield*/, dbQuery('SELECT * from users where verificationCode=?', [result])];
            case 1:
                if ((_a.sent()).length)
                    return [2 /*return*/, generateEmailCode()];
                return [2 /*return*/, result];
        }
    });
}); };
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
var generateTempPassword = function () {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*+=';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
};
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
                return [4 /*yield*/, dbInsert('INSERT INTO sessions (sessionStart, groupID, sessionActive) VALUES (?,?,?)', [Date.now(), groupID, true])];
            case 2:
                res = _a.sent();
                return [2 /*return*/, res.insertId];
            case 3: return [2 /*return*/, res[0].sessionID];
        }
    });
}); };
var retrieveID = function (authenticationKey) { return __awaiter(void 0, void 0, void 0, function () {
    var res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dbQuery('SELECT userID FROM users WHERE authenticationKey=?', [authenticationKey])];
            case 1:
                res = _a.sent();
                if (!res.length)
                    return [2 /*return*/];
                return [2 /*return*/, res[0].userID];
        }
    });
}); };
var retrieveName = function (userID) { return __awaiter(void 0, void 0, void 0, function () {
    var res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dbQuery('SELECT fullName FROM users WHERE userID=?', [userID])];
            case 1:
                res = _a.sent();
                if (!res.length)
                    return [2 /*return*/, ""];
                return [2 /*return*/, res[0].fullName];
        }
    });
}); };
// USER
fastify.post('/api/user/login', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
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
                if (!results[0]["verified"])
                    return [2 /*return*/, reply.code(400).send('Please verify your account!')];
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
                return [4 /*yield*/, dbInsert('UPDATE users SET authenticationKey=? WHERE emailAddress=?', [code, body['emailAddress']]).catch(function (err) { return console.log(err); })];
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
fastify.post('/api/notify/register', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = request.body;
                if (!('emailAddress' in body) || !('notificationKey' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, dbInsert('UPDATE users SET notificationKey=? WHERE emailAddress=?', [body["notificationKey"], body["emailAddress"]])];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/api/notify/deregister', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = request.body;
                if (!('emailAddress' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, dbInsert('UPDATE users SET notificationKey=null WHERE emailAddress=?', [body["notificationKey"], body["emailAddress"]])];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/api/user/register', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, results, password, code, emailCode, _a, _b, _c;
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
                return [4 /*yield*/, generateEmailCode()];
            case 3:
                emailCode = _d.sent();
                _a = dbInsert;
                _b = ['INSERT INTO users(groupID, fullName, emailAddress, password, authenticationKey, verificationCode) VALUES (?,?,?,?,?,?)'];
                _c = [body['groupID'], body['fullName'], body['emailAddress']];
                return [4 /*yield*/, password];
            case 4: return [4 /*yield*/, _a.apply(void 0, _b.concat([_c.concat([_d.sent(), code, emailCode])]))];
            case 5:
                _d.sent();
                sendMail(body['emailAddress'], 'Verify your Mail', "Hey " + body['fullName'] + ",<br><br>Thank you for registering for PetrolShare!<br><br>In order to activate your account, please visit <a href=\"https://petrolshare.freud-online.co.uk/email/verify?code=" + emailCode + "\" target=\"__blank\">this link!</a><br><br>Thanks,<br><br><b>The PetrolShare Team</b>");
                reply.send(code);
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/api/group/create', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = request.body;
                if (!('authenticationKey' in body) || !('groupID' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, dbQuery('UPDATE users SET groupID=? WHERE authenticationKey=?', [body['groupID'], body['authenticationKey']])];
            case 1:
                _a.sent();
                return [4 /*yield*/, dbInsert('INSERT INTO groups (groupID) VALUES (?)', [body['groupID']])];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/api/group/update', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, groupID;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = request.body;
                if (!('authenticationKey' in body) || !('distance' in body) || !('petrol' in body) || !('currency' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, retrieveGroupID(body['authenticationKey'])];
            case 1:
                groupID = _a.sent();
                return [4 /*yield*/, dbQuery('UPDATE groups SET distance=?, petrol=?, currency=? WHERE groupID=?', [body['distance'], body['petrol'], body['currency'], groupID])];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
fastify.get('/api/group/get', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var query, groupID, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = request.query;
                if (!('authenticationKey' in query)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, retrieveGroupID(query['authenticationKey'])];
            case 1:
                groupID = _a.sent();
                return [4 /*yield*/, dbQuery('SELECT * FROM groups WHERE groupID=?', [groupID])];
            case 2:
                res = _a.sent();
                if (!res)
                    return [2 /*return*/];
                reply.send(res[0]);
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/api/user/change-group', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
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
fastify.post('/api/user/change-email', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, emailCode, results, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                body = request.body;
                if (!('authenticationKey' in body) || !('newEmail' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, generateEmailCode()];
            case 1:
                emailCode = _c.sent();
                _a = dbQuery;
                _b = ['SELECT emailAddress FROM users WHERE userID=?'];
                return [4 /*yield*/, retrieveID(body['authenticationKey'])];
            case 2: return [4 /*yield*/, _a.apply(void 0, _b.concat([[_c.sent()]]))];
            case 3:
                results = _c.sent();
                if (!results.length)
                    return [2 /*return*/, reply.code(400).send("There is no user with that ID")];
                return [4 /*yield*/, dbQuery('UPDATE users SET verificationCode=?, tempEmail=? WHERE authenticationKey=?', [emailCode, body['newEmail'], body['authenticationKey']])];
            case 4:
                _c.sent();
                sendMail(body['newEmail'], 'PetrolShare - Change Email Address', "Hi!<br><br>We have received a request to change your email to this address. Please click <a href=\"https://petrolshare.freud-online.co.uk/email/verify?code=" + emailCode + "\" target=\"_blank\">here<a/> to confirm this change.<br><br>If this wasn't requested by you, feel free to ignore this and nothing will happen.<br><br>Thanks<br>The PetrolShare Team");
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/api/user/forgot-password', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, emailCode, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = request.body;
                if (!('emailAddress' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, generateEmailCode()];
            case 1:
                emailCode = _a.sent();
                return [4 /*yield*/, dbQuery('SELECT emailAddress FROM users WHERE emailAddress=?', [body['emailAddress']])];
            case 2:
                results = _a.sent();
                if (!results.length)
                    return [2 /*return*/, reply.code(400).send("There is no user with that email address")];
                return [4 /*yield*/, dbQuery('UPDATE users SET verificationCode=? WHERE emailAddress=?', [emailCode, body['emailAddress']])];
            case 3:
                _a.sent();
                sendMail(body['emailAddress'], 'PetrolShare - Forgot your Password', "Hi!<br><br>We have received a request to reset your password. Please click <a href=\"https://petrolshare.freud-online.co.uk/email/reset-password?code=" + emailCode + "\" target=\"_blank\">here<a/> to confirm this change.<br><br>If this wasn't requested by you, feel free to ignore this and nothing will happen.<br><br>Thanks<br>The PetrolShare Team");
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/api/user/change-name', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, results, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                body = request.body;
                if (!('authenticationKey' in body) || !('newName' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                _a = dbQuery;
                _b = ['SELECT fullName FROM users WHERE userID=?'];
                return [4 /*yield*/, retrieveID(body['authenticationKey'])];
            case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([[_c.sent()]]))];
            case 2:
                results = _c.sent();
                if (!results.length)
                    return [2 /*return*/, reply.code(400).send("There is no user with that ID")];
                return [4 /*yield*/, dbQuery('UPDATE users SET fullName=? WHERE authenticationKey=?', [body['newName'], body['authenticationKey']])];
            case 3:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/api/user/change-password', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, results, _a, _b, password;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                body = request.body;
                if (!('authenticationKey' in body) || !('newPassword' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                _a = dbQuery;
                _b = ['SELECT fullName FROM users WHERE userID=?'];
                return [4 /*yield*/, retrieveID(body['authenticationKey'])];
            case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([[_c.sent()]]))];
            case 2:
                results = _c.sent();
                if (!results.length)
                    return [2 /*return*/, reply.code(400).send("There is no user with that ID")];
                return [4 /*yield*/, argon2_1.default.hash(body['newPassword'])];
            case 3:
                password = _c.sent();
                return [4 /*yield*/, dbQuery('UPDATE users SET password=?, authenticationKey=null WHERE authenticationKey=?', [password, body['authenticationKey']])];
            case 4:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
fastify.get('/api/user/verify', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var query, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = request.query;
                if (!('authenticationKey' in query)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, dbQuery('SELECT * from users WHERE authenticationKey=?', [query['authenticationKey']])];
            case 1:
                results = _a.sent();
                if (!results)
                    return [2 /*return*/, reply.code(400).send('No user found!')];
                reply.code(200).send({ fullName: results[0].fullName, groupID: results[0].groupID, emailAddress: results[0].emailAddress, userID: results[0].userID });
                return [2 /*return*/];
        }
    });
}); });
fastify.get('/api/user/get', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
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
                userID = _a.sent();
                if (!userID)
                    return [2 /*return*/, reply.code(400).send('No user found!')];
                return [4 /*yield*/, dbQuery('SELECT fullName, groupID FROM users WHERE userID=?', [userID])];
            case 2:
                results = _a.sent();
                if (!results.length)
                    return [2 /*return*/, reply.code(400).send('No user found!')];
                reply.send(results);
                return [2 /*return*/];
        }
    });
}); });
// DISTANCE
fastify.get('/api/distance/get', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var query, userID, results, _a, _b, _c, total;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                query = request.query;
                if (!('authenticationKey' in query)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, retrieveID(query['authenticationKey'])];
            case 1:
                userID = _d.sent();
                if (!userID)
                    return [2 /*return*/, reply.code(400).send('No user found!')];
                _a = dbQuery;
                _b = ['SELECT l.distance, s.sessionActive from logs l LEFT JOIN sessions s USING (sessionID) WHERE userID=? AND s.sessionActive=1 AND s.groupID=?'];
                _c = [userID];
                return [4 /*yield*/, retrieveGroupID(query['authenticationKey'])];
            case 2: return [4 /*yield*/, _a.apply(void 0, _b.concat([_c.concat([_d.sent()])]))];
            case 3:
                results = _d.sent();
                if (!results.length)
                    return [2 /*return*/, reply.send(0)];
                total = 0;
                results.map(function (_a) {
                    var distance = _a.distance;
                    total += distance;
                });
                reply.send(Math.round(total * 100) / 100);
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/api/distance/reset', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
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
fastify.post('/api/distance/add', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, results, log, sessionID, err_2;
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
                return [4 /*yield*/, dbInsert('INSERT INTO logs(userID, distance, date, sessionID) VALUES(?,?,?,?)', [log.userID, body["distance"], Date.now(), sessionID])];
            case 5:
                _a.sent();
                return [3 /*break*/, 7];
            case 6:
                err_2 = _a.sent();
                console.log(err_2);
                return [3 /*break*/, 7];
            case 7:
                reply.code(200);
                return [2 /*return*/];
        }
    });
}); });
// LOGS
fastify.get('/api/logs/get', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
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
fastify.post('/api/logs/delete', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
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
                userID = _a.sent();
                if (!userID)
                    return [2 /*return*/, reply.code(400).send('No user found!')];
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
fastify.post('/api/logs/edit', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
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
                userID = _a.sent();
                if (!userID)
                    return [2 /*return*/, reply.code(400).send('No user found!')];
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
// PRESETS
fastify.get('/api/preset/get', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
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
                if (!userID)
                    return [2 /*return*/, reply.code(400).send('No user found!')];
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
fastify.post('/api/preset/add', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
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
                if (!userID)
                    return [2 /*return*/, reply.code(400).send('No user found!')];
                return [4 /*yield*/, dbInsert('INSERT INTO presets (presetName, distance, userID) VALUES (?,?,?)', [body['presetName'], body['distance'], userID])];
            case 2:
                _a.sent();
                reply.code(200);
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/api/preset/edit', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
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
                if (!userID)
                    return [2 /*return*/, reply.code(400).send('No user found!')];
                return [4 /*yield*/, dbQuery('UPDATE presets SET presetName=?, distance=? WHERE presetID=?', [body['presetName'], body['distance'], body['presetID']])];
            case 2:
                _a.sent();
                reply.code(200);
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/api/preset/delete', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
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
                if (!userID)
                    return [2 /*return*/, reply.code(400).send('No user found!')];
                return [4 /*yield*/, dbQuery('DELETE FROM presets WHERE presetID=?', [body['presetID']])];
            case 2:
                _a.sent();
                reply.code(200);
                return [2 /*return*/];
        }
    });
}); });
// PETROL
fastify.post('/api/petrol/add', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, results, _a, _b, distances, i, e, totalDistance, pricePerLiter, totalCarDistance, litersPerKm, userID, _c, _d, _e, _f, _g, _h, res, _j, _k, _l;
    return __generator(this, function (_m) {
        switch (_m.label) {
            case 0:
                body = request.body;
                if (!body || !('totalPrice' in body) || !('litersFilled' in body) || !('authenticationKey' in body) || !('odometer' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                _a = dbQuery;
                _b = ['SELECT l.distance, s.sessionActive, s.initialOdometer, s.sessionID, u.fullName, u.notificationKey, u.userID FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON l.userID = u.userID WHERE s.groupID=? AND s.sessionActive=1'];
                return [4 /*yield*/, retrieveGroupID(body['authenticationKey'])];
            case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([[_m.sent()]]))];
            case 2:
                results = _m.sent();
                if (!results || !results.length)
                    return [2 /*return*/, reply.code(400).send('No logs found')];
                distances = {};
                for (i = 0; i < results.length; i++) {
                    e = results[i];
                    if (!(e.userID in distances)) {
                        distances[e.userID] = { distance: 0, fullName: e["fullName"] };
                    }
                    distances[e.userID] = { distance: distances[e.userID].distance + parseFloat(e.distance), fullName: e["fullName"] };
                }
                totalDistance = Object.values(distances).reduce(function (a, b) { return a["distance"] || 0 + b["distance"]; }, 0);
                pricePerLiter = body['totalPrice'] / body['litersFilled'];
                totalCarDistance = body['odometer'] - results[0]['initialOdometer'];
                litersPerKm = body['litersFilled'] / (results[0]['initialOdometer'] && totalCarDistance > 0 ? totalCarDistance : totalDistance);
                return [4 /*yield*/, retrieveID(body['authenticationKey'])];
            case 3:
                userID = _m.sent();
                Object.entries(distances).map(function (_a) {
                    var key = _a[0], value = _a[1];
                    distances[key] = { fullName: value.fullName, paymentDue: Math.round((value.distance * litersPerKm * pricePerLiter) * 100) / 100, paid: parseInt(key) === userID, distance: Math.round(value.distance * 100) / 100 };
                });
                if (results[0]['initialOdometer'] && totalCarDistance !== totalDistance && (totalCarDistance - totalDistance > 0)) {
                    distances[0] = { fullName: 'Unaccounted Distance', paymentDue: Math.round(((totalCarDistance - totalDistance) * litersPerKm * pricePerLiter) * 100) / 100, paid: false, distance: totalCarDistance - totalDistance };
                }
                _c = dbInsert;
                _d = ['UPDATE sessions SET sessionActive=0, sessionEnd=? WHERE groupID=? AND sessionActive=1'];
                _e = [Date.now()];
                return [4 /*yield*/, retrieveGroupID(body['authenticationKey'])];
            case 4: return [4 /*yield*/, _c.apply(void 0, _d.concat([_e.concat([_m.sent()])]))];
            case 5:
                _m.sent();
                _f = dbInsert;
                _g = ['INSERT INTO sessions (sessionStart, groupID, sessionActive, initialOdometer) VALUES (?,?,?,?)'];
                _h = [Date.now()];
                return [4 /*yield*/, retrieveGroupID(body['authenticationKey'])];
            case 6: return [4 /*yield*/, _f.apply(void 0, _g.concat([_h.concat([_m.sent(), true, body['odometer']])]))];
            case 7:
                _m.sent();
                _j = dbInsert;
                _k = ['INSERT INTO invoices (invoiceData, sessionID, totalPrice, totalDistance, userID, litersFilled) VALUES (?,?,?,?,?,?)'];
                _l = [JSON.stringify(distances), results[0].sessionID, body['totalPrice'], Math.round(totalDistance * 100) / 100];
                return [4 /*yield*/, retrieveID(body['authenticationKey'])];
            case 8: return [4 /*yield*/, _j.apply(void 0, _k.concat([_l.concat([_m.sent(), body['litersFilled']])]))];
            case 9:
                res = _m.sent();
                sendNotification(results.filter(function (e) { return e.userID !== userID; }), "You have a new invoice waiting!", { screenName: "Invoices", invoiceID: res["insertId"] });
                reply.send(res['insertId']);
                return [2 /*return*/];
        }
    });
}); });
// INVOICES
fastify.get('/api/invoices/get', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var query, userID, results_1, _a, _b, results, _c, _d, _e, i, e, data, i_1, key, name_1;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                query = request.query;
                if (!query || !('authenticationKey' in query)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, retrieveID(query['authenticationKey'])];
            case 1:
                userID = _f.sent();
                if (!userID)
                    return [2 /*return*/, reply.code(400).send('No user found!')];
                if (!!('invoiceID' in query)) return [3 /*break*/, 4];
                _a = dbQuery;
                _b = ['SELECT i.invoiceID, s.sessionEnd FROM invoices i LEFT JOIN sessions s USING (sessionID) WHERE s.groupID=? ORDER BY s.sessionEnd DESC'];
                return [4 /*yield*/, retrieveGroupID(query['authenticationKey'])];
            case 2: return [4 /*yield*/, _a.apply(void 0, _b.concat([[_f.sent()]]))];
            case 3:
                results_1 = _f.sent();
                if (!results_1.length)
                    return [2 /*return*/, reply.code(400).send('There are no invoices in that group!')];
                return [2 /*return*/, reply.send(results_1)];
            case 4:
                _c = dbQuery;
                _d = ['SELECT u.fullName, i.invoiceData, i.totalDistance, s.sessionEnd, i.totalPrice FROM invoices i LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u USING (userID) WHERE i.invoiceID=? AND s.groupID=?'];
                _e = [query["invoiceID"]];
                return [4 /*yield*/, retrieveGroupID(query['authenticationKey'])];
            case 5: return [4 /*yield*/, _c.apply(void 0, _d.concat([_e.concat([_f.sent()])]))];
            case 6:
                results = _f.sent();
                if (!results.length)
                    return [2 /*return*/, reply.code(400).send('There are no invoices with that ID!')];
                i = 0;
                _f.label = 7;
            case 7:
                if (!(i < results.length)) return [3 /*break*/, 12];
                e = results[i];
                data = JSON.parse(e.invoiceData);
                i_1 = 0;
                _f.label = 8;
            case 8:
                if (!(i_1 < Object.keys(data).length)) return [3 /*break*/, 11];
                key = Object.keys(data)[i_1];
                return [4 /*yield*/, retrieveName(key)];
            case 9:
                name_1 = _f.sent();
                if (name_1)
                    data[key]["fullName"] = name_1;
                e.invoiceData = JSON.stringify(data);
                _f.label = 10;
            case 10:
                i_1++;
                return [3 /*break*/, 8];
            case 11:
                i++;
                return [3 /*break*/, 7];
            case 12: return [4 /*yield*/, dbInsert('UPDATE invoices SET invoiceData=? WHERE invoiceID=?', [results[0].invoiceData, query["invoiceID"]])];
            case 13:
                _f.sent();
                reply.send(results[0]);
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/api/invoices/pay', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, userID, results, _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                body = request.body;
                if (!body || !('authenticationKey' in body) || !('invoiceID' in body) || !('userID' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, retrieveID(body['authenticationKey'])];
            case 1:
                userID = _d.sent();
                if (!userID)
                    return [2 /*return*/, reply.code(400).send('No user found!')];
                _a = dbQuery;
                _b = ['SELECT i.invoiceData FROM invoices i LEFT JOIN sessions s USING(sessionID) WHERE i.invoiceID=? AND s.groupID=?'];
                _c = [body["invoiceID"]];
                return [4 /*yield*/, retrieveGroupID(body['authenticationKey'])];
            case 2: return [4 /*yield*/, _a.apply(void 0, _b.concat([_c.concat([_d.sent()])]))];
            case 3:
                results = _d.sent();
                if (!results.length)
                    return [2 /*return*/, reply.code(400).send('There are no invoices with that ID!')];
                results = JSON.parse(results[0].invoiceData);
                if (results[body["userID"]]) {
                    results[body["userID"]] = __assign(__assign({}, results[body["userID"]]), { paid: true });
                }
                else {
                    return [2 /*return*/, reply.code(400).send('No user found with that ID!')];
                }
                return [4 /*yield*/, dbInsert('UPDATE invoices SET invoiceData=? WHERE invoiceID=?', [JSON.stringify(results), body["invoiceID"]])];
            case 4:
                _d.sent();
                reply.send();
                return [2 /*return*/];
        }
    });
}); });
// EMAIL
fastify.get('/email/verify', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var query, results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = request.query;
                if (!query || !('code' in query)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, dbQuery('SELECT fullName, verified, tempEmail FROM users WHERE verificationCode=?', [query['code']])];
            case 1:
                results = _a.sent();
                if (!results.length)
                    return [2 /*return*/, reply.code(400).sendFile('fail.html')];
                if (!(results[0].verified && results[0].tempEmail)) return [3 /*break*/, 3];
                return [4 /*yield*/, dbInsert('UPDATE users SET emailAddress=?, verificationCode=null, tempEmail=null WHERE verificationCode=?', [results[0].tempEmail, query['code']])];
            case 2:
                _a.sent();
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, dbInsert('UPDATE users SET verified=1, verificationCode=null WHERE verificationCode=?', [query['code']])];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5: return [4 /*yield*/, reply.sendFile('success.html')];
            case 6:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
fastify.post('/email/resend', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var body, emailCode;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = request.body;
                if (!body || !('emailAddress' in body)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, generateEmailCode()];
            case 1:
                emailCode = _a.sent();
                return [4 /*yield*/, dbInsert('UPDATE users SET verificationCode=? WHERE emailAddress=?', [emailCode, body['emailAddress']])];
            case 2:
                _a.sent();
                sendMail(body['emailAddress'], 'Verify your Mail', "Hey,<br><br>Thank you for registering for PetrolShare!<br><br>In order to activate your account, please visit <a href=\"https://petrolshare.freud-online.co.uk/email/verify?code=" + emailCode + "\" target=\"__blank\">this link!</a><br><br>Thanks,<br><br><b>The PetrolShare Team</b>");
                return [2 /*return*/];
        }
    });
}); });
fastify.get('/email/reset-password', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var query, results, password, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                query = request.query;
                if (!query || !('code' in query)) {
                    return [2 /*return*/, reply.code(400).send('Missing required field!')];
                }
                return [4 /*yield*/, dbQuery('SELECT fullName, verified FROM users WHERE verificationCode=?', [query['code']])];
            case 1:
                results = _c.sent();
                if (!results.length)
                    return [2 /*return*/, reply.code(400).sendFile('fail.html')];
                password = generateTempPassword();
                _a = dbInsert;
                _b = ['UPDATE users SET password=?, authenticationKey=null, verificationCode=null WHERE verificationCode=?'];
                return [4 /*yield*/, argon2_1.default.hash(password)];
            case 2: return [4 /*yield*/, _a.apply(void 0, _b.concat([[_c.sent(), query['code']]]))];
            case 3:
                _c.sent();
                return [4 /*yield*/, reply.view('reset-password.ejs', { password: password })];
            case 4:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
fastify.get('/test', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
    var results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dbQuery('SELECT notificationKey FROM users WHERE notificationKey IS NOT NULL')];
            case 1:
                results = _a.sent();
                sendNotification(results, 'testing!', { screenName: 'Invoices', invoiceID: 417 });
                return [2 /*return*/];
        }
    });
}); });
// NOTIFY
var sendNotification = function (notifKeys, message, route) { return __awaiter(void 0, void 0, void 0, function () {
    var expo, messages, _i, notifKeys_1, pushToken, chunks, tickets;
    return __generator(this, function (_a) {
        expo = new expo_server_sdk_1.default({});
        if (!notifKeys)
            return [2 /*return*/];
        messages = [];
        for (_i = 0, notifKeys_1 = notifKeys; _i < notifKeys_1.length; _i++) {
            pushToken = notifKeys_1[_i];
            if (!pushToken["notificationKey"])
                continue;
            // // Check that all your push tokens appear to be valid Expo push tokens
            if (!expo_server_sdk_1.default.isExpoPushToken(pushToken["notificationKey"])) {
                console.error("Push token " + pushToken["notificationKey"] + " is not a valid Expo push token");
                continue;
            }
            // // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
            messages.push({
                to: pushToken["notificationKey"],
                body: message,
                data: { route: route.screenName, invoiceID: route.invoiceID },
            });
        }
        if (!messages)
            return [2 /*return*/];
        chunks = expo.chunkPushNotifications(messages);
        tickets = [];
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var _i, chunks_1, chunk, ticketChunk, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, chunks_1 = chunks;
                        _a.label = 1;
                    case 1:
                        if (!(_i < chunks_1.length)) return [3 /*break*/, 6];
                        chunk = chunks_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, expo.sendPushNotificationsAsync(chunk)];
                    case 3:
                        ticketChunk = _a.sent();
                        tickets.push.apply(tickets, ticketChunk);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        }); })();
        return [2 /*return*/];
    });
}); };
// Run the server!
var start = function () { return __awaiter(void 0, void 0, void 0, function () {
    var err_3;
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
                err_3 = _a.sent();
                fastify.log.error(err_3);
                process.exit(1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
start();
