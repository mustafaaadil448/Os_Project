import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import { createWorker } from "tesseract.js";
import OcrResult from "./models/OcrResult.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));
app.use("/static", express.static(path.join(path.resolve(), "public")));

// ✅ Connect to MongoDB Atlas using .env
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch((err) => console.error("MongoDB error:", err));

// Multer storage
const upload = multer({ dest: "uploads/" });

// ✅ OCR Upload Route with preprocessing
app.post("/api/ocr/upload", upload.single("image"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = path.resolve(req.file.path);
    const processedPath = path.resolve(`uploads/processed-${req.file.filename}.png`);

    try {
        // 🟢 STEP 1: Preprocess image with sharp
        await sharp(filePath)
            .grayscale()         // Convert to grayscale
            .normalize()         // Improve contrast
            .threshold(150)      // Binarize (black & white)
            .resize(1500)        // Resize for better recognition
            .toFile(processedPath);

        // 🟢 STEP 2: OCR with multiple languages
        const worker = await createWorker("eng+hin+urd");
        const { data: { text, confidence } } = await worker.recognize(processedPath);
        await worker.terminate();

        // 🟢 STEP 3: Save result to DB
        const saved = await OcrResult.create({
            filename: req.file.originalname,
            text,
            confidence: confidence || 0,
        });

        // Cleanup
        fs.unlinkSync(filePath);
        fs.unlinkSync(processedPath);

        res.json({ result: saved });
    } catch (err) {
        console.error("OCR error:", err);
        res.status(500).json({ error: "OCR failed" });
    }
});

// ✅ Fetch last 20 OCR results
app.get("/api/ocr/results", async (req, res) => {
    try {
        const results = await OcrResult.find().sort({ createdAt: -1 }).limit(20);
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch results" });
    }
});

app.get("/", (req, res) => {
    res.send("OCR API is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
