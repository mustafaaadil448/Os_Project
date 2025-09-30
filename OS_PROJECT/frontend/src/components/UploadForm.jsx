import axios from "axios";
import { useState } from "react";

export default function UploadForm({ onUploaded }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFile = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        } else setPreview(null);
    };

    const upload = async () => {
        if (!file) return alert("Select an image first");
        const form = new FormData();
        form.append("image", file);

        setLoading(true);
        setProgress(0);

        try {
            const res = await axios.post("http://localhost:5000/api/ocr/upload", form, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
            });
            onUploaded(res.data.result);
            setFile(null);
            setPreview(null);
            setProgress(0);
        } catch (err) {
            console.error("Upload/OCR error:", err);
            alert("Upload/OCR error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card fade-in">
            <h2 className="rainbow-text" style={{ marginBottom: "15px" }}>Upload & Recognize</h2>

            <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="fade-in-up"
                style={{
                    padding: "10px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.1)",
                    color: "#fff",
                    cursor: "pointer",
                    marginBottom: "15px"
                }}
            />

            {preview && (
                <div className="result-card fade-in-up" style={{ textAlign: "center" }}>
                    <strong className="gradient-heading">Preview:</strong>
                    <br />
                    <img
                        src={preview}
                        alt="preview"
                        style={{ maxWidth: "300px", maxHeight: "300px", borderRadius: "12px", marginTop: "10px", border: "1px solid rgba(255,255,255,0.2)" }}
                    />
                </div>
            )}

            {loading && (
                <div className="fade-in-up" style={{ marginTop: "15px" }}>
                    <div style={{ width: "100%", background: "rgba(255,255,255,0.2)", borderRadius: "12px" }}>
                        <div
                            style={{
                                width: `${progress}%`,
                                background: "linear-gradient(90deg, #ff512f, #2575fc, #00c9ff)",
                                height: "10px",
                                borderRadius: "12px",
                                transition: "width 0.3s ease",
                                
                            }}
                        ></div>
                    </div>
                    <div className="glow-text" style={{ marginTop: "5px" }}>{progress}%</div>
                </div>
            )}

            <button
                onClick={upload}
                disabled={loading}
                className="fade-in-up"
                style={{
                    marginTop: "20px",
                    marginLeft: "15px",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    border: "none",
                    cursor: "pointer",
                    background: "linear-gradient(90deg, #6a11cb, #2575fc)",
                    color: "#fff",
                    fontWeight: "bold",
                    boxShadow: "0 0 12px rgba(0,0,0,0.3)",
                    transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            >
                {loading ? "Processing..." : "Upload & Recognize"}
            </button>
        </div>
    );
}
