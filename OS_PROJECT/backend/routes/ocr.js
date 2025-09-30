import express from "express";
import Jimp from "jimp";
import multer from "multer";
import path from "path";
import Tesseract from "tesseract.js";
import { fileURLToPath } from "url";
import OcrResult from "../models/OcrResult.js";

const router = express.Router();

// ✅ __dirname workaround (ESM me directly nahi milta)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), "uploads"));
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Preprocess image
async function preprocessImage(inputPath) {
    const image = await Jimp.read(inputPath);
    image
        .greyscale()
        .contrast(0.5)
        .normalize()
        .resize(1000, Jimp.AUTO)
        .write(inputPath);
}

// POST /api/ocr/upload
router.post("/upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const imagePath = req.file.path;

        await preprocessImage(imagePath);

        const { data } = await Tesseract.recognize(
            imagePath,
            "eng",
            { logger: m => console.log(m) }
        );

        const text = data.text.trim();
        const confidence = data?.confidence || 0;

        const saved = await OcrResult.create({
            filename: req.file.filename,
            text,
            confidence
        });

        return res.json({ success: true, result: saved });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error", details: err.message });
    }
});

// GET /api/ocr/results
router.get("/results", async (req, res) => {
    const results = await OcrResult.find().sort({ createdAt: -1 }).limit(50);
    res.json(results);
});

export default router;
