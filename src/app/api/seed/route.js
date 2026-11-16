import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Insight } from "@/lib/models/Insight";
import { CaseStudy } from "@/lib/models/CaseStudy";
import { Career } from "@/lib/models/Career";
import { Testimonial } from "@/lib/models/Testimonial";
import { AdminUser } from "@/lib/models/AdminUser";
import { hashPassword, requireAdmin } from "@/lib/auth";
import seed from "@/data/seed-content.json";

/**
 * Upsert seed content. Requires admin session, OR x-seed-secret: AUTH_SECRET.
 * Full wipe + reseed when x-seed-secret is sent.
 */
export async function POST(request) {
  try {
    const secret = request.headers.get("x-seed-secret");
    const allowSecret = secret && secret === process.env.AUTH_SECRET;
    const auth = await requireAdmin();
    if (auth.error && !allowSecret) return auth.error;

    await connectDB();

    const username = process.env.ADMIN_USERNAME || "Me@hradmin";
    const password = process.env.ADMIN_PASSWORD || "Mehrpune@2027";
    let admin = await AdminUser.findOne({ username });
    if (!admin) {
      admin = await AdminUser.create({
        username,
        passwordHash: await hashPassword(password),
        name: "me-HR Admin",
      });
    }

    if (allowSecret) {
      await Insight.deleteMany({});
      await CaseStudy.deleteMany({});
      await Career.deleteMany({});
      await Testimonial.deleteMany({});
    }

    const insightOps = (seed.insights || []).map((row) => ({
      updateOne: {
        filter: { slug: row.slug },
        update: {
          $setOnInsert: {
            ...row,
            publishedAt: new Date(row.publishedAt || Date.now()),
          },
        },
        upsert: true,
      },
    }));
    const caseOps = (seed.cases || []).map((row) => ({
      updateOne: {
        filter: { slug: row.slug },
        update: {
          $setOnInsert: {
            ...row,
            publishedAt: new Date(row.publishedAt || Date.now()),
          },
        },
        upsert: true,
      },
    }));
    const careerOps = (seed.careers || []).map((row) => ({
      updateOne: {
        filter: { slug: row.slug },
        update: {
          $setOnInsert: {
            ...row,
            publishedAt: new Date(row.publishedAt || Date.now()),
          },
        },
        upsert: true,
      },
    }));
    const testimonialOps = (seed.testimonials || []).map((row) => ({
      updateOne: {
        filter: { slug: row.slug },
        update: { $setOnInsert: { ...row } },
        upsert: true,
      },
    }));

    if (insightOps.length) await Insight.bulkWrite(insightOps);
    if (caseOps.length) await CaseStudy.bulkWrite(caseOps);
    if (careerOps.length) await Career.bulkWrite(careerOps);
    if (testimonialOps.length) await Testimonial.bulkWrite(testimonialOps);

    return NextResponse.json({
      ok: true,
      admin: admin.username,
      seeded: {
        insights: seed.insights?.length || 0,
        caseStudies: seed.cases?.length || 0,
        careers: seed.careers?.length || 0,
        testimonials: seed.testimonials?.length || 0,
      },
    });
  } catch (err) {
    console.error("seed error", err);
    return NextResponse.json({ error: err.message || "Seed failed" }, { status: 500 });
  }
}
