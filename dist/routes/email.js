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
var hooks_1 = require("../hooks");
var argon2_1 = __importDefault(require("argon2"));
var path_1 = __importDefault(require("path"));
exports.default = (function (fastify, _, done) {
    fastify.get("/email/verify", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var query, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = request.query;
                    if (!query || !("code" in query)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT fullName, verified, tempEmail FROM users WHERE verificationCode=?", [query["code"]])];
                case 1:
                    results = _a.sent();
                    if (!results.length)
                        return [2 /*return*/, reply.code(400).sendFile("pages/fail.html")];
                    if (!(results[0].verified && results[0].tempEmail)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, hooks_1.dbInsert)("UPDATE users SET emailAddress=?, verificationCode=null, tempEmail=null WHERE verificationCode=?", [results[0].tempEmail, query["code"]])];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, (0, hooks_1.dbInsert)("UPDATE users SET verified=1, verificationCode=null WHERE verificationCode=?", [query["code"]])];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [4 /*yield*/, reply.sendFile("pages/success.html")];
                case 6:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.post("/email/resend", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var body, emailCode;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = request.body;
                    if (!body || !("emailAddress" in body)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.generateEmailCode)()];
                case 1:
                    emailCode = _a.sent();
                    return [4 /*yield*/, (0, hooks_1.dbInsert)("UPDATE users SET verificationCode=? WHERE emailAddress=?", [
                            emailCode,
                            body["emailAddress"],
                        ])];
                case 2:
                    _a.sent();
                    (0, hooks_1.sendMail)(body["emailAddress"], "Verify your Mail", "Hey,<br><br>Thank you for registering for PetrolShare!<br><br>In order to activate your account, please visit <a href=\"https://petrolshare.freud-online.co.uk/email/verify?code=".concat(emailCode, "\" target=\"__blank\">this link!</a><br><br>Thanks,<br><br><b>The PetrolShare Team</b>"));
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.get("/email/reset-password", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var query, results, password, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    query = request.query;
                    console.log(path_1.default.resolve("pages/fail.html"));
                    if (!query || !("code" in query)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT fullName, verified FROM users WHERE verificationCode=?", [query["code"]])];
                case 1:
                    results = _c.sent();
                    if (!results.length)
                        return [2 /*return*/, reply.code(400).sendFile("fail.html")];
                    password = (0, hooks_1.generateTempPassword)();
                    _a = hooks_1.dbInsert;
                    _b = ["UPDATE users SET password=?, authenticationKey=null, verificationCode=null WHERE verificationCode=?"];
                    return [4 /*yield*/, argon2_1.default.hash(password)];
                case 2: return [4 /*yield*/, _a.apply(void 0, _b.concat([[_c.sent(), query["code"]]]))];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, reply.view("pages/reset-password.ejs", { password: password })];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.get("/email/deactivate", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var query, results, verificationCode;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = request.query;
                    if (!query || !("code" in query)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT fullName, emailAddress FROM users WHERE verificationCode=?", [query["code"]])];
                case 1:
                    results = _a.sent();
                    return [4 /*yield*/, (0, hooks_1.generateEmailCode)()];
                case 2:
                    verificationCode = _a.sent();
                    if (!results.length)
                        return [2 /*return*/, reply.code(400).sendFile("pages/fail.html")];
                    return [4 /*yield*/, (0, hooks_1.dbInsert)("UPDATE users SET active=0, verificationCode=? WHERE verificationCode=?", [verificationCode, query["code"]])];
                case 3:
                    _a.sent();
                    (0, hooks_1.sendMail)(results[0]["emailAddress"], "PetrolShare - Account Deactivated", "Hi!<br><br>Your account has now been deactivated and will be deleted in the next 24 hours. Please click <a href=\"https://petrolshare.freud-online.co.uk/email/activate?code=".concat(verificationCode, "\" target=\"_blank\">here<a/> to reactivate it.<br><br>Thanks<br>The PetrolShare Team"));
                    return [4 /*yield*/, reply.sendFile("pages/deactivated.html")];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    fastify.get("/email/activate", function (request, reply) { return __awaiter(void 0, void 0, void 0, function () {
        var query, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = request.query;
                    if (!query || !("code" in query)) {
                        return [2 /*return*/, reply.code(400).send("Missing required field!")];
                    }
                    return [4 /*yield*/, (0, hooks_1.dbQuery)("SELECT fullName, emailAddress FROM users WHERE verificationCode=?", [query["code"]])];
                case 1:
                    results = _a.sent();
                    if (!results.length)
                        return [2 /*return*/, reply.code(400).sendFile("pages/fail.html")];
                    return [4 /*yield*/, (0, hooks_1.dbInsert)("UPDATE users SET active=1, verificationCode=NULL WHERE verificationCode=?", [query["code"]])];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, reply.sendFile("pages/activated.html")];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    done();
});
