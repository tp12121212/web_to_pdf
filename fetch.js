const fs = require("fs");
const puppeteer = require("puppeteer");

const BASE = "https://learn.cloudpartner.fi";
const CATEGORY_URL = BASE + "/categories/sc-400";

async function scrape() {
    console.log("🔎 Loading SC-400 category page…");

    // Launch Chromium in CI-safe mode
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu"
        ]
    });

    const page = await browser.newPage();

    await page.goto(CATEGORY_URL, { waitUntil: "networkidle2" });

    console.log("📌 Scraping post links…");
    let links = await page.$$eval("a", anchors =>
        anchors
            .map(a => a.href)
            .filter(href => href && href.includes("/posts/"))
    );

    // Remove duplicates
    links = [...new Set(links)];

    console.log(`📄 Found ${links.length} SC-400 content pages.`);

    if (!links.length) {
        console.log("⚠️ No content found — site layout may have changed.");
        await browser.close();
        return;
    }

    const outputDir = "output";
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    let count = 1;

    for (const link of links) {
        console.log(`\n📥 Fetching ${count}/${links.length}`);
        console.log(`🔗 URL: ${link}`);

        try {
            await page.goto(link, { waitUntil: "networkidle2" });

            const slug = link.split("/").pop().replace(/\/$/, "");
            const file = `${outputDir}/${slug}.pdf`;

            console.log(`🖨 Rendering PDF → ${file}`);

            await page.pdf({
                path: file,
                format: "A4",
                printBackground: true,
                margin: {
                    top: "12mm",
                    bottom: "12mm",
                    left: "10mm",
                    right: "10mm"
                }
            });

            console.log("✔ Success");
        } catch (err) {
            console.log("❌ Failed:", err.message);
        }

        count++;
    }

    console.log("\n✨ All PDFs exported.");
    console.log("📂 Output directory:", outputDir);

    await browser.close();
}

scrape();