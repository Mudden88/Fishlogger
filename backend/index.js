"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
dotenv.config();
const PORT = process.env.PORT || 4000;
const client = new pg_1.Client({
    connectionString: process.env.PGURI,
});
client.connect();
const app = (0, express_1.default)();
const corsOption = {
    origin: `http://localhost:${PORT}`,
    credentials: true,
};
app.use((0, cors_1.default)(corsOption));
app.use(body_parser_1.default.json());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
//Middleware for authentication
function auth(request, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = request.cookies.token;
            const findToken = yield client.query("SELECT user_id FROM tokens WHERE token = $1", [token]);
            if (findToken.rows.length === 0) {
                return response.status(401).send("Unauthorized: please login");
            }
            next();
        }
        catch (error) {
            console.error("Error during authentication: ", error);
            return response.status(500).send("Server error");
        }
    });
}
//Routes
app.post("/api/create-account", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = request.body;
        if (!username || !password || !email) {
            response.status(400).send("Invalid inputs");
            return;
        }
        const existingUser = yield client.query("SELECT * FROM accounts WHERE username = $1 OR email = $2", [username, email]);
        if (existingUser.rows.length > 0) {
            response.status(409).send("User already exists");
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield client.query("INSERT INTO accounts (username, password, email) VALUES ($1, $2, $3)", [username, hashedPassword, email]);
        response.status(201).send("Account successfully created");
    }
    catch (error) {
        console.error(error);
        response.status(500).send("Server error...");
    }
}));
app.post("/api/login", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = request.body;
        const existingUser = yield client.query("SELECT * FROM tokens WHERE user_id = (SELECT id FROM accounts WHERE username = $1)", [username]);
        if (existingUser.rows.length > 0) {
            return response.status(400).send("User is already logged in");
        }
        const result = yield client.query("SELECT * FROM accounts WHERE username = $1", [username]);
        const user = result.rows[0];
        if (!user) {
            return response.status(404).send("Invalid username or password");
        }
        const checkPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!checkPassword) {
            return response.status(401).send("Invalid password");
        }
        const token = (0, uuid_1.v4)();
        yield client.query("INSERT INTO tokens (user_id, token) VALUES ($1, $2)", [user.id, token]);
        response.cookie("token", token, {
            httpOnly: true,
            secure: true,
        });
        response.status(201).send("Inloggning lyckad");
    }
    catch (error) {
        console.error("Login Error", error);
        response.status(500).send("Server error at login");
    }
}));
app.get("/api/get-cookie", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie = request.cookies.token;
        const token = request.query.token;
        if (!cookie) {
            return response.status(401).send("Unauthorized request");
        }
        if (token && !cookie) {
            yield client.query("DELETE FROM tokens WHERE token = $1", [token]);
            return;
        }
        response.status(200).send({ cookie });
    }
    catch (error) {
        console.error("Error getting cookie ", error);
        response.status(500).send("Error while retreiving cookie from client");
    }
}));
app.delete("/api/logout", auth, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = request.query.token;
        yield client.query("DELETE FROM tokens WHERE token = $1", [token]);
        response.cookie("token", "", { expires: new Date(0) });
        response.status(200).send("Logout successfull");
    }
    catch (error) {
        console.error("Error during logout: ", error);
        response.status(500).send("Server error");
    }
}));
app.get("/api/leaderboard", (_request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rows } = yield client.query("SELECT catches.id, accounts.username, catches.species, catches.weight, catches.length, catches.c_r, catches.location, catches.imgurl, TO_CHAR(catches.created, 'YYYY-MM-DD HH24:MI') AS created FROM catches JOIN accounts ON catches.user_id = accounts.id ORDER BY catches.weight DESC");
        response.status(200).send(rows);
    }
    catch (error) {
        console.error("Error getting results: ", error);
        response.status(500).send("Server error");
    }
}));
app.post("/api/newCatch", auth, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = request.query.token;
        const userIdResult = yield client.query("SELECT * FROM tokens WHERE token = $1", [token]);
        if (!userIdResult || userIdResult.rows.length === 0) {
            return response.status(401).send("Unauthorized");
        }
        const userId = userIdResult.rows[0].user_id;
        const { species, weight, length, c_r, imgurl, location } = request.body;
        yield client.query("INSERT INTO catches (user_id, species, weight, length, c_r, imgurl, location) VALUES ($1, $2, $3, $4, $5, $6, $7)", [userId, species, weight, length, c_r ? 1 : 0, imgurl, location]);
        response.status(201).send("Catch registred successfully");
    }
    catch (error) {
        console.error("Error: ", error);
        response.status(500).send("Server error");
    }
}));
app.put("/api/updateCatch/:catchId", auth, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = request.query.token;
        const userIdResult = yield client.query("SELECT * FROM tokens WHERE token = $1", [token]);
        if (!userIdResult || userIdResult.rows.length === 0) {
            return response.status(401).send("Unauthorized");
        }
        const userId = userIdResult.rows[0].user_id;
        const catchId = parseInt(request.params.catchId, 10);
        const catchResult = yield client.query("SELECT user_id FROM catches WHERE id = $1", [catchId]);
        if (!catchResult || catchResult.rows.length === 0) {
            return response.status(404).send("Catch not found");
        }
        if (catchResult.rows[0].user_id !== userId) {
            return response.status(403).send("Permission to update catch, denied");
        }
        const updateFields = [];
        const values = [];
        let paramNumber = 1;
        if ("species" in request.body) {
            updateFields.push(`species = $${paramNumber}`);
            values.push(request.body.species);
            paramNumber++;
        }
        if ("weight" in request.body) {
            updateFields.push(`weight = $${paramNumber}`);
            values.push(request.body.weight);
            paramNumber++;
        }
        if ("length" in request.body) {
            updateFields.push(`length = $${paramNumber}`);
            values.push(request.body.length);
            paramNumber++;
        }
        if ("imgurl" in request.body) {
            updateFields.push(`imgurl = $${paramNumber}`);
            values.push(request.body.imgurl);
            paramNumber++;
        }
        if ("location" in request.body) {
            updateFields.push(`location = $${paramNumber}`);
            values.push(request.body.location);
            paramNumber++;
        }
        if (updateFields.length === 0) {
            return response.status(400).send("Nothing to update");
        }
        yield client.query(`UPDATE catches SET ${updateFields.join(",")} WHERE id = $${paramNumber}`, [...values, catchId]);
        response.status(201).send("Catch updated successfully");
    }
    catch (error) {
        console.error("Error ", error);
        response.status(500).send("Server error");
    }
}));
app.get("/api/getUsers", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const getUser = request.query.getUser;
    if (getUser !== "mudden") {
        response.status(401).send("Unauthorized request");
    }
    try {
        const { rows } = yield client.query("SELECT COUNT(*) FROM tokens");
        const count = rows[0].count;
        response.status(200).send(count);
    }
    catch (error) {
        console.error("Error fetching user count", error);
        response.status(500).send("Server error");
    }
}));
app.get("/api/userProfile", auth, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = request.query.token;
        const getToken = yield client.query("SELECT * FROM tokens WHERE token =$1", [token]);
        const validateToken = getToken.rows[0];
        const userId = validateToken.user_id;
        const { rows } = yield client.query(`
      SELECT
        accounts.id,
        accounts.username,
        accounts.email,
        TO_CHAR(accounts.created, 'YYYY-MM-DD') AS account_created,
        catches.*,
        tokens.*
      FROM
        accounts
      LEFT JOIN
        catches
      ON
        accounts.id = catches.user_id
      JOIN
        tokens
      ON
        accounts.id = tokens.user_id
      WHERE
        accounts.id = $1
      `, [userId]);
        if (token !== validateToken.token) {
            response.status(401).send("Not authorized");
        }
        else if (token === validateToken.token) {
            response.status(200).send(rows);
        }
    }
    catch (error) {
        console.error("Error fetching userprofile ", error);
        response.status(500).send("Server Error");
    }
}));
app.get("/api/userCatches/:userId", auth, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(request.params.userId, 10);
        if (!userId) {
            return response.status(401).send("Unauthorized request");
        }
        const { rows } = yield client.query("SELECT id, user_id, species, weight, weight, length, c_r, location, imgurl, TO_CHAR(created, 'YYYY-MM-DD HH24:MI') AS catch_created FROM catches WHERE user_id = $1 ORDER BY id DESC", [userId]);
        response.status(200).send(rows);
    }
    catch (error) {
        console.error("Error", error);
        response.status(500).send("Server error");
    }
}));
app.delete("/api/deleteCatch/:catchId", auth, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const catchId = parseInt(request.params.catchId, 10);
        const token = request.query.token;
        const getToken = yield client.query("SELECT * FROM tokens WHERE token =$1", [token]);
        const validateToken = getToken.rows[0];
        const userId = validateToken.user_id;
        if (!catchId || !userId) {
            return response.status(401).send("Unauthorized request");
        }
        if (catchId && userId) {
            yield client.query("DELETE FROM catches WHERE id = $1", [catchId]);
            response.status(204).send("Catch deleted successfully");
        }
        else {
            response.send(404).send("Not found");
        }
    }
    catch (error) {
        console.error("Error while deleting catch", error);
        response.status(500).send("Server error");
    }
}));
app.put("/api/changePassword/:userID", auth, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = request.params.userID;
        const token = request.cookies.token;
        const { oldPassword, newPassword } = request.body;
        if (!userID || !token) {
            response.status(401).send("Unauthorized request");
            return;
        }
        const result = yield client.query("SELECT * FROM accounts WHERE id = $1", [userID]);
        const user = result.rows[0];
        if (!user) {
            return response.status(404).send("User not found");
        }
        const checkPassword = yield bcrypt_1.default.compare(oldPassword, user.password);
        if (!checkPassword) {
            return response.status(401).send("Invalid password");
        }
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        yield client.query("UPDATE accounts SET password = $1 WHERE id = $2", [
            hashedPassword,
            userID,
        ]);
        response.status(201).send("Password updated successfully");
    }
    catch (error) {
        console.error(error);
        response.status(500).send("Server error");
    }
}));
app.use(express_1.default.static(path_1.default.join(path_1.default.resolve(), "dist")));
app.get("*", (_reqeust, response) => {
    response.sendFile(path_1.default.join(__dirname, "dist", "index.html"));
});
app.listen(PORT, () => {
    console.log(`Redo på http://localhost:${PORT}/`);
});
