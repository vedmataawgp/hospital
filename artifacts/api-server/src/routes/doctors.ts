import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, doctorsTable } from "@workspace/db/schema";
import { eq, ilike, or, desc, sql } from "drizzle-orm";
import { requireAuth } from "./middleware";
import crypto from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "hospital_salt_2024").digest("hex");
}

router.get("/", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const search = req.query.search as string | undefined;
  const specialization = req.query.specialization as string | undefined;
  const offset = (page - 1) * limit;

  let query = db
    .select({
      id: doctorsTable.id,
      userId: doctorsTable.userId,
      name: usersTable.name,
      email: usersTable.email,
      specialization: doctorsTable.specialization,
      experience: doctorsTable.experience,
      phone: doctorsTable.phone,
      availability: doctorsTable.availability,
      bio: doctorsTable.bio,
      createdAt: doctorsTable.createdAt,
    })
    .from(doctorsTable)
    .innerJoin(usersTable, eq(doctorsTable.userId, usersTable.id))
    .$dynamic();

  if (search) {
    query = query.where(or(ilike(usersTable.name, `%${search}%`), ilike(doctorsTable.specialization, `%${search}%`)));
  } else if (specialization) {
    query = query.where(ilike(doctorsTable.specialization, `%${specialization}%`));
  }

  const data = await query.orderBy(desc(doctorsTable.createdAt)).limit(limit).offset(offset);
  const totalResult = await db.select({ count: sql<number>`count(*)::int` }).from(doctorsTable);
  const total = totalResult[0]?.count || 0;

  res.json({
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

router.post("/", requireAuth, async (req, res) => {
  const { name, email, password, specialization, experience, phone, availability, bio } = req.body;
  if (!name || !email || !password || !specialization) {
    res.status(400).json({ error: "Bad Request", message: "Name, email, password, specialization required" });
    return;
  }
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    password: hashPassword(password),
    role: "doctor",
  }).returning();
  const [doctor] = await db.insert(doctorsTable).values({
    userId: user.id,
    specialization,
    experience: experience || 0,
    phone: phone || null,
    availability: availability || null,
    bio: bio || null,
  }).returning();
  res.status(201).json({
    id: doctor.id,
    userId: doctor.userId,
    name: user.name,
    email: user.email,
    specialization: doctor.specialization,
    experience: doctor.experience,
    phone: doctor.phone,
    availability: doctor.availability,
    bio: doctor.bio,
    createdAt: doctor.createdAt,
  });
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [doctor] = await db
    .select({
      id: doctorsTable.id,
      userId: doctorsTable.userId,
      name: usersTable.name,
      email: usersTable.email,
      specialization: doctorsTable.specialization,
      experience: doctorsTable.experience,
      phone: doctorsTable.phone,
      availability: doctorsTable.availability,
      bio: doctorsTable.bio,
      createdAt: doctorsTable.createdAt,
    })
    .from(doctorsTable)
    .innerJoin(usersTable, eq(doctorsTable.userId, usersTable.id))
    .where(eq(doctorsTable.id, id))
    .limit(1);
  if (!doctor) {
    res.status(404).json({ error: "Not Found", message: "Doctor not found" });
    return;
  }
  res.json(doctor);
});

router.put("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { name, specialization, experience, phone, availability, bio } = req.body;
  const [existing] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not Found", message: "Doctor not found" });
    return;
  }
  if (name) {
    await db.update(usersTable).set({ name }).where(eq(usersTable.id, existing.userId));
  }
  const [updated] = await db.update(doctorsTable).set({
    specialization: specialization || existing.specialization,
    experience: experience !== undefined ? experience : existing.experience,
    phone: phone !== undefined ? phone : existing.phone,
    availability: availability !== undefined ? availability : existing.availability,
    bio: bio !== undefined ? bio : existing.bio,
  }).where(eq(doctorsTable.id, id)).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, updated.userId)).limit(1);
  res.json({
    id: updated.id,
    userId: updated.userId,
    name: user.name,
    email: user.email,
    specialization: updated.specialization,
    experience: updated.experience,
    phone: updated.phone,
    availability: updated.availability,
    bio: updated.bio,
    createdAt: updated.createdAt,
  });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [existing] = await db.select().from(doctorsTable).where(eq(doctorsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not Found", message: "Doctor not found" });
    return;
  }
  await db.delete(usersTable).where(eq(usersTable.id, existing.userId));
  res.json({ message: "Doctor deleted successfully" });
});

export default router;
