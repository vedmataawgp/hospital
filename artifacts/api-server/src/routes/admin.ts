import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  usersTable,
  patientsTable,
  doctorsTable,
  appointmentsTable,
  billingTable,
} from "@workspace/db/schema";
import { eq, desc, sql, ilike, or } from "drizzle-orm";
import { requireAuth, requireRole } from "./middleware";

const router: IRouter = Router();

router.get("/dashboard", requireAuth, async (req, res) => {
  const [patientCount] = await db.select({ count: sql<number>`count(*)::int` }).from(patientsTable);
  const [doctorCount] = await db.select({ count: sql<number>`count(*)::int` }).from(doctorsTable);
  const [apptCount] = await db.select({ count: sql<number>`count(*)::int` }).from(appointmentsTable);
  const [pendingCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(appointmentsTable)
    .where(eq(appointmentsTable.status, "pending"));
  const [confirmedCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(appointmentsTable)
    .where(eq(appointmentsTable.status, "confirmed"));

  const [revenueResult] = await db
    .select({ total: sql<number>`coalesce(sum(amount::numeric), 0)::float` })
    .from(billingTable)
    .where(eq(billingTable.status, "paid"));
  const [pendingBillingResult] = await db
    .select({ total: sql<number>`coalesce(sum(amount::numeric), 0)::float` })
    .from(billingTable)
    .where(eq(billingTable.status, "pending"));

  const recentAppointments = await db
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
    .orderBy(desc(appointmentsTable.createdAt))
    .limit(5);

  const recentPatients = await db
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
    .orderBy(desc(patientsTable.createdAt))
    .limit(5);

  res.json({
    totalPatients: patientCount.count,
    totalDoctors: doctorCount.count,
    totalAppointments: apptCount.count,
    pendingAppointments: pendingCount.count,
    confirmedAppointments: confirmedCount.count,
    totalRevenue: revenueResult.total,
    pendingBilling: pendingBillingResult.total,
    recentAppointments: recentAppointments.map(a => ({
      ...a,
      doctorName: "",
      doctorSpecialization: "",
    })),
    recentPatients,
  });
});

router.get("/analytics", requireAuth, async (req, res) => {
  const period = (req.query.period as string) || "month";

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  const labels = period === "week"
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : period === "year"
    ? months
    : months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);

  const data = labels.map((label, i) => ({
    label,
    appointments: Math.floor(Math.random() * 50) + 10,
    revenue: Math.floor(Math.random() * 5000) + 1000,
    patients: Math.floor(Math.random() * 20) + 5,
  }));

  const [pendingCount] = await db.select({ count: sql<number>`count(*)::int` }).from(appointmentsTable).where(eq(appointmentsTable.status, "pending"));
  const [confirmedCount] = await db.select({ count: sql<number>`count(*)::int` }).from(appointmentsTable).where(eq(appointmentsTable.status, "confirmed"));
  const [cancelledCount] = await db.select({ count: sql<number>`count(*)::int` }).from(appointmentsTable).where(eq(appointmentsTable.status, "cancelled"));
  const [completedCount] = await db.select({ count: sql<number>`count(*)::int` }).from(appointmentsTable).where(eq(appointmentsTable.status, "completed"));

  res.json({
    period,
    data,
    appointmentsByStatus: {
      pending: pendingCount.count,
      confirmed: confirmedCount.count,
      cancelled: cancelledCount.count,
      completed: completedCount.count,
    },
    revenueByMonth: months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 10000) + 2000,
    })),
  });
});

router.get("/users", requireAuth, async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const role = req.query.role as string | undefined;
  const search = req.query.search as string | undefined;

  let query = db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    role: usersTable.role,
    createdAt: usersTable.createdAt,
  }).from(usersTable).$dynamic();

  if (role) {
    query = query.where(eq(usersTable.role, role as any));
  } else if (search) {
    query = query.where(or(ilike(usersTable.name, `%${search}%`), ilike(usersTable.email, `%${search}%`)));
  }

  const data = await query.orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset);
  const totalResult = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
  const total = totalResult[0]?.count || 0;

  res.json({
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

router.put("/users/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { name, email, role } = req.body;
  const [updated] = await db.update(usersTable).set({
    name: name || undefined,
    email: email || undefined,
    role: role || undefined,
  }).where(eq(usersTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Not Found", message: "User not found" });
    return;
  }
  res.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    createdAt: updated.createdAt,
  });
});

router.delete("/users/:id", requireAuth, async (req, res) => {
  await db.delete(usersTable).where(eq(usersTable.id, Number(req.params.id)));
  res.json({ message: "User deleted" });
});

export default router;
