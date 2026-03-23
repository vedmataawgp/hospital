import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, patientsTable, doctorsTable, appointmentsTable, notificationsTable } from "@workspace/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { requireAuth } from "./middleware";

const router: IRouter = Router();

async function getAppointmentWithNames(id: number) {
  const [appt] = await db
    .select({
      id: appointmentsTable.id,
      patientId: appointmentsTable.patientId,
      doctorId: appointmentsTable.doctorId,
      date: appointmentsTable.date,
      time: appointmentsTable.time,
      status: appointmentsTable.status,
      notes: appointmentsTable.notes,
      createdAt: appointmentsTable.createdAt,
    })
    .from(appointmentsTable)
    .where(eq(appointmentsTable.id, id))
    .limit(1);
  if (!appt) return null;

  const [patient] = await db
    .select({ name: usersTable.name })
    .from(patientsTable)
    .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
    .where(eq(patientsTable.id, appt.patientId))
    .limit(1);

  const [doctor] = await db
    .select({ name: usersTable.name, specialization: doctorsTable.specialization })
    .from(doctorsTable)
    .innerJoin(usersTable, eq(doctorsTable.userId, usersTable.id))
    .where(eq(doctorsTable.id, appt.doctorId))
    .limit(1);

  return {
    ...appt,
    patientName: patient?.name || "",
    doctorName: doctor?.name || "",
    doctorSpecialization: doctor?.specialization || "",
  };
}

router.get("/", requireAuth, async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const status = req.query.status as string | undefined;
  const doctorId = req.query.doctorId ? Number(req.query.doctorId) : undefined;
  const patientId = req.query.patientId ? Number(req.query.patientId) : undefined;

  const conditions = [];
  if (status) conditions.push(eq(appointmentsTable.status, status as any));
  if (doctorId) conditions.push(eq(appointmentsTable.doctorId, doctorId));
  if (patientId) conditions.push(eq(appointmentsTable.patientId, patientId));

  const appts = await db
    .select({
      id: appointmentsTable.id,
      patientId: appointmentsTable.patientId,
      doctorId: appointmentsTable.doctorId,
      date: appointmentsTable.date,
      time: appointmentsTable.time,
      status: appointmentsTable.status,
      notes: appointmentsTable.notes,
      createdAt: appointmentsTable.createdAt,
      patientName: usersTable.name,
    })
    .from(appointmentsTable)
    .innerJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(appointmentsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const enriched = await Promise.all(
    appts.map(async (a) => {
      const [dr] = await db
        .select({ name: usersTable.name, specialization: doctorsTable.specialization })
        .from(doctorsTable)
        .innerJoin(usersTable, eq(doctorsTable.userId, usersTable.id))
        .where(eq(doctorsTable.id, a.doctorId))
        .limit(1);
      return {
        ...a,
        doctorName: dr?.name || "",
        doctorSpecialization: dr?.specialization || "",
      };
    })
  );

  const totalResult = await db.select({ count: sql<number>`count(*)::int` }).from(appointmentsTable);
  const total = totalResult[0]?.count || 0;

  res.json({
    data: enriched,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

router.post("/", requireAuth, async (req, res) => {
  const { doctorId, date, time, notes } = req.body;
  let { patientId } = req.body;

  if (!doctorId || !date || !time) {
    res.status(400).json({ error: "Bad Request", message: "doctorId, date, time required" });
    return;
  }

  if (!patientId && req.user?.role === "patient") {
    const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.userId, req.user.userId)).limit(1);
    patientId = patient?.id;
  }

  if (!patientId) {
    res.status(400).json({ error: "Bad Request", message: "patientId required" });
    return;
  }

  const [appt] = await db.insert(appointmentsTable).values({
    patientId,
    doctorId,
    date,
    time,
    status: "pending",
    notes: notes || null,
  }).returning();

  const patient = await db.select({ userId: patientsTable.userId }).from(patientsTable).where(eq(patientsTable.id, patientId)).limit(1);
  if (patient[0]) {
    await db.insert(notificationsTable).values({
      userId: patient[0].userId,
      message: `Your appointment has been booked for ${date} at ${time}`,
      type: "appointment",
      status: "unread",
    });
  }

  const result = await getAppointmentWithNames(appt.id);
  res.status(201).json(result);
});

router.get("/:id", requireAuth, async (req, res) => {
  const result = await getAppointmentWithNames(Number(req.params.id));
  if (!result) {
    res.status(404).json({ error: "Not Found", message: "Appointment not found" });
    return;
  }
  res.json(result);
});

router.put("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { date, time, status, notes } = req.body;
  const [existing] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not Found", message: "Appointment not found" });
    return;
  }
  await db.update(appointmentsTable).set({
    date: date || existing.date,
    time: time || existing.time,
    status: status || existing.status,
    notes: notes !== undefined ? notes : existing.notes,
  }).where(eq(appointmentsTable.id, id));
  const result = await getAppointmentWithNames(id);
  res.json(result);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(appointmentsTable).where(eq(appointmentsTable.id, id));
  res.json({ message: "Appointment cancelled" });
});

router.post("/:id/confirm", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [existing] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not Found", message: "Appointment not found" });
    return;
  }
  await db.update(appointmentsTable).set({ status: "confirmed" }).where(eq(appointmentsTable.id, id));

  const patient = await db.select({ userId: patientsTable.userId }).from(patientsTable).where(eq(patientsTable.id, existing.patientId)).limit(1);
  if (patient[0]) {
    await db.insert(notificationsTable).values({
      userId: patient[0].userId,
      message: `Your appointment on ${existing.date} at ${existing.time} has been confirmed`,
      type: "appointment",
      status: "unread",
    });
  }

  const result = await getAppointmentWithNames(id);
  res.json(result);
});

router.post("/:id/cancel", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  await db.update(appointmentsTable).set({ status: "cancelled" }).where(eq(appointmentsTable.id, id));
  const result = await getAppointmentWithNames(id);
  res.json(result);
});

export default router;
