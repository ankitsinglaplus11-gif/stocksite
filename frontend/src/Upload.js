import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Upload({ fetchImages }) {

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [keywords, setKeywords] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] =
  useState(0);

  // 🧠 cleanup preview URL to avoid memory leak
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleUpload = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    if (!image || !title || !category || !keywords) {
      alert("All fields are required");
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("category", category);
    formData.append("keywords", keywords);
    formData.append("image", image);

    try {
      setLoading(true);
setUploadProgress(0);

      await axios.post(
  "http://localhost:5000/upload",
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`
    },

    onUploadProgress: (progressEvent) => {

      const percentCompleted =
        Math.round(
          (progressEvent.loaded * 100) /
          progressEvent.total
        );

      setUploadProgress(
        percentCompleted
      );

    }
  }
);
setUploadProgress(100);
      toast.success(
  "Image uploaded successfully!"
);

      fetchImages();

      // reset form safely
      setTitle("");
      setCategory("");
      setKeywords("");
      setImage(null);

      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(null);

    } catch (err) {
      console.error(err);

      toast.error(
  err?.response?.data ||
  "Upload failed"
);
    } finally {

  setLoading(false);

  setTimeout(() => {
    setUploadProgress(0);
  }, 1500);

}
  };

  const isDisabled =
    !title || !category || !keywords || !image || loading;

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "30px",
        background: "#fff",
      }}
    >

      <h2>Upload Image</h2>

      <form onSubmit={handleUpload}>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          type="text"
          placeholder="Keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
  type="file"
  accept=".jpg,.jpeg,.png,.webp"
  onChange={(e) => {

    const file = e.target.files[0];

    if (!file) return;

    setImage(file);

    const url =
      URL.createObjectURL(file);

    setPreview(url);

  }}
  style={{
    marginBottom: "10px"
  }}
/>

        {preview && (
          <div style={{ marginBottom: "20px" }}>
            <img
              src={preview}
              alt="Preview"
              width="300"
              style={{ borderRadius: "10px" }}
            />
          </div>
        )}
{loading && (

  <div
    style={{
      marginBottom: "20px",
    }}
  >

    <div
      style={{
        width: "100%",
        height: "20px",
        background: "#ddd",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >

      <div
        style={{
          width: `${uploadProgress}%`,
          height: "100%",
          background: "#4caf50",
          transition: "0.3s",
        }}
      />

    </div>

    <p
      style={{
        marginTop: "8px",
        fontWeight: "bold",
      }}
    >
      Uploading...
      {" "}
      {uploadProgress}%
    </p>

  </div>

)}
        <button
          type="submit"
          disabled={isDisabled}
          style={{
            padding: "10px 20px",
            background: isDisabled ? "gray" : "#111",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isDisabled ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

      </form>

    </div>
  );
}

export default Upload;