import { useEffect, useState } from "react";
import axios from "axios";
import Upload from "./Upload";
import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import Profile from "./components/Profile";
import MyUploads from "./components/MyUploads";
import AdminPanel from "./components/AdminPanel";
import MyFavorites from "./components/MyFavorites";
import MyDownloads from "./components/MyDownloads";
import {
  ToastContainer,
  toast
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

function App() {

  const token = localStorage.getItem("token");
  const [userRole, setUserRole] =
  useState("");
  useEffect(() => {

  const fetchProfile = async () => {

    try {

      const token =
        localStorage.getItem("token");

      if (!token) return;

      const res =
        await axios.get(
          "http://localhost:5000/profile",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      setUserRole(
        res.data.role
      );

    } catch (err) {

      console.error(err);

    }

  };

  fetchProfile();

}, []);

  const [images, setImages] = useState([]);
  const [leaderboard, setLeaderboard] =
  useState([]);
  const [totalLikes, setTotalLikes] =
  useState(0);

const [totalDownloads, setTotalDownloads] =
  useState(0);

const [totalViews, setTotalViews] =
  useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [selectedImage, setSelectedImage] =
    useState(null);
    const [selectedContributor, setSelectedContributor] =
  useState(null);
  const [viewContributorPage, setViewContributorPage] =
  useState(null);
    const [relatedImages, setRelatedImages] =
  useState([]);

  const [darkMode, setDarkMode] =
    useState(false);

  const [sortType, setSortType] =
    useState("newest");

  const [loading, setLoading] =
    useState(true);
    const [currentPage, setCurrentPage] =
  useState(1);
  const [totalPages, setTotalPages] =
  useState(1);
  const [dashboardStats, setDashboardStats] =
  useState({
    uploads: 0,
    downloads: 0,
    views: 0,
    likes: 0
  });
const [totalImages, setTotalImages] =
  useState(0);
const imagesPerPage = 12;

  useEffect(() => {
  fetchImages();
  axios
  .get(
    "http://localhost:5000/leaderboard"
  )
  .then((res) => {

    setLeaderboard(
      res.data
    );

  })
  .catch((err) => {

    console.error(err);

  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentPage]);
useEffect(() => {

  const fetchDashboardStats =
    async () => {

      try {

        const token =
          localStorage.getItem("token");

        const res =
          await axios.get(
            "http://localhost:5000/dashboard-stats",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        setDashboardStats(
          res.data
        );

      } catch (err) {

        console.error(err);

      }

    };

  if (token) {

    fetchDashboardStats();

  }

}, [token]);

  /* FETCH IMAGES */

  const fetchImages = async () => {

    try {

      setLoading(true);

      const res = await axios.get(
  "http://localhost:5000/images",
  {
    params: {
      page: currentPage,
      limit: imagesPerPage,
      t: Date.now()
    }
  }
);

console.log("API RESPONSE:", res.data);
console.log(
  "TOTAL IMAGES:",
  res.data.totalImages
);

setImages(res.data.images);

setTotalImages(
  res.data.totalImages
);

setTotalLikes(
  res.data.totalLikes
);

setTotalDownloads(
  res.data.totalDownloads
);

setTotalViews(
  res.data.totalViews
);

setTotalPages(
  Math.ceil(
    res.data.totalImages /
    imagesPerPage
  )
);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  };

  /* FETCH SINGLE IMAGE */

  const fetchSingleImage = async (id) => {

    try {

      await axios.put(
        `http://localhost:5000/images/${id}/view`
      );

      const res = await axios.get(
        `http://localhost:5000/images/${id}`
      );

      setSelectedImage(res.data);
      const related = images
  .filter(
    (img) =>
      img.id !== res.data.id &&
      img.category ===
        res.data.category
  )
  .slice(0, 4);

setRelatedImages(related);

      setImages((prevImages) =>
        prevImages.map((img) =>
          Number(img.id) === Number(id)
            ? {
                ...img,
                views: res.data.views,
              }
            : img
        )
      );

    } catch (err) {

      console.error(err);

    }

  };

  /* LIKE IMAGE */

  const likeImage = async (id) => {

    try {

      const res = await axios.put(
        `http://localhost:5000/images/${id}/like`
      );

      const updatedImage = res.data;

      setImages((prevImages) =>
        prevImages.map((img) =>
          Number(img.id) === Number(updatedImage.id)
            ? {
                ...img,
                likes: updatedImage.likes,
              }
            : img
        )
      );

      if (
        selectedImage &&
        Number(selectedImage.id) ===
          Number(updatedImage.id)
      ) {

        setSelectedImage((prev) => ({
          ...prev,
          likes: updatedImage.likes,
        }));

      }

    } catch (err) {

  console.error(err);

  toast.error(
    "Failed to like image"
  );

}

  };
const addFavorite = async (imageId) => {

  try {

    const token =
      localStorage.getItem("token");

    await axios.post(
      `http://localhost:5000/favorites/${imageId}`,
      {},
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

    toast.success(
  "Added to favorites ❤️"
);

  } catch (err) {

  console.error(err);

  toast.error(
    "Failed to add favorite"
  );

}

};
  /* DOWNLOAD IMAGE */

  const downloadImage = async (image) => {

  try {

    const token =
  localStorage.getItem("token");

await axios.put(
  `http://localhost:5000/images/${image.id}/download`,
  {},
  {
    headers: {
      Authorization:
        `Bearer ${token}`
    }
  }
);

    const imageUrl =
      `http://localhost:5000/uploads/${image.filename}`;

    const link = document.createElement("a");

    link.href = imageUrl;

    link.download = image.filename;

    document.body.appendChild(link);

    link.click();
    toast.success(
  "Download successful ⬇️"
);

    document.body.removeChild(link);
    

    /* UPDATE GRID */

    setImages((prevImages) =>
      prevImages.map((img) =>
        Number(img.id) === Number(image.id)
          ? {
              ...img,
              downloads:
                (img.downloads || 0) + 1,
            }
          : img
      )
    );

    /* UPDATE POPUP */

    if (
      selectedImage &&
      Number(selectedImage.id) ===
        Number(image.id)
    ) {

      setSelectedImage((prev) => ({
        ...prev,
        downloads:
          (prev.downloads || 0) + 1,
      }));

    }

  } catch (err) {

  console.error(err);

  toast.error(
    "Download failed"
  );

}

};
/* SHARE IMAGE */

const shareImage = (image) => {

  if (!image) {
    alert("No image selected");
    return;
  }

  const imageUrl =
    `http://localhost:5000/uploads/${image.filename}`;

  navigator.clipboard.writeText(imageUrl);

  toast.success(
  "Image link copied 📤"
);

};
  /* FILTER + SORT */

  let filteredImages = images.filter((image) => {

    const title =
      (image.title || "").toLowerCase();

    const category =
      (image.category || "").toLowerCase();

    const keywords =
      (image.keywords || "").toLowerCase();

    const searchText =
      search.toLowerCase();

    const matchesSearch =
      title.includes(searchText) ||
      category.includes(searchText) ||
      keywords.includes(searchText);

    const matchesCategory =
      selectedCategory === "All" ||
      image.category === selectedCategory;

    return matchesSearch && matchesCategory;

  });

  if (sortType === "likes") {

    filteredImages.sort(
      (a, b) =>
        (b.likes || 0) -
        (a.likes || 0)
    );

  }

  if (sortType === "downloads") {

    filteredImages.sort(
      (a, b) =>
        (b.downloads || 0) -
        (a.downloads || 0)
    );

  }
  if (sortType === "views") {

  filteredImages.sort(
    (a, b) =>
      (b.views || 0) -
      (a.views || 0)
  );

}

  if (sortType === "newest") {

    filteredImages.sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    );

  }
  if (sortType === "oldest") {

  filteredImages.sort(
    (a, b) =>
      new Date(a.created_at) -
      new Date(b.created_at)
  );

}
  /* PAGINATION */



/* STATISTICS DASHBOARD */



/* FEATURED IMAGES */

const featuredImages = [...images]
  .sort(
    (a, b) =>
      (b.downloads || 0) -
      (a.downloads || 0)
  )
  .slice(0, 4);
  /* TRENDING IMAGES */

const trendingImages = [...images]
  .sort(
    (a, b) =>
      ((b.likes || 0) + (b.views || 0)) -
      ((a.likes || 0) + (a.views || 0))
  )
  .slice(0, 4);
  const topImage = [...images]
  .sort(
    (a, b) =>
      ((b.likes || 0) +
       (b.views || 0) +
       (b.downloads || 0))
      -
      ((a.likes || 0) +
       (a.views || 0) +
       (a.downloads || 0))
  )[0];
  const topFiveImages = [...images]
  .sort(
    (a, b) =>
      ((b.likes || 0) +
       (b.views || 0) +
       (b.downloads || 0))
      -
      ((a.likes || 0) +
       (a.views || 0) +
       (a.downloads || 0))
  )
  .slice(0, 5);
  const contributorPageImages =
  images.filter(
    (img) =>
      img.username ===
      viewContributorPage
  );
  const contributorPageLikes =
  contributorPageImages.reduce(
    (sum, img) =>
      sum + (img.likes || 0),
    0
  );

const contributorPageViews =
  contributorPageImages.reduce(
    (sum, img) =>
      sum + (img.views || 0),
    0
  );

const contributorPageDownloads =
  contributorPageImages.reduce(
    (sum, img) =>
      sum + (img.downloads || 0),
    0
  );
  let contributorBadge =
  "⭐ New Contributor";

const contributorScore =
  contributorPageLikes +
  contributorPageViews +
  contributorPageDownloads;

if (contributorScore > 1000) {
  contributorBadge =
    "🥇 Gold Contributor";
}
else if (contributorScore > 500) {
  contributorBadge =
    "🥈 Silver Contributor";
}
else if (contributorScore > 100) {
  contributorBadge =
    "🥉 Bronze Contributor";
}
  
  const contributorLeaderboard =
  Object.values(

    images.reduce((acc, image) => {

      const username =
        image.username || "Unknown";

      if (!acc[username]) {

        acc[username] = {
          username,
          uploads: 0,
          likes: 0,
          views: 0,
          downloads: 0,
        };

      }

      acc[username].uploads++;

      acc[username].likes +=
        image.likes || 0;

      acc[username].views +=
        image.views || 0;

      acc[username].downloads +=
        image.downloads || 0;

      return acc;

    }, {})

  ).sort(

    (a, b) =>
      (
        b.likes +
        b.views +
        b.downloads
      )
      -
      (
        a.likes +
        a.views +
        a.downloads
      )

  ).slice(0, 10);
  const contributorImages = images.filter(
  (img) =>
    img.username ===
    selectedContributor
);
const contributorLikes =
  contributorImages.reduce(
    (sum, img) =>
      sum + (img.likes || 0),
    0
  );

const contributorViews =
  contributorImages.reduce(
    (sum, img) =>
      sum + (img.views || 0),
    0
  );

const contributorDownloads =
  contributorImages.reduce(
    (sum, img) =>
      sum + (img.downloads || 0),
    0
  );

const contributorBestImage =
  contributorImages.sort(
    (a, b) =>
      ((b.likes || 0) +
       (b.views || 0) +
       (b.downloads || 0))
      -
      ((a.likes || 0) +
       (a.views || 0) +
       (a.downloads || 0))
  )[0];
  const averageLikes =
  images.length > 0
    ? Math.round(
        images.reduce(
          (sum, img) =>
            sum + (img.likes || 0),
          0
        ) / images.length
      )
    : 0;
    const totalUserViews =
  images.reduce(
    (sum, img) =>
      sum + (img.views || 0),
    0
  );
  const totalUserDownloads =
  images.reduce(
    (sum, img) =>
      sum + (img.downloads || 0),
    0
  );

  /* POPUP NAVIGATION */

  const goToNextImage = () => {

    const currentIndex =
      filteredImages.findIndex(
        (img) =>
          img.id === selectedImage.id
      );

    const nextIndex =
      (currentIndex + 1) %
      filteredImages.length;

    fetchSingleImage(
      filteredImages[nextIndex].id
    );

  };

  const goToPreviousImage = () => {

    const currentIndex =
      filteredImages.findIndex(
        (img) =>
          img.id === selectedImage.id
      );

    const previousIndex =
      (currentIndex - 1 +
        filteredImages.length) %
      filteredImages.length;

    fetchSingleImage(
      filteredImages[previousIndex].id
    );

  };

  /* KEYBOARD SHORTCUTS */

  useEffect(() => {

    const handleKeyDown = (e) => {

      if (e.key === "Escape") {

        setSelectedImage(null);

      }

      if (
        e.key === "ArrowRight" &&
        selectedImage
      ) {

        goToNextImage();

      }

      if (
        e.key === "ArrowLeft" &&
        selectedImage
      ) {

        goToPreviousImage();

      }

    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage, filteredImages]);

  return (

    <div
      style={{
        padding: "20px",
        background: darkMode
          ? "#121212"
          : "#f5f5f5",
        minHeight: "100vh",
        color: darkMode
          ? "white"
          : "black",
      }}
    >

      <Navbar />

      {/* DARK MODE */}

      <button
        onClick={() =>
          setDarkMode(!darkMode)
        }
        style={{
          padding: "10px 20px",
          background: darkMode
            ? "white"
            : "black",
          color: darkMode
            ? "black"
            : "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "20px",
          fontWeight: "bold",
        }}
      >
        {darkMode
          ? "☀ Light Mode"
          : "🌙 Dark Mode"}
      </button>
      

      {/* HEADER */}

      <div
        style={{
          background:
            "linear-gradient(135deg, #111, #333)",
          color: "white",
          padding: "25px",
          marginBottom: "20px",
          borderRadius: "15px",
        }}
      >

        <h1>Stock Photo Website</h1>

        <p>
  📸 Total Images:
  {" "}
  {totalImages}
</p>

      </div>
{/* STATISTICS DASHBOARD */}

<h2
  style={{
    marginBottom: "15px",
  }}
>
  📊 My Statistics
</h2>

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "15px",
    marginBottom: "30px",
  }}
>

  <div
    style={{
      background: "#673ab7",
      color: "white",
      padding: "20px",
      borderRadius: "15px",
      textAlign: "center",
    }}
  >
    <h2>{dashboardStats.uploads}</h2>
    <p>My Uploads</p>
  </div>

  <div
    style={{
      background: "#009688",
      color: "white",
      padding: "20px",
      borderRadius: "15px",
      textAlign: "center",
    }}
  >
    <h2>{dashboardStats.downloads}</h2>
    <p>My Downloads</p>
  </div>

  <div
    style={{
      background: "#ff5722",
      color: "white",
      padding: "20px",
      borderRadius: "15px",
      textAlign: "center",
    }}
  >
    <h2>{dashboardStats.views}</h2>
    <p>My Views</p>
  </div>

  <div
    style={{
      background: "#e91e63",
      color: "white",
      padding: "20px",
      borderRadius: "15px",
      textAlign: "center",
    }}
  >
    <h2>{dashboardStats.likes}</h2>
    <p>My Likes</p>
  </div>

</div>

<h2
  style={{
    marginTop: "20px",
    marginBottom: "15px",
  }}
>
  🌍 Site Statistics
</h2>

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "15px",
    marginBottom: "25px",
  }}
>

  <div
    style={{
      background: "#2196f3",
      color: "white",
      padding: "20px",
      borderRadius: "15px",
      textAlign: "center",
    }}
  >
    <h2>{totalImages}</h2>
    <p>Total Images</p>
  </div>

  <div
    style={{
      background: "#e91e63",
      color: "white",
      padding: "20px",
      borderRadius: "15px",
      textAlign: "center",
    }}
  >
    <h2>{totalLikes}</h2>
    <p>Total Likes</p>
  </div>

  <div
    style={{
      background: "#4caf50",
      color: "white",
      padding: "20px",
      borderRadius: "15px",
      textAlign: "center",
    }}
  >
    <h2>{totalDownloads}</h2>
    <p>Total Downloads</p>
  </div>

  <div
    style={{
      background: "#ff9800",
      color: "white",
      padding: "20px",
      borderRadius: "15px",
      textAlign: "center",
    }}
  >
    <h2>{totalViews}</h2>
    <p>Total Views</p>
  </div>

</div>
{/* TOP PERFORMING IMAGE */}

{topImage && (

  <div
    style={{
      background: darkMode
        ? "#1e1e1e"
        : "white",
      padding: "20px",
      borderRadius: "15px",
      marginBottom: "30px",
      boxShadow:
        "0 4px 12px rgba(0,0,0,0.15)",
    }}
  >

    <h2>
      🏆 Top Performing Image
    </h2>

    <img
      src={`http://localhost:5000/uploads/${topImage.filename}`}
      alt={topImage.title}
      onClick={() =>
  fetchSingleImage(topImage.id)
}
      style={{
        width: "250px",
        maxWidth: "100%",
        borderRadius: "10px",
        marginBottom: "15px",
        cursor: "pointer",
      }}

      
      
    />

    <h3>
      {topImage.title}
    </h3>

    <p>
      ❤️ {topImage.likes || 0}
      {" "}
      | 👁 {topImage.views || 0}
      {" "}
      | ⬇ {topImage.downloads || 0}
    </p>

  </div>
  

)}
<h2
  style={{
    marginBottom: "15px",
  }}
>
  🏅 Top 5 Images
</h2>

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "15px",
    marginBottom: "30px",
  }}
>

  {topFiveImages.map(
    (image, index) => (

     <div
  key={image.id}
  onClick={() =>
    fetchSingleImage(image.id)
  }
  style={{
    display: "flex",
    gap: "15px",
    padding: "15px",
    borderRadius: "12px",
    cursor: "pointer",
    background: darkMode
      ? "#1e1e1e"
      : "white",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.15)",
  }}
>

  <img
    src={`http://localhost:5000/uploads/${image.filename}`}
    alt={image.title}
    onClick={() =>
      fetchSingleImage(image.id)
    }
    style={{
      width: "80px",
      height: "80px",
      objectFit: "cover",
      borderRadius: "10px",
      cursor: "pointer",
    }}
  />

  <div
  style={{
    flex: 1,
  }}
>

    <h3
      style={{
        margin: "0 0 8px 0",
      }}
    >
      {
  index === 0
    ? "🥇 Rank #1"
    : index === 1
    ? "🥈 Rank #2"
    : index === 2
    ? "🥉 Rank #3"
    : `🏅 Rank #${index + 1}`
}
    </h3>

    <strong>
      {image.title}
    </strong>
    <p>
  Uploaded By:
  {" "}
  <span
    onClick={() =>
  setSelectedContributor(
    image.username
  )
}
    style={{
      color: "#2196f3",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    {image.username}
  </span>
</p>

    <div
  style={{
    display: "flex",
    gap: "20px",
    marginTop: "8px",
  }}
>
  <span>
    ❤️ {image.likes || 0}
  </span>

  <span>
    👁 {image.views || 0}
  </span>

  <span>
    ⬇ {image.downloads || 0}
  </span>
</div>

  </div>



      </div>

    )
  )}

</div>

<div
  style={{
    background: darkMode
      ? "#1e1e1e"
      : "white",
    padding: "20px",
    borderRadius: "15px",
    marginBottom: "30px",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.15)",
  }}
>

  <h2>
    📈 Contributor Analytics
  </h2>

  <div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: "15px",
    marginTop: "15px",
  }}
>

  <div
    style={{
      background: "#673ab7",
      color: "white",
      padding: "15px",
      borderRadius: "12px",
      textAlign: "center",
    }}
  >
    <h2>{dashboardStats.uploads}</h2>
    <p>📸 Uploads</p>
  </div>

  <div
    style={{
      background: "#e91e63",
      color: "white",
      padding: "15px",
      borderRadius: "12px",
      textAlign: "center",
    }}
  >
    <h2>{averageLikes}</h2>
    <p>❤️ Avg Likes</p>
  </div>

  <div
    style={{
      background: "#ff9800",
      color: "white",
      padding: "15px",
      borderRadius: "12px",
      textAlign: "center",
    }}
  >
    <h2>{totalUserViews}</h2>
    <p>👁 Views</p>
  </div>

  <div
    style={{
      background: "#4caf50",
      color: "white",
      padding: "15px",
      borderRadius: "12px",
      textAlign: "center",
    }}
  >
    <h2>{totalUserDownloads}</h2>
    <p>⬇ Downloads</p>
  </div>

</div>

<div
  style={{
    marginTop: "20px",
    padding: "15px",
    background: darkMode
      ? "#2a2a2a"
      : "#f5f5f5",
    borderRadius: "12px",
  }}
>
  <strong>
    🏆 Best Image:
  </strong>
  {" "}
  {topImage
    ? topImage.title
    : "No Images"}
</div>

</div>
<h2
  style={{
    marginBottom: "15px",
  }}
>
  🏆 Top Contributors
</h2>

<div
  style={{
    background: darkMode
      ? "#1e1e1e"
      : "white",
    padding: "20px",
    borderRadius: "15px",
    marginBottom: "30px",
  }}
>

  {leaderboard.map((user, index) => (

    <div
      key={index}
      style={{
        padding: "10px 0",
      }}
    >

      <strong>
        {user.name}
      </strong>

      <p>
        📸 {user.uploads}
        {" | "}
        ❤️ {user.likes}
        {" | "}
        👁 {user.views}
        {" | "}
        ⬇ {user.downloads}
      </p>

    </div>

  ))}

</div>
<h2
  style={{
    marginBottom: "15px",
  }}
>
  🏆 Contributor Leaderboard
</h2>

<div
  style={{
    background: darkMode
      ? "#1e1e1e"
      : "white",
    padding: "20px",
    borderRadius: "15px",
    marginBottom: "30px",
  }}
>

  {contributorLeaderboard.map(
    (user, index) => (

      <div
        key={user.username}
        style={{
          padding: "10px 0",
          borderBottom:
            index !==
            contributorLeaderboard.length - 1
              ? "1px solid #444"
              : "none",
        }}
      >

        <strong
  onClick={() =>
    setViewContributorPage(
      user.username
    )
  }
  style={{
    cursor: "pointer",
    color: "#2196f3",
  }}
>
  #{index + 1}
  {" "}
  {user.username}
</strong>

        <p>
          📸 {user.uploads}
          {" "}
          | ❤️ {user.likes}
          {" "}
          | 👁 {user.views}
          {" "}
          | ⬇ {user.downloads}
        </p>

      </div>

    )
  )}

</div>
{viewContributorPage && (

  <div
    style={{
      background: darkMode
        ? "#1e1e1e"
        : "white",
      padding: "25px",
      borderRadius: "15px",
      marginBottom: "30px",
    }}
  >

    <button
      onClick={() =>
        setViewContributorPage(null)
      }
      style={{
        marginBottom: "15px",
      }}
    >
      ⬅ Back
    </button>

    <h2>
      👤 {viewContributorPage}
    </h2>
    <div
  style={{
    marginBottom: "20px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#ff9800",
  }}
>
  {contributorBadge}
</div>

    <div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: "15px",
    marginBottom: "25px",
  }}
>

  <div>
    📸 Uploads:
    {" "}
    {contributorPageImages.length}
  </div>

  <div>
    ❤️ Likes:
    {" "}
    {contributorPageLikes}
  </div>

  <div>
    👁 Views:
    {" "}
    {contributorPageViews}
  </div>

  <div>
    ⬇ Downloads:
    {" "}
    {contributorPageDownloads}
  </div>

</div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
        gap: "15px",
      }}
    >

      {contributorPageImages.map(
        (image) => (

          <div
            key={image.id}
            onClick={() =>
              fetchSingleImage(
                image.id
              )
            }
            style={{
              cursor: "pointer",
            }}
          >

            <img
              src={`http://localhost:5000/uploads/${image.filename}`}
              alt={image.title}
              style={{
                width: "100%",
                height: "180px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />

            <p>
              {image.title}
            </p>

          </div>

        )
      )}

    </div>

  </div>

)}
{/* FEATURED IMAGES */}

