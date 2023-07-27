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
Object.defineProperty(exports, "__esModule", { value: true });
var hooks_1 = require("../hooks");
exports.default = (function (fastify, _, done) {
    fastify.get("/api/distance/get", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var query, userID, results, _a, _b, _c, total;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    query = request.query;
                    if (!("authenticationKey" in query)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.retrieveID)(query["authenticationKey"])];
                case 1:
                    userID = _d.sent();
                    if (!userID)
                        return [2 /*return*/, reply.code(400).send("No user found!")];
                    _a = hooks_1.dbQuery;
                    _b = ["SELECT l.distance, s.sessionActive from logs l LEFT JOIN sessions s USING (sessionID) WHERE userID=? AND s.sessionActive=1 AND s.groupID=? AND approved=1"];
                    _c = [userID];
                    return [4 /*yield*/, (0, hooks_1.retrieveGroupID)(query["authenticationKey"])];
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
    fastify.post("/api/distance/reset", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, groupID;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = request.body;
                    if (!body || !("authenticationKey" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.retrieveGroupID)(body["authenticationKey"])];
                case 1:
                    groupID = _a.sent();
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("UPDATE sessions SET sessionActive=0, sessionEnd=? WHERE groupID=?", [Date.now(), groupID])];
                case 2:
                    _a.sent();
                    (0, hooks_1.retrieveSessionID)(groupID);
                    reply.code(200);
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/api/distance/add", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, results, log, sessionID, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = request.body;
                    if (!body || !("distance" in body) || !("authenticationKey" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT * FROM users WHERE authenticationKey=?", [body["distance"], body["authenticationKey"]])];
                case 1:
                    results = _a.sent();
                    if (!results)
                        return [2 /*return*/, reply.code(400).send("This user does not exist!")];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT userID, groupID FROM users WHERE authenticationKey=?", [body["authenticationKey"]])];
                case 2:
                    log = (_a.sent())[0];
                    return [4 /*yield*/, (0, hooks_1.retrieveSessionID)(log.groupID)];
                case 3:
                    sessionID = _a.sent();
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, hooks_1.dbInsert)("INSERT INTO logs(userID, distance, date, sessionID) VALUES(?,?,?,?)", [log.userID, body["distance"], Date.now(), sessionID])];
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
    fastify.post("/api/distance/assign", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, userData, sessionID, groupData, user, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = request.body;
                    if (!body ||
                        !("distance" in body) ||
                        !("authenticationKey" in body) ||
                        !("userID" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT fullName, userID, groupID FROM users WHERE authenticationKey=?", [body["authenticationKey"]])];
                case 1:
                    userData = _a.sent();
                    if (!userData.length)
                        return [2 /*return*/, reply.code(400).send("This user does not exist!")];
                    return [4 /*yield*/, (0, hooks_1.retrieveSessionID)(userData[0].groupID)];
                case 2:
                    sessionID = _a.sent();
                    if (!sessionID)
                        return [2 /*return*/, reply.code(400).send("This user does not exist!")];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT distance FROM groups WHERE groupID=?", [userData[0].groupID])];
                case 3:
                    groupData = _a.sent();
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT notificationKey FROM users WHERE userID=?", [body["userID"]])];
                case 4:
                    user = _a.sent();
                    if (!user.length)
                        return [2 /*return*/, reply.code(400).send("This user does not exist!")];
                    (0, hooks_1.sendNotification)([{ notificationKey: user[0].notificationKey }], "".concat(userData[0].fullName, " has requested to add the distance of ").concat(body["distance"]).concat(groupData[0].distance, " to your account! Click on this notification to respond"), { route: "Dashboard" });
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, (0, hooks_1.dbInsert)("INSERT INTO logs(userID, distance, date, sessionID, approved, assignedBy) VALUES(?,?,?,?,0,?)", [
                            body["userID"],
                            body["distance"],
                            Date.now(),
                            sessionID,
                            userData[0].userID,
                        ])];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    err_2 = _a.sent();
                    console.log(err_2);
                    return [3 /*break*/, 8];
                case 8:
                    reply.code(200);
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/api/distance/dismiss", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, userData, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = request.body;
                    if (!body || !("logID" in body) || !("authenticationKey" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    userData = (0, hooks_1.retrieveID)(body["authenticationKey"]);
                    if (!userData)
                        return [2 /*return*/, reply.code(400).send("This user does not exist!")];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("DELETE FROM logs WHERE logID=?", [body["logID"]])];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    console.log(err_3);
                    return [3 /*break*/, 4];
                case 4:
                    reply.code(200);
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/api/distance/approve", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, userData, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = request.body;
                    if (!body || !("logID" in body) || !("authenticationKey" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    userData = (0, hooks_1.retrieveID)(body["authenticationKey"]);
                    if (!userData)
                        return [2 /*return*/, reply.code(400).send("This user does not exist!")];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("UPDATE logs SET approved=1 WHERE logID=?", [
                            body["logID"],
                        ])];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_4 = _a.sent();
                    console.log(err_4);
                    return [3 /*break*/, 4];
                case 4:
                    reply.code(200);
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.get("/api/distance/check-distance", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var query, userData, sessionID, groupData, _a, _b;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    query = request.query;
                    if (!query || !("authenticationKey" in query)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT userID, groupID FROM users WHERE authenticationKey=?", [query["authenticationKey"]])];
                case 1:
                    userData = _d.sent();
                    if (!userData.length)
                        return [2 /*return*/, reply.code(400).send("This user does not exist!")];
                    return [4 /*yield*/, (0, hooks_1.retrieveSessionID)(userData[0].groupID)];
                case 2:
                    sessionID = _d.sent();
                    if (!sessionID)
                        return [2 /*return*/, reply.code(400).send("This user does not exist!")];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT distance, assignedBy, logID FROM logs WHERE sessionID=? AND approved=0 AND userID=?", [sessionID, userData[0].userID])];
                case 3:
                    groupData = _d.sent();
                    if (!groupData.length) return [3 /*break*/, 5];
                    _b = (_a = reply).send;
                    _c = {
                        distance: groupData[0].distance
                    };
                    return [4 /*yield*/, (0, hooks_1.retrieveName)(groupData[0].assignedBy)];
                case 4:
                    _b.apply(_a, [(_c.assignedBy = _d.sent(),
                            _c.id = groupData[0].logID,
                            _c)]);
                    return [3 /*break*/, 6];
                case 5:
                    reply.code(200);
                    _d.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); });
    done();
});
