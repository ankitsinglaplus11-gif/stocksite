import { useEffect, useState } from "react";
import axios from "axios";

function AdminPanel() {

  const [images, setImages] =
    useState([]);

  useEffect(() => {

    fetchImages();

  }, []);

  /* FETCH ALL IMAGES */

  const fetchImages =
    async () => {

      try {

        const token =
          localStorage.getItem("token");

        const res =
          await axios.get(
            "http://localhost:5000/admin/images",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        setImages(res.data);

      } catch (err) {

        console.error(err);

      }

    };

  /* APPROVE IMAGE */

  const approveImage =
    async (id) => {

      try {

        const token =
          localStorage.getItem("token");

        await axios.put(
          `http://localhost:5000/admin/approve/${id}`,
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

        fetchImages();

      } catch (err) {

        console.error(err);

      }

    };

  /* REJECT IMAGE */

  const rejectImage =
    async (id) => {

      try {

        const token =
          localStorage.getItem("token");

        await axios.put(
          `http://localhost:5000/admin/reject/${id}`,
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

        fetchImages();

      } catch (err) {

        console.error(err);

      }

    };

  /* DELETE IMAGE */

  const deleteImage =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Permanently delete this image?"
        );

      if (!confirmDelete) return;

      try {

        await axios.delete(
          `http://localhost:5000/images/${id}`
        );

        fetchImages();

      } catch (err) {

        console.error(err);

      }

    };

  return (

    <div
      style={{
        marginTop: "30px"
      }}
    >

      <h2>
        Admin Panel
      </h2>

      <p>
        Total Images: {images.length}
      </p>

      {images.map((image) => (

        <div
          key={image.id}
          style={{
            border: "1px solid #ddd",
            marginBottom: "15px",
            padding: "15px",
            borderRadius: "10px"
          }}
        >

          <img
            src={`http://localhost:5000/uploads/${image.filename}`}
            alt={image.title}
            style={{
              width: "200px",
              height: "150px",
              objectFit: "cover",
              borderRadius: "8px"
            }}
          />

          <h4>
            {image.title}
          </h4>

          <p>
            Category: {image.category}
          </p>

          <p>
            Keywords: {image.keywords}
          </p>

          <p>
            Status:
            {" "}
            <strong>
              {image.status}
            </strong>
          </p>

          <button
            onClick={() =>
              approveImage(image.id)
            }
            style={{
              background: "green",
              color: "white",
              border: "none",
              padding: "8px 12px",
              marginRight: "10px",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            ✅ Approve
          </button>

          <button
            onClick={() =>
              rejectImage(image.id)
            }
            style={{
              background: "red",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            ❌ Reject
          </button>

          <button
            onClick={() =>
              deleteImage(image.id)
            }
            style={{
              background: "#333",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              marginLeft: "10px"
            }}
          >
            🗑 Delete
          </button>

        </div>

      ))}

    </div>

  );

}

export default AdminPanel;