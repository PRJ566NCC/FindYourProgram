export const runtime = "nodejs";
export const maxDuration = 60;

import { NextResponse } from "next/server";

// Local development: full Puppeteer (bundled Chrome)
import puppeteer from "puppeteer";

// Vercel production: puppeteer-core + remote Chromium pack
import chromium from "@sparticuz/chromium-min";
import puppeteerCore from "puppeteer-core";

const isVercel = !!process.env.VERCEL;

// official pack URL for v141 (matches your chromium version)
const CHROMIUM_PACK_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v141.0.0/chromium-v141.0.0-pack.tar";

async function launchBrowser() {
  if (!isVercel) {
    // LOCAL: same behaviour you already had
    return puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  // VERCEL: use remote pack so we don't depend on a local bin folder
  const executablePath = await chromium.executablePath(CHROMIUM_PACK_URL);

  return puppeteerCore.launch({
    args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
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

  let browser;

  try {
    browser = await launchBrowser();
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

    // Let the logo image fail so your fallback text appears
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
  } catch (err) {
    console.error("Error generating PDF:", err);
    // expose message during debugging; you can revert to generic later if you want
    return NextResponse.json(
      { message: "Failed to generate PDF.", error: String(err?.message || err) },
      { status: 500 }
    );
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // ignore
      }
    }
  }
}
