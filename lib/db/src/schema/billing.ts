import { pgTable, serial, integer, text, timestamp, pgEnum, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { patientsTable } from "./patients";
import { appointmentsTable } from "./appointments";

export const billingStatusEnum = pgEnum("billing_status", ["paid", "pending", "overdue"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "card", "insurance", "bank_transfer"]);

export const billingTable = pgTable("billing", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => patientsTable.id, { onDelete: "cascade" }),
  appointmentId: integer("appointment_id").references(() => appointmentsTable.id, { onDelete: "set null" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  status: billingStatusEnum("status").notNull().default("pending"),
  paymentMethod: paymentMethodEnum("payment_method"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBillingSchema = createInsertSchema(billingTable).omit({ id: true, createdAt: true, paidAt: true });
export type InsertBilling = z.infer<typeof insertBillingSchema>;
export type Billing = typeof billingTable.$inferSelect;
