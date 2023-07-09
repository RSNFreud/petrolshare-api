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
    fastify.get("/api/invoices/get", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var query, userID, results_1, _a, _b, results, i, e, data, i_1, key, name_1, uniqueURL;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    query = request.query;
                    if (!query || !("authenticationKey" in query)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.retrieveID)(query["authenticationKey"])];
                case 1:
                    userID = _d.sent();
                    if (!userID)
                        return [2 /*return*/, reply.code(400).send("No user found!")];
                    if (!!("invoiceID" in query)) return [3 /*break*/, 4];
                    _a = hooks_1.dbQuery;
                    _b = ["SELECT i.invoiceID, s.sessionEnd FROM invoices i LEFT JOIN sessions s USING (sessionID) WHERE s.groupID=? ORDER BY s.sessionEnd DESC"];
                    return [4 /*yield*/, (0, hooks_1.retrieveGroupID)(query["authenticationKey"])];
                case 2: return [4 /*yield*/, _a.apply(void 0, _b.concat([[_d.sent()]]))];
                case 3:
                    results_1 = _d.sent();
                    if (!results_1.length)
                        return [2 /*return*/, reply.code(400).send("There are no invoices in that group!")];
                    return [2 /*return*/, reply.send(results_1)];
                case 4: return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT u.fullName, i.invoiceData, i.totalDistance, i.uniqueURL, i.pricePerLiter, s.sessionEnd, i.totalPrice, u.emailAddress FROM invoices i LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u USING (userID) WHERE i.invoiceID=?", [query["invoiceID"]])];
                case 5:
                    results = _d.sent();
                    if (!results.length)
                        return [2 /*return*/, reply.code(400).send("There are no invoices with that ID!")];
                    i = 0;
                    _d.label = 6;
                case 6:
                    if (!(i < results.length)) return [3 /*break*/, 11];
                    e = results[i];
                    data = JSON.parse(e.invoiceData);
                    i_1 = 0;
                    _d.label = 7;
                case 7:
                    if (!(i_1 < Object.keys(data).length)) return [3 /*break*/, 10];
                    key = Object.keys(data)[i_1];
                    console.log(key);
                    return [4 /*yield*/, (0, hooks_1.dbQuery)('SELECT fullName, emailAddress FROM users WHERE userID=?', [key])];
                case 8:
                    name_1 = _d.sent();
                    if (name_1)
                        data[key] = __assign(__assign({}, data[key]), name_1[0]);
                    e.invoiceData = JSON.stringify(data);
                    _d.label = 9;
                case 9:
                    i_1++;
                    return [3 /*break*/, 7];
                case 10:
                    i++;
                    return [3 /*break*/, 6];
                case 11:
                    uniqueURL = (_c = results[0]) === null || _c === void 0 ? void 0 : _c.uniqueURL;
                    if (!(uniqueURL === null)) return [3 /*break*/, 13];
                    return [4 /*yield*/, (0, hooks_1.generateUniqueURL)()];
                case 12:
                    uniqueURL = _d.sent();
                    results[0].uniqueURL = uniqueURL;
                    _d.label = 13;
                case 13: return [4 /*yield*/, (0, hooks_1.dbInsert)("UPDATE invoices SET invoiceData=?, uniqueURL=? WHERE invoiceID=?", [
                        results[0].invoiceData, uniqueURL,
                        query["invoiceID"],
                    ])];
                case 14:
                    _d.sent();
                    reply.send(results[0]);
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.get("/api/invoices/public/get", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var query, results, groupID, groupData, _a, i, e, data, i_2, key, name_2;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    query = request.query;
                    if (!query || !("uniqueURL" in query)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT u.fullName, i.invoiceData, i.totalDistance, u.userID, i.uniqueURL, i.pricePerLiter, s.sessionEnd, i.totalPrice FROM invoices i LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u USING (userID) WHERE i.uniqueURL=?", [query["uniqueURL"]])];
                case 1:
                    results = _c.sent();
                    if (!results.length)
                        return [2 /*return*/, reply.code(400).send("There are no invoices with that ID!")];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)('SELECT groupID FROM users WHERE userID=?', [results[0].userID])];
                case 2:
                    groupID = _c.sent();
                    if (!groupID) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)('SELECT distance, currency, petrol FROM groups WHERE groupID=?', [groupID[0].groupID])];
                case 3:
                    _a = _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = undefined;
                    _c.label = 5;
                case 5:
                    groupData = _a;
                    i = 0;
                    _c.label = 6;
                case 6:
                    if (!(i < results.length)) return [3 /*break*/, 11];
                    e = results[i];
                    data = JSON.parse(e.invoiceData);
                    i_2 = 0;
                    _c.label = 7;
                case 7:
                    if (!(i_2 < Object.keys(data).length)) return [3 /*break*/, 10];
                    key = Object.keys(data)[i_2];
                    return [4 /*yield*/, (0, hooks_1.retrieveName)(key)];
                case 8:
                    name_2 = _c.sent();
                    if (name_2)
                        data[key]["fullName"] = name_2;
                    e.invoiceData = JSON.stringify(data);
                    _c.label = 9;
                case 9:
                    i_2++;
                    return [3 /*break*/, 7];
                case 10:
                    i++;
                    return [3 /*break*/, 6];
                case 11: return [4 /*yield*/, (0, hooks_1.dbInsert)("UPDATE invoices SET invoiceData=? WHERE uniqueURL=?", [
                        results[0].invoiceData,
                        query["uniqueURL"],
                    ])];
                case 12:
                    _c.sent();
                    (_b = results[0]) === null || _b === void 0 ? true : delete _b.userID;
                    if (groupData)
                        reply.send(__assign(__assign({}, results[0]), groupData[0]));
                    else
                        reply.send(results[0]);
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/api/invoices/pay", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, userID, results, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    body = request.body;
                    if (!body ||
                        !("authenticationKey" in body) ||
                        !("invoiceID" in body) ||
                        !("userID" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.retrieveID)(body["authenticationKey"])];
                case 1:
                    userID = _d.sent();
                    if (!userID)
                        return [2 /*return*/, reply.code(400).send("No user found!")];
                    _a = hooks_1.dbQuery;
                    _b = ["SELECT i.invoiceData FROM invoices i LEFT JOIN sessions s USING(sessionID) WHERE i.invoiceID=? AND s.groupID=?"];
                    _c = [body["invoiceID"]];
                    return [4 /*yield*/, (0, hooks_1.retrieveGroupID)(body["authenticationKey"])];
                case 2: return [4 /*yield*/, _a.apply(void 0, _b.concat([_c.concat([_d.sent()])]))];
                case 3:
                    results = _d.sent();
                    if (!results.length)
                        return [2 /*return*/, reply.code(400).send("There are no invoices with that ID!")];
                    results = JSON.parse(results[0].invoiceData);
                    if (results[body["userID"]]) {
                        results[body["userID"]] = __assign(__assign({}, results[body["userID"]]), { paid: true });
                    }
                    else {
                        return [2 /*return*/, reply.code(400).send("No user found with that ID!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.dbInsert)("UPDATE invoices SET invoiceData=? WHERE invoiceID=?", [
                            JSON.stringify(results),
                            body["invoiceID"],
                        ])];
                case 4:
                    _d.sent();
                    reply.send();
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/api/invoices/assign", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, userID, data, _a, _b, _c, results, totalDistance, pricePerLiter, litersPerKm, newDistance, unidentified, newUnidentified, fullName;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    body = request.body;
                    if (!body ||
                        !("authenticationKey" in body) ||
                        !("invoiceID" in body) ||
                        !("userID" in body) ||
                        !("distance" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.retrieveID)(body["authenticationKey"])];
                case 1:
                    userID = _d.sent();
                    if (!userID)
                        return [2 /*return*/, reply.code(400).send("No user found!")];
                    _a = hooks_1.dbQuery;
                    _b = ["SELECT i.invoiceData, i.totalDistance, i.litersFilled, i.totalPrice, s.initialOdometer, s.sessionID FROM invoices i LEFT JOIN sessions s USING(sessionID) WHERE i.invoiceID=? AND s.groupID=?"];
                    _c = [body["invoiceID"]];
                    return [4 /*yield*/, (0, hooks_1.retrieveGroupID)(body["authenticationKey"])];
                case 2: return [4 /*yield*/, _a.apply(void 0, _b.concat([_c.concat([_d.sent()])]))];
                case 3:
                    data = _d.sent();
                    if (!data.length)
                        return [2 /*return*/, reply.code(400).send("There are no invoices with that ID!")];
                    results = JSON.parse(data[0].invoiceData);
                    if (!results["0"])
                        return [2 /*return*/, reply.code(400).send("No unindentified distance to assign!")];
                    totalDistance = data[0]["totalDistance"];
                    pricePerLiter = data[0]["totalPrice"] / data[0]["litersFilled"];
                    litersPerKm = data[0]["litersFilled"] / totalDistance;
                    newDistance = results[body["userID"]]
                        ? parseFloat(body["distance"]) +
                            parseFloat(results[body["userID"]].distance)
                        : parseFloat(body["distance"]);
                    unidentified = results["0"];
                    newUnidentified = parseFloat(unidentified.distance) - parseFloat(body["distance"]);
                    if (!results[body["userID"]]) return [3 /*break*/, 4];
                    results[body["userID"]] = __assign(__assign({}, results[body["userID"]]), { distance: newDistance.toFixed(2), paymentDue: (newDistance * litersPerKm * pricePerLiter).toFixed(2), liters: (newDistance * litersPerKm).toFixed(2) });
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, (0, hooks_1.retrieveName)(body["userID"])];
                case 5:
                    fullName = _d.sent();
                    if (!fullName)
                        return [2 /*return*/, reply.code(400).send("No user found with that ID!")];
                    results[body["userID"]] = {
                        fullName: fullName,
                        distance: newDistance.toFixed(2),
                        paid: false,
                        paymentDue: (newDistance * litersPerKm * pricePerLiter).toFixed(2),
                        liters: (newDistance * litersPerKm).toFixed(2),
                    };
                    _d.label = 6;
                case 6:
                    if (newUnidentified <= 0)
                        delete results["0"];
                    else
                        results["0"] = __assign(__assign({}, results["0"]), { distance: newUnidentified.toFixed(2), paymentDue: (newUnidentified * litersPerKm * pricePerLiter).toFixed(2) });
                    return [4 /*yield*/, (0, hooks_1.dbInsert)("INSERT INTO logs(userID, distance, date, sessionID) VALUES(?,?,?,?)", [body["userID"], body["distance"], Date.now(), data[0]["sessionID"]])];
                case 7:
                    _d.sent();
                    return [4 /*yield*/, (0, hooks_1.dbInsert)("UPDATE invoices SET invoiceData=? WHERE invoiceID=?", [
                            JSON.stringify(results),
                            body["invoiceID"],
                        ])];
                case 8:
                    _d.sent();
                    reply.send();
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post('/api/invoices/alert', function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, userID, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = request.body;
                    if (!body || !('authenticationKey' in body) || !('fullName' in body) || !('invoiceID' in body)) {
                        return [2 /*return*/, reply.code(400).send('Missing required field!')];
                    }
                    return [4 /*yield*/, (0, hooks_1.retrieveID)(body['authenticationKey'])];
                case 1:
                    userID = _a.sent();
                    if (!userID)
                        return [2 /*return*/, reply.code(400).send('No user found!')];
                    return [4 /*yield*/, (0, hooks_1.dbQuery)('SELECT notificationKey FROM users WHERE fullName=?', [body['fullName']])];
                case 2:
                    user = _a.sent();
                    if (!user.length)
                        return [2 /*return*/, reply.code(400).send('There is no user with that name!')];
                    if (user[0].notificationKey) {
                        (0, hooks_1.sendNotification)([{ notificationKey: user[0].notificationKey }], "You have a payment request waiting and havent dealt with it yet! ".concat(body['fullName'], " has asked for your attention on it!"), { route: "Payments", invoiceID: body["invoiceID"] });
                    }
                    else {
                        return [2 /*return*/, reply.code(400).send('This user is using the web version of the app and as such we cannot send them notifications!')];
                    }
                    reply.send();
                    return [2 /*return*/];
            }
        });
    }); });
    done();
});
