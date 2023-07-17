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
exports.sendNotification = exports.checkIfLast = exports.deleteEmptyGroups = exports.retrieveName = exports.retrieveID = exports.retrieveSessionID = exports.retrieveGroupID = exports.generateGroupID = exports.generateTempPassword = exports.generateCode = exports.generateUniqueURL = exports.generateEmailCode = exports.dbInsert = exports.dbQuery = exports.sendMail = void 0;
require("dotenv").config();
var nodemailer_1 = __importDefault(require("nodemailer"));
var _1 = require(".");
var expo_server_sdk_1 = __importDefault(require("expo-server-sdk"));
var sendMail = function (address, subject, message) { return __awaiter(void 0, void 0, void 0, function () {
    var transporter, info, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                transporter = nodemailer_1.default.createTransport({
                    host: "smtp.gmail.com",
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
                console.log("Google blocked email sending!");
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.sendMail = sendMail;
function dbQuery(query, parameters) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    try {
                        _1.conn.query(query, parameters, function (err, results) {
                            if (err)
                                rej(err);
                            res(results);
                        });
                    }
                    catch (err) {
                        rej(err);
                    }
                })];
        });
    });
}
exports.dbQuery = dbQuery;
function dbInsert(query, parameters) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (res, rej) {
                    try {
                        _1.conn.query(query, parameters, function (err, results) {
                            if (err)
                                rej(err);
                            res(results);
                        });
                    }
                    catch (err) {
                        rej(err);
                    }
                })];
        });
    });
}
exports.dbInsert = dbInsert;
var generateEmailCode = function () { return __awaiter(void 0, void 0, void 0, function () {
    var result, characters, charactersLength, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                result = "";
                characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                charactersLength = characters.length;
                for (i = 0; i < 25; i++) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }
                return [4 /*yield*/, dbQuery("SELECT * from users where verificationCode=?", [result])];
            case 1:
                if ((_a.sent())
                    .length)
                    return [2 /*return*/, (0, exports.generateEmailCode)()];
                return [2 /*return*/, result];
        }
    });
}); };
exports.generateEmailCode = generateEmailCode;
var generateUniqueURL = function () { return __awaiter(void 0, void 0, void 0, function () {
    var result, characters, charactersLength, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                result = "";
                characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                charactersLength = characters.length;
                for (i = 0; i < 25; i++) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }
                return [4 /*yield*/, dbQuery("SELECT * from invoices where uniqueURL=?", [result])];
            case 1:
                if ((_a.sent())
                    .length)
                    return [2 /*return*/, (0, exports.generateUniqueURL)()];
                return [2 /*return*/, result];
        }
    });
}); };
exports.generateUniqueURL = generateUniqueURL;
var generateCode = function () { return __awaiter(void 0, void 0, void 0, function () {
    var result, characters, charactersLength, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                result = "";
                characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                charactersLength = characters.length;
                for (i = 0; i < 25; i++) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }
                return [4 /*yield*/, dbQuery("SELECT * from users where authenticationKey=?", [result])];
            case 1:
                if ((_a.sent())
                    .length)
                    return [2 /*return*/, (0, exports.generateCode)()];
                return [2 /*return*/, result];
        }
    });
}); };
exports.generateCode = generateCode;
var generateTempPassword = function () {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*+=";
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
exports.generateTempPassword = generateTempPassword;
var generateGroupID = function () {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
exports.generateGroupID = generateGroupID;
var retrieveGroupID = function (authenticationKey) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dbQuery("SELECT groupID FROM users WHERE authenticationKey=?", [
                    authenticationKey,
                ])];
            case 1: return [2 /*return*/, (_a.sent())[0].groupID];
        }
    });
}); };
exports.retrieveGroupID = retrieveGroupID;
var retrieveSessionID = function (groupID) { return __awaiter(void 0, void 0, void 0, function () {
    var res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dbQuery("SELECT sessionID FROM sessions WHERE groupID=? AND sessionActive=true", [groupID])];
            case 1:
                res = _a.sent();
                if (!!res.length) return [3 /*break*/, 3];
                return [4 /*yield*/, dbInsert("INSERT INTO sessions (sessionStart, groupID, sessionActive) VALUES (?,?,?)", [Date.now().toString(), groupID, "true"])];
            case 2:
                res = _a.sent();
                return [2 /*return*/, res.insertId];
            case 3: return [2 /*return*/, res[0].sessionID];
        }
    });
}); };
exports.retrieveSessionID = retrieveSessionID;
var retrieveID = function (authenticationKey) { return __awaiter(void 0, void 0, void 0, function () {
    var res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dbQuery("SELECT userID FROM users WHERE authenticationKey=?", [authenticationKey])];
            case 1:
                res = _a.sent();
                if (!res.length)
                    return [2 /*return*/];
                return [2 /*return*/, res[0].userID];
        }
    });
}); };
exports.retrieveID = retrieveID;
var retrieveName = function (userID) { return __awaiter(void 0, void 0, void 0, function () {
    var res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dbQuery("SELECT fullName FROM users WHERE userID=?", [
                    userID,
                ])];
            case 1:
                res = _a.sent();
                if (!res.length)
                    return [2 /*return*/, ""];
                return [2 /*return*/, res[0].fullName];
        }
    });
}); };
exports.retrieveName = retrieveName;
var deleteEmptyGroups = function () { return __awaiter(void 0, void 0, void 0, function () {
    var currentGroups, allGroups;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dbQuery("SELECT u.groupID, g.premium FROM users u LEFT JOIN groups g USING (groupID)")];
            case 1:
                currentGroups = _a.sent();
                return [4 /*yield*/, dbQuery("SELECT groupID, premium FROM groups")];
            case 2:
                allGroups = _a.sent();
                allGroups.map(function (_a) {
                    var groupID = _a.groupID, premium = _a.premium;
                    return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (currentGroups.filter(function (_a) {
                                        var id = _a.groupID;
                                        return id === groupID;
                                    }).length ||
                                        premium)
                                        return [2 /*return*/];
                                    return [4 /*yield*/, dbQuery("DELETE FROM groups WHERE groupID=?", [groupID])];
                                case 1:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                return [2 /*return*/];
        }
    });
}); };
exports.deleteEmptyGroups = deleteEmptyGroups;
var checkIfLast = function (authenticationKey) { return __awaiter(void 0, void 0, void 0, function () {
    var groupID, lastUser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.retrieveGroupID)(authenticationKey)];
            case 1:
                groupID = _a.sent();
                if (!groupID)
                    return [2 /*return*/];
                return [4 /*yield*/, dbQuery("SELECT null FROM users WHERE groupID=?", [groupID])];
            case 2:
                lastUser = (_a.sent()).length;
                if (lastUser === 1) {
                    return [2 /*return*/, true];
                }
                else
                    return [2 /*return*/, false];
                return [2 /*return*/];
        }
    });
}); };
exports.checkIfLast = checkIfLast;
var sendNotification = function (notifKeys, message, route) { return __awaiter(void 0, void 0, void 0, function () {
    var expo, messages, _i, notifKeys_1, pushToken, chunks, tickets, receiptIds, _a, tickets_1, ticket, receiptIdChunks;
    return __generator(this, function (_b) {
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
                console.error("Push token ".concat(pushToken["notificationKey"], " is not a valid Expo push token"));
                continue;
            }
            // // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
            messages.push({
                to: pushToken["notificationKey"],
                body: message,
                data: route && { route: route.route, invoiceID: route.invoiceID },
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
                        console.log("Sending notification...");
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
        receiptIds = [];
        for (_a = 0, tickets_1 = tickets; _a < tickets_1.length; _a++) {
            ticket = tickets_1[_a];
            // NOTE: Not all tickets have IDs; for example, tickets for notifications
            // that could not be enqueued will have error information and no receipt ID.
            if ('id' in ticket) {
                receiptIds.push(ticket === null || ticket === void 0 ? void 0 : ticket.id);
            }
        }
        receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var _i, receiptIdChunks_1, chunk, receipts, receiptId, reciept, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, receiptIdChunks_1 = receiptIdChunks;
                        _a.label = 1;
                    case 1:
                        if (!(_i < receiptIdChunks_1.length)) return [3 /*break*/, 6];
                        chunk = receiptIdChunks_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, expo.getPushNotificationReceiptsAsync(chunk)];
                    case 3:
                        receipts = _a.sent();
                        // The receipts specify whether Apple or Google successfully received the
                        // notification and information about an error, if one occurred.
                        for (receiptId in receipts) {
                            reciept = receipts[receiptId];
                            if (reciept.status === "ok") {
                                continue;
                            }
                            else if (reciept.status === "error") {
                                console.error("There was an error sending a notification: ".concat(reciept.message));
                                if (reciept.details && reciept.details.error) {
                                    console.error("The error code is ".concat(reciept.details.error));
                                }
                            }
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error(error_2);
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
exports.sendNotification = sendNotification;
