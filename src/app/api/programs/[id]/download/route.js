export const runtime = "nodejs";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(req, ctx) {
  const { id } = (await ctx.params) || {};
  if (!id) return NextResponse.json({ message: "Program ID is required." }, { status: 400 });

  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const url = `${base}/programs/${encodeURIComponent(decodeURIComponent(id))}`;

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "A4", printBackground: true, margin: { top: "20mm", bottom: "20mm" } });
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="program.pdf"`,
      },
    });
  } finally {
    await browser.close();
  }
}
