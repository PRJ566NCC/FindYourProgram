export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";
import puppeteerCore from "puppeteer-core";

const isVercel = !!process.env.VERCEL;

// Official pack file for v141, x64
const CHROMIUM_PACK_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v141.0.0/chromium-v141.0.0-pack.x64.tar";

async function launchBrowser() {
  if (!isVercel) {
    return puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  chromium.setHeadlessMode = true;
  chromium.setGraphicsMode = false;

  const executablePath = await chromium.executablePath(CHROMIUM_PACK_URL);

  return puppeteerCore.launch({
    args: chromium.args,
    executablePath,
    defaultViewport: chromium.defaultViewport,
    headless: chromium.headless,
  });
}

export async function GET(req, { params }) {
  try {
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

    const browser = await launchBrowser();

    try {
      const page = await browser.newPage();

      await page.setViewport({
        width: 1400,
        height: 900,
        deviceScaleFactor: 1,
      });

      page.setDefaultNavigationTimeout(20000);

      await page.goto(url, {
        waitUntil: "domcontentloaded",
      });

      await new Promise((resolve) => setTimeout(resolve, 1200));

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
          "Content-Disposition": `attachment; filename="program.pdf"`,
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      {
        message: "Failed to generate PDF.",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
