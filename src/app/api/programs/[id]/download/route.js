export const runtime = "nodejs";

import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";

async function getBrowser() {
  const isProd = process.env.VERCEL_ENV === "production";

  if (isProd) {
    const executablePath = await chromium.executablePath();

    return puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: {
        width: 1400,
        height: 900,
        deviceScaleFactor: 1,
      },
      executablePath,
      headless: chromium.headless,
    });
  }

  return puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: "new",
  });
}

export async function GET(req, { params }) {
  const { id } = params || {};
  if (!id) {
    return NextResponse.json(
      { message: "Program ID is required." },
      { status: 400 }
    );
  }

  const { origin } = new URL(req.url);
  const url = `${origin}/programs/${encodeURIComponent(
    decodeURIComponent(id)
  )}`;

  const browser = await getBrowser();

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1400,
      height: 900,
      deviceScaleFactor: 1,
    });

    page.setDefaultNavigationTimeout(15000);

    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await page.emulateMediaType("screen");

    await page.addStyleTag({
      content: `
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          header, nav {
            display: none !important;
          }

          a[href]::after {
            content: "" !important;
          }
        }
      `,
    });

    const pdf = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: {
        top: "10mm",
        bottom: "10mm",
        left: "10mm",
        right: "10mm",
      },
      scale: 0.8,
    });

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="program.pdf"',
      },
    });
  } finally {
    await browser.close();
  }
}
