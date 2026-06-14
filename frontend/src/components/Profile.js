import { useEffect, useState } from "react";
import axios from "axios";

function Profile() {

  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {

    const fetchProfile = async () => {

      try {

        const token =
          localStorage.getItem("token");

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

        setProfile(res.data);

        if (res.data.role === "admin") {
          setIsAdmin(true);
        }

      } catch (err) {

        console.error(err);

      }

    };

    const fetchStats = async () => {

      try {

        const token =
          localStorage.getItem("token");

        const res =
          await axios.get(
            "http://localhost:5000/profile/stats",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );


        setStats(res.data);

      } catch (err) {

        console.error(err);

      }

    };
    

    fetchProfile();
    fetchStats();

  }, []);
  const addCredits = async (credits) => {

  try {

    const token =
      localStorage.getItem("token");

    await axios.put(
      "http://localhost:5000/credits/add",
      {
        credits
      },
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

    alert(
      `${credits} credits added successfully`
    );

    window.location.reload();

  } catch (err) {

    console.error(err);

    alert("Failed to add credits");

  }

};

  if (!profile) {
    return <p>Loading...</p>;
  }

  return (

    <div
      style={{
  border: "1px solid #444",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "20px",
  background: "#1e1e1e",
  color: "white"
}}
    >

      <h2>User Profile</h2>

      <p>
        <strong>ID:</strong>{" "}
        {profile.id}
      </p>

      <p>
        <strong>Username:</strong>{" "}
        {profile.username}
      </p>

      <p>
        <strong>Email:</strong>{" "}
        {profile.email}
      </p>

      <p>
        <strong>Role:</strong>{" "}
        {profile.role}
      </p>
      <p>
  <strong>Credits:</strong>{" "}
  ₹ {Number(profile.credits || 0).toFixed(2)}
</p>

      {isAdmin && (

        <button
          onClick={() =>
            window.location.href =
              "/admin"
          }
          style={{
            background: "#ff9800",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "10px"
          }}
        >
          👑 Admin Panel
        </button>

      )}

      {stats && (

        <>

          {/* Contributor Dashboard */}
<h3>📊 Contributor Dashboard</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "10px",
              marginTop: "20px",
              marginBottom: "20px"
            }}
          >

            <div
  style={{
    background: "#2d2d2d",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center"
  }}
>
  📊 Approved
  <h3>{stats.approved_images}</h3>
</div>

<div
  style={{
    background: "#2d2d2d",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center"
  }}
>
  ⏳ Pending
  <h3>{stats.pending_images}</h3>
</div>

<div
  style={{
    background: "#2d2d2d",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center"
  }}
>
  ❌ Rejected
  <h3>{stats.rejected_images}</h3>
</div>

<div
  style={{
    background: "#2d2d2d",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center"
  }}
>
  🔥 Best Downloads
  <h3>{stats.top_downloads || 0}</h3>
</div>

<div
  style={{
    background: "#2d2d2d",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center"
  }}
>
  👁 Best Views
  <h3>{stats.top_views || 0}</h3>
</div>

<div
  style={{
    background: "#2d2d2d",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center"
  }}
>
  ❤️ Best Likes
  <h3>{stats.top_likes || 0}</h3>
</div>

          </div>

          {/* Statistics */}
<h3>📈 Statistics</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(5, 1fr)",
              gap: "1px",
              marginTop: "1px"
            }}
          >

            <div
  style={{
    background: "#2d2d2d",
    padding: "10px",
    borderRadius: "10px",
    textAlign: "center"
  }}
>
  📸 Uploads
  <h3>{stats.total_uploads}</h3>
</div>

<div
  style={{
    background: "#2d2d2d",
    padding: "10px",
    borderRadius: "10px",
    textAlign: "center"
  }}
>
  ❤️ Likes
  <h3>{stats.total_likes}</h3>
</div>
    <div
  style={{
    background: "#2d2d2d",
    padding: "10px",
    borderRadius: "10px",
    textAlign: "center"
  }}
>
  👁 Views
  <h3>{stats.total_views}</h3>
</div>
<div
  style={{
    background: "#2d2d2d",
    padding: "10px",
    borderRadius: "10px",
    textAlign: "center"
  }}
>
  ⬇ Downloads
  <h3>{stats.total_downloads}</h3>
</div>
<div
  style={{
    background: "#2d2d2d",
    padding: "10px",
    borderRadius: "10px",
    textAlign: "center"
  }}
>
  💰 Earnings
  <h3>
    ₹ {Number(stats.total_earnings || 0).toFixed(2)}
  </h3>
</div>

            
            <div
  style={{
    marginTop: "20px"
  }}
>

    
  <div
  style={{
    marginTop: "25px",
    padding: "20px",
    background: "#2d2d2d",
    borderRadius: "12px",
    border: "1px solid #4caf50",
    color: "white"
  }}
>
  <h3>💰 Earnings Dashboard</h3>

  <p>
    Total Earnings:
    {" "}
    <strong>
      ₹ {Number(stats.total_earnings || 0).toFixed(2)}
    </strong>
  </p>

  <p>
    Total Downloads:
    {" "}
    {stats.total_downloads}
  </p>

  <p>
    Rate Per Download:
    ₹ 0.25
  </p>
</div>
<h3>
    Buy Credits
  </h3>

  <button
    onClick={() => addCredits(10)}
    style={{
      marginRight: "auto"
    }}
  >
    ₹99 → 10 Credits
  </button>

  <button
    onClick={() => addCredits(50)}
    style={{
      marginRight: "auto"
    }}
  >
    ₹399 → 50 Credits
  </button>

  <button
    onClick={() => addCredits(100)}
  >
    ₹699 → 100 Credits
  </button>

</div>

          </div>

        </>

      )}

    </div>

  );

}

export default Profile;