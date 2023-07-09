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
    fastify.post("/api/petrol/add", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, results, _a, _b, distances, i, e, totalDistance, pricePerLiter, totalCarDistance, litersPerKm, userID, _c, _d, _e, _f, _g, _h, res, _j, _k, _l, notifications;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    body = request.body;
                    if (!body ||
                        !("totalPrice" in body) ||
                        !("litersFilled" in body) ||
                        !("authenticationKey" in body) ||
                        !("odometer" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    _a = hooks_1.dbQuery;
                    _b = ["SELECT l.distance, s.sessionActive, s.initialOdometer, s.sessionID, u.fullName, u.notificationKey, u.userID FROM logs l LEFT JOIN sessions s USING (sessionID) LEFT JOIN users u ON l.userID = u.userID WHERE s.groupID=? AND s.sessionActive=1"];
                    return [4 /*yield*/, (0, hooks_1.retrieveGroupID)(body["authenticationKey"])];
                case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([[_m.sent()]]))];
                case 2:
                    results = _m.sent();
                    if (!results || !results.length)
                        return [2 /*return*/, reply.code(400).send("No logs found")];
                    distances = {};
                    for (i = 0; i < results.length; i++) {
                        e = results[i];
                        if (!(e.userID in distances)) {
                            distances[e.userID] = { distance: 0, fullName: e["fullName"] };
                        }
                        distances[e.userID] = {
                            distance: distances[e.userID].distance + parseFloat(e.distance),
                            fullName: e["fullName"],
                        };
                    }
                    totalDistance = Object.values(distances).reduce(function (a, b) { return a + b["distance"]; }, 0);
                    pricePerLiter = body["totalPrice"] / body["litersFilled"];
                    totalCarDistance = body["odometer"] - results[0]["initialOdometer"];
                    litersPerKm = body["litersFilled"] /
                        (results[0]["initialOdometer"] && totalCarDistance > 0
                            ? totalCarDistance
                            : totalDistance);
                    return [4 /*yield*/, (0, hooks_1.retrieveID)(body["authenticationKey"])];
                case 3:
                    userID = _m.sent();
                    Object.entries(distances).map(function (_a) {
                        var key = _a[0], value = _a[1];
                        distances[key] = {
                            fullName: value.fullName,
                            paymentDue: Math.round(value.distance * litersPerKm * pricePerLiter * 100) / 100,
                            paid: parseInt(key) === userID,
                            distance: Math.round(value.distance * 100) / 100,
                            liters: (value.distance * litersPerKm).toFixed(2),
                        };
                    });
                    if (results[0]["initialOdometer"] &&
                        totalCarDistance !== totalDistance &&
                        totalCarDistance - totalDistance > 0) {
                        distances[0] = {
                            fullName: "Unaccounted Distance",
                            paymentDue: Math.round((totalCarDistance - totalDistance) * litersPerKm * pricePerLiter * 100) / 100,
                            paid: false,
                            distance: Math.round((totalCarDistance - totalDistance) * 100) / 100,
                        };
                    }
                    _c = hooks_1.dbInsert;
                    _d = ["UPDATE sessions SET sessionActive=0, sessionEnd=? WHERE groupID=? AND sessionActive=1"];
                    _e = [Date.now()];
                    return [4 /*yield*/, (0, hooks_1.retrieveGroupID)(body["authenticationKey"])];
                case 4: return [4 /*yield*/, _c.apply(void 0, _d.concat([_e.concat([_m.sent()])]))];
                case 5:
                    _m.sent();
                    _f = hooks_1.dbInsert;
                    _g = ["INSERT INTO sessions (sessionStart, groupID, sessionActive, initialOdometer) VALUES (?,?,?,?)"];
                    _h = [Date.now()];
                    return [4 /*yield*/, (0, hooks_1.retrieveGroupID)(body["authenticationKey"])];
                case 6: return [4 /*yield*/, _f.apply(void 0, _g.concat([_h.concat([
                            _m.sent(),
                            true,
                            body["odometer"]
                        ])]))];
                case 7:
                    _m.sent();
                    _j = hooks_1.dbInsert;
                    _k = ["INSERT INTO invoices (invoiceData, sessionID, totalPrice, totalDistance, userID, litersFilled, pricePerLiter, uniqueURL) VALUES (?,?,?,?,?,?,?,?)"];
                    _l = [JSON.stringify(distances),
                        results[0].sessionID,
                        body["totalPrice"],
                        Math.round((totalCarDistance > 0 ? totalCarDistance : totalDistance) * 100) / 100];
                    return [4 /*yield*/, (0, hooks_1.retrieveID)(body["authenticationKey"])];
                case 8:
                    _l = _l.concat([
                        _m.sent(),
                        body["litersFilled"],
                        pricePerLiter
                    ]);
                    return [4 /*yield*/, (0, hooks_1.generateUniqueURL)()];
                case 9: return [4 /*yield*/, _j.apply(void 0, _k.concat([_l.concat([
                            _m.sent()
                        ])]))];
                case 10:
                    res = _m.sent();
                    notifications = results.filter(function (e) { return e.userID !== userID; });
                    notifications = notifications.reduce(function (map, obj) {
                        map[obj.userID] = obj;
                        return map;
                    }, {});
                    (0, hooks_1.sendNotification)(Object.values(notifications), "You have a new invoice waiting!", { route: "Invoices", invoiceID: res["insertId"] });
                    reply.send(res["insertId"]);
                    return [2 /*return*/];
            }
        });
    }); });
    done();
});
