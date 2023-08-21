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
    fastify.post("/api/group/create", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, lastInGroup, groupIDExists, groupID, isPremium;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    body = request.body;
                    if (!("authenticationKey" in body) || !("groupID" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.checkIfLast)(body["authenticationKey"])];
                case 1:
                    lastInGroup = _b.sent();
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT premium FROM groups WHERE groupID=?", [body["groupID"]])];
                case 2:
                    groupIDExists = _b.sent();
                    groupID = body["groupID"];
                    if (groupIDExists.length)
                        groupID = (0, hooks_1.generateGroupID)();
                    isPremium = groupIDExists.length ? false : (_a = groupIDExists[0]) === null || _a === void 0 ? void 0 : _a.premium;
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("UPDATE users SET groupID=? WHERE authenticationKey=?", [
                            groupID,
                            body["authenticationKey"],
                        ])];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, (0, hooks_1.dbInsert)("INSERT INTO groups (groupID) VALUES (?)", [groupID])];
                case 4:
                    _b.sent();
                    reply.send({
                        groupID: groupID,
                        message: lastInGroup && !isPremium
                            ? "You are the last member of this group and as such the group will be deleted within the next 24 hours"
                            : "",
                    });
                    reply.send(groupID);
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/api/group/update", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, groupID;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = request.body;
                    if (!("authenticationKey" in body) ||
                        !("distance" in body) ||
                        !("petrol" in body) ||
                        !("currency" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.retrieveGroupID)(body["authenticationKey"])];
                case 1:
                    groupID = _a.sent();
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("UPDATE groups SET distance=?, petrol=?, currency=? WHERE groupID=?", [body["distance"], body["petrol"], body["currency"], groupID])];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.get("/api/group/get", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var query, groupID, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = request.query;
                    if (!("authenticationKey" in query)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.retrieveGroupID)(query["authenticationKey"])];
                case 1:
                    groupID = _a.sent();
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT * FROM groups WHERE groupID=?", [
                            groupID,
                        ])];
                case 2:
                    res = _a.sent();
                    if (!res)
                        return [2 /*return*/];
                    reply.send(res[0]);
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/api/group/subscribe", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, groupID, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = request.body;
                    if (!("authenticationKey" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.retrieveGroupID)(body["authenticationKey"])];
                case 1:
                    groupID = _a.sent();
                    return [4 /*yield*/, (0, hooks_1.dbInsert)("UPDATE groups SET premium=1 WHERE groupID=?", [
                            groupID,
                        ])];
                case 2:
                    res = _a.sent();
                    reply.code(200).send(res === null || res === void 0 ? void 0 : res.changedRows);
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/api/group/unsubscribe", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, groupID, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = request.body;
                    if (!("authenticationKey" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.retrieveGroupID)(body["authenticationKey"])];
                case 1:
                    groupID = _a.sent();
                    return [4 /*yield*/, (0, hooks_1.dbInsert)("UPDATE groups SET premium=0 WHERE groupID=?", [
                            groupID,
                        ])];
                case 2:
                    res = _a.sent();
                    reply.code(200).send(res === null || res === void 0 ? void 0 : res.changedRows);
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.get("/api/group/get-members", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var query, groupID, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = request.query;
                    if (!("authenticationKey" in query)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.retrieveGroupID)(query["authenticationKey"])];
                case 1:
                    groupID = _a.sent();
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT fullName, userID FROM users WHERE groupID=?", [groupID])];
                case 2:
                    res = _a.sent();
                    if (!res)
                        return [2 /*return*/];
                    reply.send(res);
                    return [2 /*return*/];
            }
        });
    }); });
    done();
});
