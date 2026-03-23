import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "./middleware";

const router: IRouter = Router();

router.get("/", requireAuth, async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const userId = req.user!.userId;

  const data = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const totalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId));
  const total = totalResult[0]?.count || 0;

  const unreadResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId));
  const unreadCount = data.filter(n => n.status === "unread").length;

  res.json({
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    unreadCount,
  });
});

router.put("/:id/read", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [updated] = await db
    .update(notificationsTable)
    .set({ status: "read" })
    .where(eq(notificationsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Not Found", message: "Notification not found" });
    return;
  }
  res.json(updated);
});

export default router;
