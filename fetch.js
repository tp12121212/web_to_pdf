const fs = require("fs");
const puppeteer = require("puppeteer");

const BASE = "https://learn.cloudpartner.fi/categories/sc-400";

async function scrape() {

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    console.log("🔎 Loading category page...");
    await page.goto(BASE, { waitUntil: "networkidle2" });

    const links = await page.$$eval("a", as =>
        as.map(a => a.href).filter(x => x.includes("/posts/"))
    );

    console.log(`📌 Found ${links.length} post links`);

    fs.mkdirSync("output", { recursive: true });

    for (let link of links) {
        const slug = link.split("/").pop() + ".pdf";
        const file = `output/${slug}`;

        console.log(`🖨 Rendering → ${slug}`);

        await page.goto(link, { waitUntil: "networkidle2" });
        await page.pdf({
            path: file,
            format: "A4",
            printBackground: true,
            margin: { top: "10mm", bottom: "10mm" }
        });
    }

    await browser.close();
    console.log("✨ All PDFs exported!");
}

scrape();
