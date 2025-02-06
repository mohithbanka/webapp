import React, { useState } from "react";
import "./ImageSearch.css"; // Import CSS for styling

const ImageSearch = ({ onSearch }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile)); // Show preview of the image
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select an image!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    onSearch(formData);
  };

  return (
    <div className="image-search">
      <input type="file" accept="image/*" onChange={handleFileChange} className="file-input" />
      {preview && <img src={preview} alt="Preview" className="image-preview" />}
      <button onClick={handleUpload} className="search-btn">🔍 Search by Image</button>
    </div>
  );
};

export default ImageSearch;
