function Navbar() {

  const token = localStorage.getItem(
    "token"
  );

  const handleLogout = () => {

    localStorage.removeItem("token");

    alert("Logged out");

    window.location.reload();
  };

  return (

    <div
      style={{
        background: "#111",
        color: "white",
        padding: "15px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        borderRadius: "10px",
      }}
    >

      <h2>
        Stock Photo Website
      </h2>

      <div>

        {token ? (

          <button
            onClick={handleLogout}
            style={{
              padding: "8px 15px",
              background: "red",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>

        ) : (

          <p>
            Guest Mode
          </p>

        )}

      </div>

    </div>

  );
}

export default Navbar;