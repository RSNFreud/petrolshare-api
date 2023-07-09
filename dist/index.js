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
exports.conn = exports.fastify = void 0;
var fastify_1 = __importDefault(require("fastify"));
var mysql_1 = __importDefault(require("mysql"));
require("dotenv").config();
var cors_1 = __importDefault(require("@fastify/cors"));
var hooks_1 = require("./hooks");
var invoices_1 = __importDefault(require("./routes/invoices"));
var distance_1 = __importDefault(require("./routes/distance"));
var email_1 = __importDefault(require("./routes/email"));
var group_1 = __importDefault(require("./routes/group"));
var logs_1 = __importDefault(require("./routes/logs"));
var notify_1 = __importDefault(require("./routes/notify"));
var petrol_1 = __importDefault(require("./routes/petrol"));
var presets_1 = __importDefault(require("./routes/presets"));
var user_1 = __importDefault(require("./routes/user"));
exports.fastify = (0, fastify_1.default)({});
exports.fastify.register(require("@fastify/static"), {
    root: __dirname,
});
exports.fastify.register(require("@fastify/view"), {
    root: 'pages',
    prefix: 'pages',
    engine: {
        ejs: require("ejs"),
    },
});
exports.fastify.register(distance_1.default);
exports.fastify.register(email_1.default);
exports.fastify.register(group_1.default);
exports.fastify.register(invoices_1.default);
exports.fastify.register(logs_1.default);
exports.fastify.register(notify_1.default);
exports.fastify.register(petrol_1.default);
exports.fastify.register(presets_1.default);
exports.fastify.register(user_1.default);
exports.fastify.register(cors_1.default);
exports.conn = mysql_1.default.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "petrolshare",
});
exports.conn.connect();
setInterval(function () {
    (0, hooks_1.deleteEmptyGroups)();
}, 86400000);
exports.fastify.get("/", function (req, reply) {
    reply.view("fail.html");
});
// // EMAIL
// fastify.get<{ Querystring: { code: string } }>(
//     "/test",
//     async (request, reply) => {
//         sendNotification(
//             [{ notificationKey: "ExponentPushToken[kAgk8YHT1CczurXj67C80_]" }],
//             "Testing...",
//             { route: "Invoices", invoiceID: 440 }
//         );
//     }
// );
// Run the server!
var start = function () { return __awaiter(void 0, void 0, void 0, function () {
    var err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, exports.fastify.listen({ port: 3434 })];
            case 1:
                _a.sent();
                console.log("Listening to traffic on 3434");
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                exports.fastify.log.error(err_1);
                process.exit(1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
start();
