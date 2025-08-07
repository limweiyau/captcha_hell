import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
const PORT = 3000;

// Replace this with YOUR ACTUAL Gemini AI Studio API Key
const GEMINI_KEY = "AIzaSyBkjaCtmO_4oPUxvSECDJ4swIka3_s3aDE"; // use the one you already have

app.use(express.json());

app.post("/gemini", async (req, res) => {
  try {
    const geminiRes = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_KEY
        },
        body: JSON.stringify(req.body)
    }
    );

    const raw = await geminiRes.text();

    console.log("Gemini raw response:", raw);

    try {
    const data = JSON.parse(raw);
    res.status(geminiRes.status).json(data);
    } catch (e) {
    console.error("Failed to parse JSON:", raw);
    res.status(500).json({ error: "Invalid response from Gemini API" });
    }

  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running at http://localhost:${PORT}`);
});
