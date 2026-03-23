import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, patientsTable } from "@workspace/db/schema";
import { eq, ilike, or, desc, sql } from "drizzle-orm";
import { requireAuth } from "./middleware";
import crypto from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "hospital_salt_2024").digest("hex");
}

router.get("/", requireAuth, async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const search = req.query.search as string | undefined;
  const offset = (page - 1) * limit;

  const baseQuery = db
    .select({
      id: patientsTable.id,
      userId: patientsTable.userId,
      name: usersTable.name,
      email: usersTable.email,
      age: patientsTable.age,
      gender: patientsTable.gender,
      phone: patientsTable.phone,
      address: patientsTable.address,
      bloodGroup: patientsTable.bloodGroup,
      createdAt: patientsTable.createdAt,
    })
    .from(patientsTable)
    .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id));

  const filtered = search
    ? baseQuery.where(or(ilike(usersTable.name, `%${search}%`), ilike(usersTable.email, `%${search}%`)))
    : baseQuery;

  const data = await filtered.orderBy(desc(patientsTable.createdAt)).limit(limit).offset(offset);

  const totalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(patientsTable)
    .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id));
  const total = totalResult[0]?.count || 0;

  res.json({
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

router.post("/", requireAuth, async (req, res) => {
  const { name, email, password, age, gender, phone, address, bloodGroup } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "Bad Request", message: "Name, email, password required" });
    return;
  }
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    password: hashPassword(password),
    role: "patient",
  }).returning();
  const [patient] = await db.insert(patientsTable).values({
    userId: user.id,
    age: age || null,
    gender: gender || null,
    phone: phone || null,
    address: address || null,
    bloodGroup: bloodGroup || null,
  }).returning();
  res.status(201).json({
    id: patient.id,
    userId: patient.userId,
    name: user.name,
    email: user.email,
    age: patient.age,
    gender: patient.gender,
    phone: patient.phone,
    address: patient.address,
    bloodGroup: patient.bloodGroup,
    createdAt: patient.createdAt,
  });
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [patient] = await db
    .select({
      id: patientsTable.id,
      userId: patientsTable.userId,
      name: usersTable.name,
      email: usersTable.email,
      age: patientsTable.age,
      gender: patientsTable.gender,
      phone: patientsTable.phone,
      address: patientsTable.address,
      bloodGroup: patientsTable.bloodGroup,
      createdAt: patientsTable.createdAt,
    })
    .from(patientsTable)
    .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
    .where(eq(patientsTable.id, id))
    .limit(1);
  if (!patient) {
    res.status(404).json({ error: "Not Found", message: "Patient not found" });
    return;
  }
  res.json(patient);
});

router.put("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { age, gender, phone, address, bloodGroup, name } = req.body;
  const [existing] = await db.select().from(patientsTable).where(eq(patientsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not Found", message: "Patient not found" });
    return;
  }
  if (name) {
    await db.update(usersTable).set({ name }).where(eq(usersTable.id, existing.userId));
  }
  const [updated] = await db.update(patientsTable).set({
    age: age !== undefined ? age : existing.age,
    gender: gender !== undefined ? gender : existing.gender,
    phone: phone !== undefined ? phone : existing.phone,
    address: address !== undefined ? address : existing.address,
    bloodGroup: bloodGroup !== undefined ? bloodGroup : existing.bloodGroup,
  }).where(eq(patientsTable.id, id)).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, updated.userId)).limit(1);
  res.json({
    id: updated.id,
    userId: updated.userId,
    name: user.name,
    email: user.email,
    age: updated.age,
    gender: updated.gender,
    phone: updated.phone,
    address: updated.address,
    bloodGroup: updated.bloodGroup,
    createdAt: updated.createdAt,
  });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [existing] = await db.select().from(patientsTable).where(eq(patientsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not Found", message: "Patient not found" });
    return;
  }
  await db.delete(usersTable).where(eq(usersTable.id, existing.userId));
  res.json({ message: "Patient deleted successfully" });
});

export default router;
