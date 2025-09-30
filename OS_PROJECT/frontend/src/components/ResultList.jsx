import axios from "axios";
import { useEffect, useState } from "react";

export default function ResultList() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchResults = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API || "";
            const res = await axios.get(apiUrl + "/api/ocr/results");
            setResults(res.data);
        } catch (err) {
            console.error("Error fetching OCR results:", err);
            alert("Failed to load OCR results");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    if (loading) return <div>Loading OCR results...</div>;
    if (!results.length) return <div>No OCR results found</div>;

    return (
        <div>
            {results.map((r) => (
                <div key={r._id} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px", borderRadius: "8px" }}>
                    <strong>Filename:</strong> {r.filename} <br />
                    <strong>Text:</strong> <pre style={{ whiteSpace: "pre-wrap" }}>{r.text}</pre>
                    <strong>Uploaded At:</strong> {new Date(r.createdAt).toLocaleString()}
                </div>
            ))}
        </div>
    );
}
