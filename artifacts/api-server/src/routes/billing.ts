import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, patientsTable, billingTable, notificationsTable } from "@workspace/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { requireAuth } from "./middleware";

const router: IRouter = Router();

router.get("/", requireAuth, async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const status = req.query.status as string | undefined;
  const patientId = req.query.patientId ? Number(req.query.patientId) : undefined;

  const conditions = [];
  if (status) conditions.push(eq(billingTable.status, status as any));
  if (patientId) conditions.push(eq(billingTable.patientId, patientId));

  const bills = await db
    .select({
      id: billingTable.id,
      patientId: billingTable.patientId,
      appointmentId: billingTable.appointmentId,
      amount: billingTable.amount,
      description: billingTable.description,
      status: billingTable.status,
      paymentMethod: billingTable.paymentMethod,
      paidAt: billingTable.paidAt,
      createdAt: billingTable.createdAt,
      patientName: usersTable.name,
    })
    .from(billingTable)
    .innerJoin(patientsTable, eq(billingTable.patientId, patientsTable.id))
    .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(billingTable.createdAt))
    .limit(limit)
    .offset(offset);

  const totalResult = await db.select({ count: sql<number>`count(*)::int` }).from(billingTable);
  const total = totalResult[0]?.count || 0;

  res.json({
    data: bills,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

router.post("/", requireAuth, async (req, res) => {
  const { patientId, appointmentId, amount, description } = req.body;
  if (!patientId || !amount) {
    res.status(400).json({ error: "Bad Request", message: "patientId, amount required" });
    return;
  }
  const [bill] = await db.insert(billingTable).values({
    patientId,
    appointmentId: appointmentId || null,
    amount: String(amount),
    description: description || null,
    status: "pending",
  }).returning();

  const [patient] = await db.select({ userId: patientsTable.userId }).from(patientsTable).where(eq(patientsTable.id, patientId)).limit(1);
  if (patient) {
    await db.insert(notificationsTable).values({
      userId: patient.userId,
      message: `New billing record created for $${amount}. Status: Pending`,
      type: "billing",
      status: "unread",
    });
  }

  const [result] = await db
    .select({
      id: billingTable.id,
      patientId: billingTable.patientId,
      appointmentId: billingTable.appointmentId,
      amount: billingTable.amount,
      description: billingTable.description,
      status: billingTable.status,
      paymentMethod: billingTable.paymentMethod,
      paidAt: billingTable.paidAt,
      createdAt: billingTable.createdAt,
      patientName: usersTable.name,
    })
    .from(billingTable)
    .innerJoin(patientsTable, eq(billingTable.patientId, patientsTable.id))
    .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
    .where(eq(billingTable.id, bill.id))
    .limit(1);
  res.status(201).json(result);
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [bill] = await db
    .select({
      id: billingTable.id,
      patientId: billingTable.patientId,
      appointmentId: billingTable.appointmentId,
      amount: billingTable.amount,
      description: billingTable.description,
      status: billingTable.status,
      paymentMethod: billingTable.paymentMethod,
      paidAt: billingTable.paidAt,
      createdAt: billingTable.createdAt,
      patientName: usersTable.name,
    })
    .from(billingTable)
    .innerJoin(patientsTable, eq(billingTable.patientId, patientsTable.id))
    .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
    .where(eq(billingTable.id, id))
    .limit(1);
  if (!bill) {
    res.status(404).json({ error: "Not Found", message: "Billing not found" });
    return;
  }
  res.json(bill);
});

router.post("/:id/pay", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { paymentMethod } = req.body;
  const [existing] = await db.select().from(billingTable).where(eq(billingTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not Found", message: "Billing not found" });
    return;
  }
  await db.update(billingTable).set({
    status: "paid",
    paymentMethod: paymentMethod || "cash",
    paidAt: new Date(),
  }).where(eq(billingTable.id, id));

  const [patient] = await db.select({ userId: patientsTable.userId }).from(patientsTable).where(eq(patientsTable.id, existing.patientId)).limit(1);
  if (patient) {
    await db.insert(notificationsTable).values({
      userId: patient.userId,
      message: `Payment of $${existing.amount} received successfully via ${paymentMethod}`,
      type: "billing",
      status: "unread",
    });
  }

  const [result] = await db
    .select({
      id: billingTable.id,
      patientId: billingTable.patientId,
      appointmentId: billingTable.appointmentId,
      amount: billingTable.amount,
      description: billingTable.description,
      status: billingTable.status,
      paymentMethod: billingTable.paymentMethod,
      paidAt: billingTable.paidAt,
      createdAt: billingTable.createdAt,
      patientName: usersTable.name,
    })
    .from(billingTable)
    .innerJoin(patientsTable, eq(billingTable.patientId, patientsTable.id))
    .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
    .where(eq(billingTable.id, id))
    .limit(1);
  res.json(result);
});

export default router;
