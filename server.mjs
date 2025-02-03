import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the "public" folder (using an absolute path)
app.use(express.static(path.join(__dirname, "public")));

// CORS Proxy endpoint
app.get("/frame", async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: "Missing 'url' query parameter" });
    }

    try {
        const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        
        const contentType = response.headers.get("content-type");
        res.set("Content-Type", contentType);
        response.body.pipe(res);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch resource", details: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});