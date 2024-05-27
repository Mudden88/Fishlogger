import cors from "cors";
import express, { NextFunction } from "express";
import path from "path";
import { Client, QueryResult } from "pg";
import * as dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
const PORT = process.env.PORT || 4000;
const client = new Client({
  connectionString: process.env.PGURI,
});
client.connect();

const app = express();

const corsOption = {
  origin: "https://fishlogger.onrender.com",
  credentials: true,
};

app.use(cors(corsOption));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

//Middleware for authentication..
async function auth(request: Request, response: Response, next: NextFunction) {
  try {
    const token = request.cookies.token;
    const findToken = await client.query(
      "SELECT user_id FROM tokens WHERE token = $1",
      [token]
    );
    if (findToken.rows.length === 0) {
      return response.status(401).send("Unauthorized: please login");
    }
    next();
  } catch (error) {
    console.error("Error during authentication: ", error);
    return response.status(500).send("Server error");
  }
}

//Interfaces
interface CreateAccount {
  username: string;
  email: string;
  password: string;
}

interface LoginReq {
  username: string;
  password: string;
}

interface User {
  id: number;
  username: string;
  password: string;
}

interface Token {
  id: number;
  user_id: number;
  token: string;
}

interface Catch {
  id: number;
  username: string;
  species: string;
  weight: number;
  length: number;
  c_r: number;
  imgurl: string;
  created: string;
  location: string;
}

interface userProfile {
  username: string;
  email: string;
  species: string;
  weight: number;
  length: number;
  c_r: number;
  password: string;
  token: string;
  user_id: number;
}
//Routes

app.post(
  "/api/create-account",
  async (request: Request<CreateAccount>, response: Response) => {
    try {
      const { username, email, password } = request.body;

      if (!username || !password || !email) {
        response.status(400).send("Invalid inputs");
        return;
      }

      const existingUser: QueryResult = await client.query(
        "SELECT * FROM accounts WHERE username = $1 OR email = $2",
        [username, email]
      );

      if (existingUser.rows.length > 0) {
        response.status(409).send("User already exists");
        return;
      }

      const hashedPassword: string = await bcrypt.hash(password, 10);

      await client.query(
        "INSERT INTO accounts (username, password, email) VALUES ($1, $2, $3)",
        [username, hashedPassword, email]
      );
      response.status(201).send("Account successfully created");
    } catch (error) {
      console.error(error);
      response.status(500).send("Server error...");
    }
  }
);

app.post(
  "/api/login",
  async (request: Request<LoginReq>, response: Response) => {
    try {
      const { username, password } = request.body;

      const result: QueryResult<User> = await client.query<User>(
        "SELECT * FROM accounts WHERE username = $1",
        [username]
      );

      if (result.rows.length === 0) {
        return response.status(404).send("Invalid username or password");
      }

      const user: User = result.rows[0];

      const checkPassword: boolean = await bcrypt.compare(
        password,
        user.password
      );

      if (!checkPassword) {
        return response.status(401).send("Invalid password");
      }

      const existingTokenResult: QueryResult<Token> = await client.query<Token>(
        "SELECT * FROM tokens WHERE user_id = $1",
        [user.id]
      );

      if (existingTokenResult.rows.length > 0) {
        const existingToken = existingTokenResult.rows[0].token;
        await client.query("DELETE FROM tokens WHERE token = $1", [
          existingToken,
        ]);
      }

      const token: string = uuidv4();
      await client.query(
        "INSERT INTO tokens (user_id, token) VALUES ($1, $2)",
        [user.id, token]
      );

      response.cookie("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 2592000,
      });

      response.status(201).send("Login successful");
    } catch (error) {
      console.error("Login Error", error);
      response.status(500).send("Server error at login");
    }
  }
);

app.get("/api/get-cookie", async (request: Request, response: Response) => {
  try {
    const cookie: string | undefined = request.cookies.token;
    const token = request.query.token;

    if (token && !cookie) {
      await client.query("DELETE FROM tokens WHERE token = $1", [token]);
      return response.status(400).send("Token removed, cookie missing");
    }
    if (!cookie) {
      return response.status(401).send("Unauthorized request");
    }

    response.status(200).send({ cookie });
  } catch (error) {
    console.error("Error getting cookie ", error);
    response.status(500).send("Error while retreiving cookie from client");
  }
});

app.delete(
  "/api/logout",
  auth,
  async (request: Request, response: Response) => {
    try {
      const token = request.query.token;

      await client.query<Token>("DELETE FROM tokens WHERE token = $1", [token]);

      response.cookie("token", "", { expires: new Date(0) });
      response.status(200).send("Logout successfull");
    } catch (error) {
      console.error("Error during logout: ", error);
      response.status(500).send("Server error");
    }
  }
);

app.get("/api/leaderboard", async (_request: Request, response: Response) => {
  try {
    const { rows } = await client.query<Catch>(
      "SELECT catches.id, accounts.username, catches.species, catches.weight, catches.length, catches.c_r, catches.location, catches.imgurl, TO_CHAR(catches.created, 'YYYY-MM-DD HH24:MI') AS created FROM catches JOIN accounts ON catches.user_id = accounts.id ORDER BY catches.weight DESC"
    );

    response.status(200).send(rows);
  } catch (error) {
    console.error("Error getting results: ", error);
    response.status(500).send("Server error");
  }
});

