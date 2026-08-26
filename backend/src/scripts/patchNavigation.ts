/**
 * patchNavigation.ts
 * Adds /roadmap to the existing Settings.navigation in MongoDB.
 * Safe to run multiple times — checks before inserting.
 */

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../lib/db";

async function patch() {
  await connectDB();
  const db = mongoose.connection.db!;
  const col = db.collection("settings");
  const doc = await col.findOne({});
  if (!doc) { console.log("No settings document found"); process.exit(0); }

  const nav: any[] = doc.navigation ?? [];
  const hasRoadmap = nav.some((n: any) => n.href === "/roadmap");

  if (hasRoadmap) {
    console.log("✅ /roadmap already exists in navigation — no change needed");
    await mongoose.disconnect();
    return;
  }

  // Shift orders >= 3 up by 1 to make room, then insert Roadmap at order 3
  const updated = nav.map((n: any) => (n.order >= 3 ? { ...n, order: n.order + 1 } : n));
  updated.push({
    label: "Roadmap",
    href: "/roadmap",
    enabled: true,
    order: 3,
    external: false,
    highlighted: false,
  });
  updated.sort((a: any, b: any) => a.order - b.order);

  await col.updateOne({}, { $set: { navigation: updated } });
  console.log("✅ /roadmap added to navigation:");
  updated.forEach((n: any) => console.log(`   ${n.order}. ${n.label} → ${n.href}`));
  await mongoose.disconnect();
}

patch().catch((e) => { console.error(e); process.exit(1); });
