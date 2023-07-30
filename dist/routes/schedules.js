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
Object.defineProperty(exports, "__esModule", { value: true });
var hooks_1 = require("../hooks");
exports.default = (function (fastify, _, done) {
    fastify.post("/api/schedules/add", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, groupID, userID, startDate, endDate, tempStart, endTimeInterval, isUnique;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = request.body;
                    if (!body ||
                        !("startDate" in body) ||
                        !("allDay" in body) ||
                        !("endDate" in body) ||
                        !("authenticationKey" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.retrieveGroupID)(body["authenticationKey"])];
                case 1:
                    groupID = _a.sent();
                    return [4 /*yield*/, (0, hooks_1.retrieveID)(body["authenticationKey"])];
                case 2:
                    userID = _a.sent();
                    if (!groupID || !userID)
                        return [2 /*return*/, reply.code(400).send("No user found!")];
                    startDate = new Date(body.startDate);
                    endDate = new Date(body.endDate);
                    if (startDate.getTime() < new Date().getTime()) {
                        return [2 /*return*/, reply.code(400).send("Please choose a valid date time combination!")];
                    }
                    tempStart = new Date(startDate);
                    endTimeInterval = new Date(tempStart.setMinutes(tempStart.getMinutes() + 29));
                    if (!body.allDay && (endDate.getTime() <= endTimeInterval.getTime())) {
                        return [2 /*return*/, reply.code(400).send("Please choose a valid end date combination more then 30 minutes after your start time!")];
                    }
                    if (body.repeating !== "notRepeating")
                        return [2 /*return*/, reply.code(400).send("This feature has not been implemented yet!")];
                    return [4 /*yield*/, checkForDuplicates(groupID, startDate, endDate)];
                case 3:
                    isUnique = _a.sent();
                    if (isUnique.length === 0) {
                        (0, hooks_1.dbInsert)("INSERT INTO schedules(allDay, startDate, endDate, summary, groupID, userID) VALUES (?,?,?,?,?,?)", [body.allDay, startDate, endDate, body.summary, groupID, userID]);
                        reply.code(200);
                    }
                    else
                        reply.code(400).send("There is a schedule in the date range selected already!");
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.get("/api/schedules/get", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var query, groupID, data, i, value, name_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = request.query;
                    if (!query || !("authenticationKey" in query)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.retrieveGroupID)(query["authenticationKey"])];
                case 1:
                    groupID = _a.sent();
                    if (!groupID)
                        return [2 /*return*/, reply.code(400).send("No group found!")];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)('SELECT startDate, endDate, allDay, summary, userID FROM schedules WHERE groupID=?', [groupID])];
                case 2:
                    data = _a.sent();
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < data.length)) return [3 /*break*/, 6];
                    value = data[i];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)('SELECT fullName, emailAddress FROM users WHERE userID=?', [value.userID])];
                case 4:
                    name_1 = _a.sent();
                    if (name_1)
                        data[i] = __assign(__assign({}, value), name_1[0]);
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6:
                    reply.send(data);
                    return [2 /*return*/];
            }
        });
    }); });
    done();
});
var checkForDuplicates = function (groupID, startDate, endDate) { return __awaiter(void 0, void 0, void 0, function () {
    var dates, i, dateRow;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, hooks_1.dbQuery)('SELECT startDate, endDate, userID FROM schedules WHERE groupID=?', [groupID])];
            case 1:
                dates = _a.sent();
                for (i = 0; i < dates.length; i++) {
                    dateRow = dates[i];
                    if ((startDate.getTime() >= dateRow.startDate.getTime() && startDate.getTime() <= dateRow.endDate.getTime()) ||
                        (endDate.getTime() >= dateRow.startDate.getTime() && endDate.getTime() <= dateRow.endDate.getTime()) ||
                        (startDate.getTime() <= dateRow.startDate.getTime() && endDate.getTime() >= dateRow.endDate.getTime())) {
                        return [2 /*return*/, dateRow.userID];
                    }
                }
                return [2 /*return*/, ""
                    // check if start is after end time
                ];
        }
    });
}); };