app.post(
  "/api/newCatch",
  auth,
  async (request: Request, response: Response) => {
    try {
      const token = request.query.token;
      const userIdResult = await client.query<{ user_id: number }>(
        "SELECT * FROM tokens WHERE token = $1",
        [token]
      );

      if (!userIdResult || userIdResult.rows.length === 0) {
        return response.status(401).send("Unauthorized");
      }

      const userId = userIdResult.rows[0].user_id;

      const { species, weight, length, c_r, imgurl, location }: Catch =
        request.body;

      await client.query<Catch>(
        "INSERT INTO catches (user_id, species, weight, length, c_r, imgurl, location) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [userId, species, weight, length, c_r ? 1 : 0, imgurl, location]
      );

      response.status(201).send("Catch registred successfully");
    } catch (error) {
      console.error("Error: ", error);
      response.status(500).send("Server error");
    }
  }
);

app.put("/api/updateCatch/:catchId", auth, async (request, response) => {
  try {
    const token = request.query.token;
    const userIdResult = await client.query<{ user_id: number }>(
      "SELECT * FROM tokens WHERE token = $1",
      [token]
    );

    if (!userIdResult || userIdResult.rows.length === 0) {
      return response.status(401).send("Unauthorized");
    }

    const userId = userIdResult.rows[0].user_id;

    const catchId: number = parseInt(request.params.catchId, 10);
    const catchResult = await client.query(
      "SELECT user_id FROM catches WHERE id = $1",
      [catchId]
    );
    if (!catchResult || catchResult.rows.length === 0) {
      return response.status(404).send("Catch not found");
    }
    if (catchResult.rows[0].user_id !== userId) {
      return response.status(403).send("Permission to update catch, denied");
    }

    const updateFields: string[] = [];
    const values: Catch[] = [];
    let paramNumber: number = 1;

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
    await client.query(
      `UPDATE catches SET ${updateFields.join(",")} WHERE id = $${paramNumber}`,
      [...values, catchId]
    );
    response.status(201).send("Catch updated successfully");
  } catch (error) {
    console.error("Error ", error);
    response.status(500).send("Server error");
  }
});

app.get("/api/getUsers", async (request: Request, response: Response) => {
  const getUser = request.query.getUser;

  if (getUser !== "mudden") {
    response.status(401).send("Unauthorized request");
  }
  try {
    const { rows } = await client.query("SELECT COUNT(*) FROM tokens");
    const count = rows[0].count;
    response.status(200).send(count);
  } catch (error) {
    console.error("Error fetching user count", error);
    response.status(500).send("Server error");
  }
});

app.get(
  "/api/userProfile",
  auth,
  async (request: Request, response: Response) => {
    try {
      const token = request.query.token;
      const getToken = await client.query(
        "SELECT * FROM tokens WHERE token =$1",
        [token]
      );
      const validateToken = getToken.rows[0];

      const userId: number = validateToken.user_id;

      const { rows }: QueryResult<userProfile> = await client.query(
        `
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
      `,
        [userId]
      );

      if (token !== validateToken.token) {
        response.status(401).send("Not authorized");
      } else if (token === validateToken.token) {
        response.status(200).send(rows);
      }
    } catch (error) {
      console.error("Error fetching userprofile ", error);
      response.status(500).send("Server Error");
    }
  }
);

app.get(
  "/api/userCatches/:userId",
  auth,
  async (request: Request, response: Response) => {
    try {
      const userId: number = parseInt(request.params.userId, 10);
      if (!userId) {
        return response.status(401).send("Unauthorized request");
      }

      const { rows } = await client.query(
        "SELECT id, user_id, species, weight, weight, length, c_r, location, imgurl, TO_CHAR(created, 'YYYY-MM-DD HH24:MI') AS catch_created FROM catches WHERE user_id = $1 ORDER BY id DESC",
        [userId]
      );
      response.status(200).send(rows);
    } catch (error) {
      console.error("Error", error);
      response.status(500).send("Server error");
    }
  }
);

app.delete(
  "/api/deleteCatch/:catchId",
  auth,
  async (request: Request, response: Response) => {
    try {
      const catchId: number = parseInt(request.params.catchId, 10);
      const token = request.query.token;
      const getToken = await client.query(
        "SELECT * FROM tokens WHERE token =$1",
        [token]
      );
      const validateToken = getToken.rows[0];

      const userId: number = validateToken.user_id;

      if (!catchId || !userId) {
        return response.status(401).send("Unauthorized request");
      }

      if (catchId && userId) {
        await client.query("DELETE FROM catches WHERE id = $1", [catchId]);
        response.status(204).send("Catch deleted successfully");
      } else {
        response.send(404).send("Not found");
      }
    } catch (error) {
      console.error("Error while deleting catch", error);
      response.status(500).send("Server error");
    }
  }
);

app.put(
  "/api/changePassword/:userID",
  auth,
  async (request: Request, response: Response) => {
    try {
      const userID = request.params.userID;
      const token = request.cookies.token;

      const { oldPassword, newPassword } = request.body;

      if (!userID || !token) {
        response.status(401).send("Unauthorized request");
        return;
      }

      const result: QueryResult<User> = await client.query<User>(
        "SELECT * FROM accounts WHERE id = $1",
        [userID]
      );
      const user: User = result.rows[0];

      if (!user) {
        return response.status(404).send("User not found");
      }
      const checkPassword: boolean = await bcrypt.compare(
        oldPassword,
        user.password
      );

      if (!checkPassword) {
        return response.status(401).send("Invalid password");
      }

      const hashedPassword: string = await bcrypt.hash(newPassword, 10);

      await client.query("UPDATE accounts SET password = $1 WHERE id = $2", [
        hashedPassword,
        userID,
      ]);

      response.status(201).send("Password updated successfully");
    } catch (error) {
      console.error(error);
      response.status(500).send("Server error");
    }
  }
);

app.use(express.static(path.join(path.resolve(), "dist")));
app.get("*", (_reqeust: Request, response: Response) => {
  response.sendFile(path.join(__dirname, "dist", "index.html"));
});
app.listen(PORT, () => {
  console.log(`Redo på http://localhost:${PORT}/`);
});