<h2
  style={{
    marginBottom: "15px",
  }}
>
  ⭐ Featured Images
</h2>

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "15px",
    marginBottom: "30px",
  }}
>
  {featuredImages.map((image) => (

    <div
      key={image.id}
      onClick={() =>
        fetchSingleImage(image.id)
      }
      style={{
        cursor: "pointer",
        borderRadius: "15px",
        overflow: "hidden",
        background: darkMode
          ? "#1e1e1e"
          : "white",
        boxShadow:
          "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >

      <img
        src={`http://localhost:5000/uploads/${image.filename}`}
        alt={image.title}
        style={{
          width: "100%",
          height: "180px",
          objectFit: "cover",
        }}
      />

      <div
        style={{
          padding: "10px",
        }}
      >

        <strong>
          {image.title}
        </strong>

        <p>
          ⬇ {image.downloads || 0}
        </p>

      </div>

    </div>

  ))}
</div>
{/* TRENDING IMAGES */}

<h2
  style={{
    marginBottom: "15px",
    marginTop: "30px",
  }}
>
  🔥 Trending Images
</h2>

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "15px",
    marginBottom: "30px",
  }}
>
  {trendingImages.map((image) => (

    <div
      key={image.id}
      onClick={() =>
        fetchSingleImage(image.id)
      }
      style={{
        cursor: "pointer",
        borderRadius: "15px",
        overflow: "hidden",
        background: darkMode
          ? "#1e1e1e"
          : "white",
        boxShadow:
          "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >

      <img
        src={`http://localhost:5000/uploads/${image.filename}`}
        alt={image.title}
        style={{
          width: "100%",
          height: "180px",
          objectFit: "cover",
        }}
      />

      <div
        style={{
          padding: "10px",
        }}
      >

        <strong>
          {image.title}
        </strong>

        <p>
          ❤️ {image.likes || 0}
          {" "}
          | 👁 {image.views || 0}
        </p>

      </div>

    </div>

  ))}
</div>
      {/* LOGIN */}

      {token ? (
  <>
    <Profile />

<MyFavorites />

<MyDownloads />

<MyUploads />

{userRole === "admin" && (
  <AdminPanel />
)}

<Upload fetchImages={fetchImages} />
  </>
) : (
        <>
          <Login />
          <Register />
        </>
      )}

      {/* SEARCH */}

      <input
        type="text"
        placeholder="Search images..."
        value={search}
        onChange={(e) => {
  setSearch(e.target.value);
  setCurrentPage(1);
}}
        style={{
          width: "100%",
          padding: "14px",
          marginBottom: "20px",
          borderRadius: "12px",
          border: "1px solid #ccc",
        }}
      />

      {/* SORT */}

      <select
        value={sortType}
        onChange={(e) => {
  setSortType(e.target.value);
  setCurrentPage(1);
}}
        style={{
          padding: "10px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <option value="newest">
          Newest First
        </option>
        <option value="oldest">
  Oldest First
</option>

        <option value="likes">
          Most Liked
        </option>

        <option value="downloads">
          Most Downloaded
        </option>
        <option value="views">
  Most Viewed
</option>



      </select>

      {/* CATEGORY */}

      <div
        style={{
          marginBottom: "25px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >

        {[
          "All",
          "nature",
          "travel",
          "animals",
        ].map((cat) => (

          <button
            key={cat}
            onClick={() => {
  setSelectedCategory(cat);
  setCurrentPage(1);
}}
            style={{
              padding: "10px 18px",
              borderRadius: "30px",
              border: "none",
              cursor: "pointer",
              background:
                selectedCategory === cat
                  ? "#2196f3"
                  : "#ddd",
              color:
                selectedCategory === cat
                  ? "white"
                  : "black",
            }}
          >
            {cat}
          </button>

        ))}

      </div>

      {/* LOADING */}

      {loading && (

        <h2>
          Loading images...
        </h2>

      )}

      {/* EMPTY */}

      {!loading &&
        filteredImages.length === 0 && (

        <h2>
          No images found.
        </h2>

      )}

      {/* GRID */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "25px",
        }}
      >

        {filteredImages.map((image) => (

          <div
            key={image.id}
            onMouseEnter={(e) => {
    e.currentTarget.style.transform =
      "translateY(-5px)";
    e.currentTarget.style.boxShadow =
      "0 12px 25px rgba(0,0,0,0.18)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform =
      "translateY(0)";
    e.currentTarget.style.boxShadow =
      "0 6px 18px rgba(0,0,0,0.1)";
  }}
            style={{
              borderRadius: "18px",
              overflow: "hidden",
              background: darkMode
                ? "#1e1e1e"
                : "white",
              boxShadow:
                "0 6px 18px rgba(0,0,0,0.1)",
              transition: "0.3s",
            }}
          >

            <img
  src={`http://localhost:5000/uploads/${image.filename}`}
  alt={image.title}
  width="100%"
  onClick={() =>
    fetchSingleImage(image.id)
  }
  onMouseEnter={(e) => {
    e.currentTarget.style.transform =
      "scale(1.08)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform =
      "scale(1)";
  }}
  style={{
    height: "250px",
    objectFit: "cover",
    cursor: "pointer",
    transition: "0.4s",
  }}
/>

            <div
              style={{
                padding: "15px",
              }}
            >

              <h3>
                {image.title}
              </h3>

              <p>
                📂 {image.category}
              </p>

              <p>
                🏷 {image.keywords}
              </p>

              <p>
                ❤️ {image.likes || 0}
                {" "}
                | 👁 {image.views || 0}
              </p>

              <p>
                ⬇ {image.downloads || 0}
              </p>

              <p>
                📅
                {" "}
                {new Date(
                  image.created_at
                ).toLocaleDateString()}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >

                <button
                  onClick={() =>
                    likeImage(image.id)
                  }
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "hotpink",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                  }}
                >
                  ❤️ Like
                </button>
                <button
  onClick={() =>
    addFavorite(image.id)
  }
  style={{
    flex: 1,
    padding: "10px",
    background: "#ff5722",
    color: "white",
    border: "none",
    borderRadius: "8px",
  }}
>
  ⭐ Favorite
</button>

                <button
                  onClick={() =>
                    downloadImage(image)
                  }
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#2196f3",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                  }}
                >
                  ⬇ Download
                </button>
                <button
  onClick={() =>
    shareImage(image)
  }
  style={{
    padding: "10px 15px",
    background: "#9c27b0",
    color: "white",
    border: "none",
    borderRadius: "8px",
  }}
>
  📤 Share
</button>

              </div>

            </div>

          </div>

        ))}

      </div>
      <div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "30px",
    flexWrap: "wrap",
  }}
>

  <button
  disabled={currentPage === 1}
  onClick={() =>
    setCurrentPage(1)
  }
>
  ⏮ First
</button>

<button
  disabled={currentPage === 1}
  onClick={() =>
    setCurrentPage(currentPage - 1)
  }
>
  ◀ Prev
</button>

{[...Array(totalPages)].map((_, index) => (

  <button
    key={index}
    onClick={() =>
      setCurrentPage(index + 1)
    }
    style={{
      fontWeight:
        currentPage === index + 1
          ? "bold"
          : "normal",
      background:
        currentPage === index + 1
          ? "#2196f3"
          : "",
      color:
        currentPage === index + 1
          ? "white"
          : "",
      borderRadius: "5px",
      margin: "0 3px",
    }}
  >
    {index + 1}
  </button>

))}

<button
  disabled={
    currentPage === totalPages
  }
  onClick={() =>
    setCurrentPage(currentPage + 1)
  }
>
  Next ▶
</button>

<button
  disabled={
    currentPage === totalPages
  }
  onClick={() =>
    setCurrentPage(totalPages)
  }
>
  Last ⏭
</button>
<p
  style={{
    marginTop: "15px",
    textAlign: "center",
    fontWeight: "bold",
  }}
>
  Page {currentPage} of {totalPages}
  
</p>
<p
  style={{
    textAlign: "center",
  }}
>
  Total Images: {totalImages}
</p>
</div>

      {/* POPUP VIEWER */}

      {selectedImage && (

        <div
          onClick={() =>
            setSelectedImage(null)
          }
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "rgba(0,0,0,0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >

          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              background: darkMode
                ? "#1e1e1e"
                : "white",
              color: darkMode
                ? "white"
                : "black",
              padding: "25px",
              borderRadius: "20px",
              maxWidth: "1000px",
              width: "100%",
              maxHeight: "95vh",
              overflowY: "auto",
            }}
          >

            <img
              src={`http://localhost:5000/uploads/${selectedImage.filename}`}
              alt={selectedImage.title}
              width="100%"
              style={{
                borderRadius: "15px",
                maxHeight: "650px",
                objectFit: "contain",
              }}
            />

            <h2
              style={{
                marginTop: "20px",
              }}
            >
              {selectedImage.title}
            </h2>

            <p>
              📂 {selectedImage.category}
            </p>

            <p>
              🏷 {selectedImage.keywords}
            </p>

            <p>
              ❤️ {selectedImage.likes || 0}
            </p>

            <p>
              👁 {selectedImage.views || 0}
            </p>

            <p>
              ⬇ {selectedImage.downloads || 0}
            </p>

            <p>
              📅
              {" "}
              {new Date(
                selectedImage.created_at
              ).toLocaleDateString()}
            </p>
            <h3
  style={{
    marginTop: "20px",
  }}
>
  🔗 Related Images
</h3>

<div
  style={{
    display: "flex",
    gap: "10px",
    overflowX: "auto",
  }}
>

  {relatedImages.map((image) => (

    <img
      key={image.id}
      src={`http://localhost:5000/uploads/${image.filename}`}
      alt={image.title}
      onClick={() =>
        fetchSingleImage(image.id)
      }
      style={{
        width: "120px",
        height: "80px",
        objectFit: "cover",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    />

  ))}

</div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "20px",
              }}
            >

              <button
                onClick={goToPreviousImage}
                style={{
                  padding: "10px 15px",
                }}
              >
                ⬅ Previous
              </button>

              <button
                onClick={goToNextImage}
                style={{
                  padding: "10px 15px",
                }}
              >
                Next ➡
              </button>

              <button
                onClick={() =>
                  likeImage(
                    selectedImage.id
                  )
                }
                style={{
                  padding: "10px 15px",
                  background: "hotpink",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                ❤️ Like
              </button>
              <button
  onClick={() =>
    addFavorite(
      selectedImage.id
    )
  }
  style={{
    padding: "10px 15px",
    background: "#ff5722",
    color: "white",
    border: "none",
    borderRadius: "8px",
  }}
>
  ⭐ Favorite
</button>

              <button
                onClick={() =>
                  downloadImage(
                    selectedImage
                  )
                }
                style={{
                  padding: "10px 15px",
                  background: "#2196f3",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                ⬇ Download
              </button>
<button
  onClick={() =>
    shareImage(selectedImage)
  }
  style={{
    padding: "10px 15px",
    background: "#9c27b0",
    color: "white",
    border: "none",
    borderRadius: "8px",
  }}
>
  📤 Share
</button>
              <button
                onClick={() =>
                  setSelectedImage(null)
                }
                style={{
                  padding: "10px 15px",
                }}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}
      {selectedContributor && (

  <div
    onClick={() =>
      setSelectedContributor(null)
    }
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background:
        "rgba(0,0,0,0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10000,
    }}
  >

    <div
      onClick={(e) =>
        e.stopPropagation()
      }
      style={{
        background: darkMode
          ? "#1e1e1e"
          : "white",
        padding: "25px",
        borderRadius: "15px",
        width: "500px",
        maxWidth: "90%",
      }}
    >

      <h2>
        👤 {selectedContributor}
      </h2>
      <p>
  📸 Uploads:
  {" "}
  {contributorImages.length}
</p>

<p>
  ❤️ Total Likes:
  {" "}
  {contributorLikes}
</p>

<p>
  👁 Total Views:
  {" "}
  {contributorViews}
</p>

<p>
  ⬇ Total Downloads:
  {" "}
  {contributorDownloads}
</p>

<p>
  🏆 Best Image:
  {" "}
  {contributorBestImage
    ? contributorBestImage.title
    : "No Images"}
</p>

      <p>
  Total Uploads:
  {" "}
  {contributorImages.length}
</p>

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(120px,1fr))",
    gap: "10px",
    marginTop: "15px",
  }}
>

  {contributorImages.map((image) => (

    <img
      key={image.id}
      src={`http://localhost:5000/uploads/${image.filename}`}
      alt={image.title}
      onClick={() => {
        setSelectedContributor(null);
        fetchSingleImage(image.id);
      }}
      style={{
        width: "100%",
        height: "100px",
        objectFit: "cover",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    />

  ))}

</div>

      <button
        onClick={() =>
          setSelectedContributor(null)
        }
      >
        Close
      </button>

    </div>

  </div>

)}
<ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop={true}
  closeOnClick={true}
  pauseOnHover={true}
  draggable={true}
  theme="light"
/>
      {/* FOOTER */}

      <div
        style={{
          marginTop: "50px",
          textAlign: "center",
          opacity: 0.7,
        }}
      >

        <p>
          © 2026 Stock Photo Website
        </p>

      </div>

    </div>

  );

}

export default App;