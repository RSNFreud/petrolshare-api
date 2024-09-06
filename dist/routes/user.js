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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var argon2_1 = __importDefault(require("argon2"));
var hooks_1 = require("../hooks");
exports.default = (function (fastify, _, done) {
    fastify.post("/api/user/login", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, results, code, _a, groupData;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    body = request.body;
                    if (!("emailAddress" in body) || !("password" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT * from users WHERE emailAddress=?", [body["emailAddress"]])];
                case 1:
                    results = _b.sent();
                    if (!results.length)
                        return [2 /*return*/, reply.code(400).send("Incorrect username or password.")];
                    if (!results[0]["verified"])
                        return [2 /*return*/, reply.code(400).send("Please verify your account!")];
                    if (!results[0]["active"])
                        return [2 /*return*/, reply.code(400).send("Your account has been deactivated! Please check your email to reactivate")];
                    return [4 /*yield*/, argon2_1.default.verify(results[0].password, body["password"])];
                case 2:
                    if (!_b.sent()) return [3 /*break*/, 8];
                    _a = results[0].authenticationKey;
                    if (_a) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, hooks_1.generateCode)()];
                case 3:
                    _a = (_b.sent());
                    _b.label = 4;
                case 4:
                    code = _a;
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT * FROM groups WHERE groupID=?", [
                            results[0].groupID,
                        ])];
                case 5:
                    groupData = (_b.sent())[0];
                    reply.code(200).send(__assign({ fullName: results[0].fullName, groupID: results[0].groupID, emailAddress: results[0].emailAddress, authenticationKey: code, userID: results[0].userID }, groupData));
                    if (!!results[0].authenticationKey) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, hooks_1.dbInsert)("UPDATE users SET authenticationKey=? WHERE emailAddress=?", [code, body["emailAddress"]]).catch(function (err) { return console.log(err); })];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    reply.code(400).send("Incorrect username or password.");
                    _b.label = 9;
                case 9: return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/api/user/register", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, results, password, code, emailCode, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    body = request.body;
                    if (!("emailAddress" in body) || !("password" in body) || !("fullName" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT * from users WHERE emailAddress=?", [body["emailAddress"]])];
                case 1:
                    results = _d.sent();
                    if (results.length)
                        return [2 /*return*/, reply.code(400).send("This user exists already!")];
                    password = argon2_1.default.hash(body["password"]);
                    return [4 /*yield*/, (0, hooks_1.generateCode)()];
                case 2:
                    code = _d.sent();
                    return [4 /*yield*/, (0, hooks_1.generateEmailCode)()];
                case 3:
                    emailCode = _d.sent();
                    _a = hooks_1.dbInsert;
                    _b = ["INSERT INTO users( fullName, emailAddress, password, authenticationKey, verificationCode) VALUES (?,?,?,?,?)"];
                    _c = [body["fullName"], body["emailAddress"]];
                    return [4 /*yield*/, password];
                case 4: return [4 /*yield*/, _a.apply(void 0, _b.concat([_c.concat([_d.sent(), code, emailCode])]))];
                case 5:
                    _d.sent();
                    (0, hooks_1.sendMail)(body["emailAddress"], "Verify your Mail", "Hey ".concat(body["fullName"], ",<br><br>Thank you for registering for PetrolShare!<br><br>In order to activate your account, please visit <a href=\"https://petrolshare.freud-online.co.uk/email/verify?code=").concat(emailCode, "\" target=\"__blank\">this link!</a><br><br>Thanks,<br><br><b>The PetrolShare Team</b>"));
                    reply.send(code);
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/api/user/deactivate", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, emailCode, results, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    body = request.body;
                    if (!("authenticationKey" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.generateEmailCode)()];
                case 1:
                    emailCode = _c.sent();
                    _a = hooks_1.dbQuery;
                    _b = ["SELECT emailAddress FROM users WHERE userID=?"];
                    return [4 /*yield*/, (0, hooks_1.retrieveID)(body["authenticationKey"])];
                case 2: return [4 /*yield*/, _a.apply(void 0, _b.concat([[
                            _c.sent()
                        ]]))];
                case 3:
                    results = _c.sent();
                    if (!results.length)
                        return [2 /*return*/, reply.code(400).send("There is no user with that ID")];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("UPDATE users SET active=0, verificationCode=? WHERE authenticationKey=?", [
                            emailCode,
                            body["authenticationKey"],
                        ])];
                case 4:
                    _c.sent();
                    (0, hooks_1.sendMail)(results[0]["emailAddress"], "PetrolShare - Account Deactivation", "Hi!<br><br>We have received a request to deactivate your account. Please click <a href=\"https://petrolshare.freud-online.co.uk/email/deactivate?code=".concat(emailCode, "\" target=\"_blank\">here<a/> to confirm this change.<br><br>If this wasn't requested by you, feel free to ignore this and nothing will happen.<br><br>Thanks<br>The PetrolShare Team"));
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/api/user/change-group", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, groupID, results, isPremium, _a, _b, isNewPremium, groupMemberCount, lastInGroup;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    body = request.body;
                    if (!("authenticationKey" in body) || !("groupID" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    groupID = body["groupID"];
                    if (groupID.includes("petrolshare.freud-online.co.uk")) {
                        groupID = groupID.split("groupID=")[1];
                    }
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT groupID, premium FROM groups WHERE groupID=?", [groupID])];
                case 1:
                    results = _e.sent();
                    if (!results.length)
                        return [2 /*return*/, reply.code(400).send("There was no group found with that ID!")];
                    _a = hooks_1.dbQuery;
                    _b = ["SELECT premium FROM groups WHERE groupID=?"];
                    return [4 /*yield*/, (0, hooks_1.retrieveGroupID)(body["authenticationKey"])];
                case 2: return [4 /*yield*/, _a.apply(void 0, _b.concat([[_e.sent()]]))];
                case 3:
                    isPremium = (_c = (_e.sent())[0]) === null || _c === void 0 ? void 0 : _c.premium;
                    isNewPremium = (_d = results[0]) === null || _d === void 0 ? void 0 : _d.premium;
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT null FROM users WHERE groupID=?", [groupID])];
                case 4:
                    groupMemberCount = _e.sent();
                    return [4 /*yield*/, (0, hooks_1.checkIfLast)(body["authenticationKey"])];
                case 5:
                    lastInGroup = _e.sent();
                    if (!isNewPremium && groupMemberCount.length >= 2)
                        return [2 /*return*/, reply
                                .code(400)
                                .send("This group has reached the max member count. To join, they need to upgrade to Premium by clicking the banner inside the app.")];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("UPDATE users SET groupID=? WHERE authenticationKey=?", [
                            results[0]["groupID"],
                            body["authenticationKey"],
                        ])];
                case 6:
                    _e.sent();
                    reply.send({
                        groupID: results[0]["groupID"],
                        message: lastInGroup && !isPremium
                            ? "You are the last member of this group and as such the group will be deleted within the next 24 hours"
                            : "",
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/api/user/change-email", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, emailCode, results, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    body = request.body;
                    if (!("authenticationKey" in body) || !("newEmail" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.generateEmailCode)()];
                case 1:
                    emailCode = _c.sent();
                    _a = hooks_1.dbQuery;
                    _b = ["SELECT emailAddress FROM users WHERE userID=?"];
                    return [4 /*yield*/, (0, hooks_1.retrieveID)(body["authenticationKey"])];
                case 2: return [4 /*yield*/, _a.apply(void 0, _b.concat([[
                            _c.sent()
                        ]]))];
                case 3:
                    results = _c.sent();
                    if (!results.length)
                        return [2 /*return*/, reply.code(400).send("There is no user with that ID")];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("UPDATE users SET verificationCode=?, tempEmail=? WHERE authenticationKey=?", [
                            emailCode,
                            body["newEmail"],
                            body["authenticationKey"],
                        ])];
                case 4:
                    _c.sent();
                    (0, hooks_1.sendMail)(body["newEmail"], "PetrolShare - Change Email Address", "Hi!<br><br>We have received a request to change your email to this address. Please click <a href=\"https://petrolshare.freud-online.co.uk/email/verify?code=".concat(emailCode, "\" target=\"_blank\">here<a/> to confirm this change.<br><br>If this wasn't requested by you, feel free to ignore this and nothing will happen.<br><br>Thanks<br>The PetrolShare Team"));
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/api/user/forgot-password", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, emailCode, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = request.body;
                    if (!("emailAddress" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.generateEmailCode)()];
                case 1:
                    emailCode = _a.sent();
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT emailAddress FROM users WHERE emailAddress=?", [body["emailAddress"]])];
                case 2:
                    results = _a.sent();
                    if (!results.length)
                        return [2 /*return*/, reply.code(400).send("There is no user with that email address")];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("UPDATE users SET verificationCode=? WHERE emailAddress=?", [emailCode, body["emailAddress"]])];
                case 3:
                    _a.sent();
                    (0, hooks_1.sendMail)(body["emailAddress"], "PetrolShare - Forgot your Password", "Hi!<br><br>We have received a request to reset your password. Please click <a href=\"https://petrolshare.freud-online.co.uk/email/reset-password?code=".concat(emailCode, "\" target=\"_blank\">here<a/> to confirm this change.<br><br>If this wasn't requested by you, feel free to ignore this and nothing will happen.<br><br>Thanks<br>The PetrolShare Team"));
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/api/user/change-name", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, results, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    body = request.body;
                    if (!("authenticationKey" in body) || !("newName" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    _a = hooks_1.dbQuery;
                    _b = ["SELECT fullName FROM users WHERE userID=?"];
                    return [4 /*yield*/, (0, hooks_1.retrieveID)(body["authenticationKey"])];
                case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([[
                            _c.sent()
                        ]]))];
                case 2:
                    results = _c.sent();
                    if (!results.length)
                        return [2 /*return*/, reply.code(400).send("There is no user with that ID")];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("UPDATE users SET fullName=? WHERE authenticationKey=?", [
                            body["newName"],
                            body["authenticationKey"],
                        ])];
                case 3:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/api/user/change-password", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, results, _a, _b, password;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    body = request.body;
                    if (!("authenticationKey" in body) || !("newPassword" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    _a = hooks_1.dbQuery;
                    _b = ["SELECT fullName FROM users WHERE userID=?"];
                    return [4 /*yield*/, (0, hooks_1.retrieveID)(body["authenticationKey"])];
                case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([[
                            _c.sent()
                        ]]))];
                case 2:
                    results = _c.sent();
                    if (!results.length)
                        return [2 /*return*/, reply.code(400).send("There is no user with that ID")];
                    return [4 /*yield*/, argon2_1.default.hash(body["newPassword"])];
                case 3:
                    password = _c.sent();
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("UPDATE users SET password=?, authenticationKey=null WHERE authenticationKey=?", [
                            password,
                            body["authenticationKey"],
                        ])];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.get("/api/user/verify", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var query, results, groupData;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    query = request.query;
                    if (!("authenticationKey" in query)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT * from users WHERE authenticationKey=?", [
                            query["authenticationKey"],
                        ])];
                case 1:
                    results = _b.sent();
                    if (!results)
                        return [2 /*return*/, reply.code(400).send("Your account session has expired! Please re-login")];
                    if (!((_a = results[0]) === null || _a === void 0 ? void 0 : _a.active))
                        return [2 /*return*/, reply.code(400).send("This account has been deactivated. Please check your emails to reactivate!")];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT * FROM groups WHERE groupID=?", [
                            results[0].groupID,
                        ])];
                case 2:
                    groupData = (_b.sent())[0];
                    reply.code(200).send(__assign({ fullName: results[0].fullName, groupID: results[0].groupID, emailAddress: results[0].emailAddress, authenticationKey: query["authenticationKey"], userID: results[0].userID }, groupData));
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.get("/api/user/get", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var query, userID, results, groupData, distance, total;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = request.query;
                    if (!("authenticationKey" in query)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.retrieveID)(query["authenticationKey"])];
                case 1:
                    userID = _a.sent();
                    if (!userID)
                        return [2 /*return*/, reply.code(400).send("No user found!")];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT fullName, groupID FROM users WHERE userID=?", [userID])];
                case 2:
                    results = _a.sent();
                    if (!results.length)
                        return [2 /*return*/, reply.code(400).send("No user found!")];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT * FROM groups WHERE groupID=?", [results[0].groupID])];
                case 3:
                    groupData = _a.sent();
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT l.distance, s.sessionActive from logs l LEFT JOIN sessions s USING (sessionID) WHERE userID=? AND s.sessionActive=1 AND s.groupID=? AND approved=1", [userID, results[0].groupID])];
                case 4:
                    distance = _a.sent();
                    total = 0;
                    distance.map(function (_a) {
                        var distance = _a.distance;
                        total += distance;
                    });
                    reply.send(__assign(__assign(__assign({}, results[0]), groupData[0]), { currentMileage: Math.round(total * 100) / 100 }));
                    return [2 /*return*/];
            }
        });
    }); });
    done();
});
