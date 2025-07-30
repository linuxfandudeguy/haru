import express from "express";
import cors from "cors";
import { URL } from "url";
import http from "http";
import https from "https";

const app = express();

app.use(cors());

app.get("/frame", (req, res) => {
  const urlStr = req.query.url;
  if (!urlStr) return res.status(400).json({ error: "Missing 'url' query parameter" });

  let url;
  try {
    url = new URL(urlStr);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const lib = url.protocol === "https:" ? https : http;

  const options = {
    headers: { "User-Agent": "Mozilla/5.0" }
  };

  lib.get(url, options, (proxyRes) => {
    res.setHeader("Content-Type", proxyRes.headers["content-type"] || "application/octet-stream");
    proxyRes.pipe(res);
  }).on("error", (err) => {
    res.status(500).json({ error: "Failed to fetch resource", details: err.message });
  });
});

export const handler = serverless(app);
