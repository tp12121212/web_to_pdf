# SC-400 Web to PDF Exporter

This repository contains a small automation that converts all **Microsoft SC-400** blog posts from:

> https://learn.cloudpartner.fi/categories/sc-400

into **rich, layout-preserving PDF files**.

It uses:

- **Node.js + Puppeteer** (headless Chromium)
- **GitHub Actions** to run everything in the cloud
- PDFs are exported into an `output/` folder and uploaded as a build artifact named **`sc400-pdfs`**.

---

## How it works

1. `fetch.js` opens the SC-400 category page in a headless Chromium browser.
2. It scrapes all links that contain `/posts/` (the individual SC-400 article URLs).
3. For each post, Chromium:
   - loads the page with JavaScript enabled
   - waits until the network is idle
   - prints an **A4 PDF** with backgrounds and styling.
4. All generated PDFs are written into `output/`.
5. The GitHub Actions workflow (`.github/workflows/render.yml`) uploads `output/` as a downloadable ZIP artifact.

Because Puppeteer uses its **own bundled Chromium** (see `executablePath: await puppeteer.executablePath()` in `fetch.js`), there is **no need to install system Chromium packages**. This keeps the workflow stable across Ubuntu runner versions.

---

## Repository structure

```text
.
├─ fetch.js                     # Main Puppeteer script – scrapes SC-400 posts and renders PDFs
├─ package.json                 # Node.js configuration (Puppeteer dependency + start script)
└─ .github/
   └─ workflows/
      └─ render.yml             # GitHub Actions workflow to run the exporter and upload PDFs