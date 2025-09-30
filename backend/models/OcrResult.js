import mongoose from "mongoose";

const OcrResultSchema = new mongoose.Schema(
    {
        filename: { type: String, required: true },
        text: { type: String, required: true },
        confidence: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export default mongoose.model("OcrResult", OcrResultSchema);
