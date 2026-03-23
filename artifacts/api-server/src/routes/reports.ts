import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, patientsTable, reportsTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "./middleware";

const router: IRouter = Router();

router.get("/", requireAuth, async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const patientId = req.query.patientId ? Number(req.query.patientId) : undefined;

  const query = db
    .select({
      id: reportsTable.id,
      patientId: reportsTable.patientId,
      title: reportsTable.title,
      description: reportsTable.description,
      fileUrl: reportsTable.fileUrl,
      reportType: reportsTable.reportType,
      createdAt: reportsTable.createdAt,
      patientName: usersTable.name,
    })
    .from(reportsTable)
    .innerJoin(patientsTable, eq(reportsTable.patientId, patientsTable.id))
    .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
    .$dynamic();

  const data = await (patientId
    ? query.where(eq(reportsTable.patientId, patientId))
    : query
  ).orderBy(desc(reportsTable.createdAt)).limit(limit).offset(offset);

  const totalResult = await db.select({ count: sql<number>`count(*)::int` }).from(reportsTable);
  const total = totalResult[0]?.count || 0;

  res.json({
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

router.post("/", requireAuth, async (req, res) => {
  const { patientId, title, description, reportType, fileUrl } = req.body;
  if (!patientId || !title || !reportType) {
    res.status(400).json({ error: "Bad Request", message: "patientId, title, reportType required" });
    return;
  }
  const [report] = await db.insert(reportsTable).values({
    patientId,
    title,
    description: description || null,
    fileUrl: fileUrl || null,
    reportType,
  }).returning();

  const [result] = await db
    .select({
      id: reportsTable.id,
      patientId: reportsTable.patientId,
      title: reportsTable.title,
      description: reportsTable.description,
      fileUrl: reportsTable.fileUrl,
      reportType: reportsTable.reportType,
      createdAt: reportsTable.createdAt,
      patientName: usersTable.name,
    })
    .from(reportsTable)
    .innerJoin(patientsTable, eq(reportsTable.patientId, patientsTable.id))
    .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
    .where(eq(reportsTable.id, report.id))
    .limit(1);
  res.status(201).json(result);
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [report] = await db
    .select({
      id: reportsTable.id,
      patientId: reportsTable.patientId,
      title: reportsTable.title,
      description: reportsTable.description,
      fileUrl: reportsTable.fileUrl,
      reportType: reportsTable.reportType,
      createdAt: reportsTable.createdAt,
      patientName: usersTable.name,
    })
    .from(reportsTable)
    .innerJoin(patientsTable, eq(reportsTable.patientId, patientsTable.id))
    .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
    .where(eq(reportsTable.id, id))
    .limit(1);
  if (!report) {
    res.status(404).json({ error: "Not Found", message: "Report not found" });
    return;
  }
  res.json(report);
});

router.delete("/:id", requireAuth, async (req, res) => {
  await db.delete(reportsTable).where(eq(reportsTable.id, Number(req.params.id)));
  res.json({ message: "Report deleted" });
});

export default router;
