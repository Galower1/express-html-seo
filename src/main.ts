import express, { Application } from "express";
import path from "path";
import * as dotenv from "dotenv";
import * as cheerio from "cheerio";
import { responseHandler } from "express-intercept";

dotenv.config();

const PORT = process.env.PORT || 4444;
const BUILD_PATH = process.env.BUILD_DIR || "build";

const app: Application = express();

app.use(
  responseHandler()
    .for((req) => !!req.url.match(/^\/post-details\/([^\/]+)(?!\/[^\/])$/i))
    .if((res) => /bytes/i.test(res.getHeader("Accept-Ranges") as string))
    .replaceString((html) => {
      const $ = cheerio.load(html);
      $("head").append(`
        <meta property="og:title" content="Your page title"/>
        <meta property="og:description" content="Your page description"/>
        <meta property="og:image" content="Your page image URL"/>
      `);
      return $.html();
    })
);

app.use(express.static(BUILD_PATH));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", BUILD_PATH, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
