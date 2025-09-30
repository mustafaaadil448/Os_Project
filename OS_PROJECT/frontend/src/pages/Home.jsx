import { useState } from "react";
import UploadForm from "../components/UploadForm.jsx";
import "../index.css"; // animations & styles

const Home = () => {
  const [lastResult, setLastResult] = useState(null);

  return (
    <div className="home-container">
      <h1 className="title rainbow-text">✨ OCR Upload & Results ✨</h1>

      {/* Upload Form */}
      <div className="card fade-in">
        <UploadForm onUploaded={(res) => setLastResult(res)} />
      </div>

      {/* Show only last uploaded result */}
      {lastResult && (
        <div className="result-card fade-in-up">
          <h3 className="gradient-heading">✅ Last Uploaded Result:</h3>
          <p><strong>Filename:</strong> {lastResult.filename}</p>
          <p><strong>Text:</strong></p>
          <pre className="glow-text">{lastResult.text}</pre>
        </div>
      )}
    </div>
  );
};

export default Home;
