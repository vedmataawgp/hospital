import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, patientsTable, doctorsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "hospital_salt_2024").digest("hex");
}

function generateToken(userId: number, role: string): string {
  const payload = JSON.stringify({ userId, role, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  return Buffer.from(payload).toString("base64");
}

export function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString());
    if (payload.exp < Date.now()) return null;
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Bad Request", message: "Email and password required" });
    return;
  }
  const user = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user[0] || user[0].password !== hashPassword(password)) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
    return;
  }
  const token = generateToken(user[0].id, user[0].role);
  res.json({
    token,
    user: {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      role: user[0].role,
      createdAt: user[0].createdAt,
    },
  });
});

router.post("/register", async (req, res) => {
  const { name, email, password, role = "patient" } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "Bad Request", message: "Name, email and password required" });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing[0]) {
    res.status(400).json({ error: "Bad Request", message: "Email already exists" });
    return;
  }
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    password: hashPassword(password),
    role,
  }).returning();

  if (role === "patient") {
    await db.insert(patientsTable).values({ userId: user.id });
  } else if (role === "doctor") {
    await db.insert(doctorsTable).values({ userId: user.id, specialization: "General" });
  }

  const token = generateToken(user.id, user.role);
  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

router.get("/profile", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized", message: "No token" });
    return;
  }
  const decoded = verifyToken(auth.slice(7));
  if (!decoded) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, decoded.userId)).limit(1);
  if (!user) {
    res.status(404).json({ error: "Not Found", message: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
});

export default router;
