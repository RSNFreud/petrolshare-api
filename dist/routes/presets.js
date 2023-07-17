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
    fastify.get("/api/preset/get", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var query, userID, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = request.query;
                    if (!query || !("authenticationKey" in query)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.retrieveID)(query["authenticationKey"])];
                case 1:
                    userID = _a.sent();
                    if (!userID)
                        return [2 /*return*/, reply.code(400).send("No user found!")];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT presetName, distance, presetID FROM presets WHERE userID=?", [userID])];
                case 2:
                    results = _a.sent();
                    if (!results)
                        return [2 /*return*/, reply.code(400).send("There are no presets!")];
                    reply.send(results);
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/api/preset/add", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, userID;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = request.body;
                    if (!body ||
                        !("presetName" in body) ||
                        !("distance" in body) ||
                        !("authenticationKey" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.retrieveID)(body["authenticationKey"])];
                case 1:
                    userID = _a.sent();
                    if (!userID)
                        return [2 /*return*/, reply.code(400).send("No user found!")];
                    return [4 /*yield*/, (0, hooks_1.dbInsert)("INSERT INTO presets (presetName, distance, userID) VALUES (?,?,?)", [body["presetName"], body["distance"], userID])];
                case 2:
                    _a.sent();
                    reply.code(200);
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/api/preset/edit", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, userID;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = request.body;
                    if (!body ||
                        !("presetID" in body) ||
                        !("presetName" in body) ||
                        !("distance" in body) ||
                        !("authenticationKey" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.retrieveID)(body["authenticationKey"])];
                case 1:
                    userID = _a.sent();
                    if (!userID)
                        return [2 /*return*/, reply.code(400).send("No user found!")];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("UPDATE presets SET presetName=?, distance=? WHERE presetID=?", [body["presetName"], body["distance"], body["presetID"]])];
                case 2:
                    _a.sent();
                    reply.code(200);
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/api/preset/delete", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, userID;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = request.body;
                    if (!body || !("presetID" in body) || !("authenticationKey" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.retrieveID)(body["authenticationKey"])];
                case 1:
                    userID = _a.sent();
                    if (!userID)
                        return [2 /*return*/, reply.code(400).send("No user found!")];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("DELETE FROM presets WHERE presetID=?", [body["presetID"]])];
                case 2:
                    _a.sent();
                    reply.code(200);
                    return [2 /*return*/];
            }
        });
    }); });
    done();
});
