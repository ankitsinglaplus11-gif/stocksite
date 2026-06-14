const express = require("express");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();

/* ---------------- FILE UPLOAD CONFIG ---------------- */

const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    cb(null, "uploads/");

  },

  filename: function (req, file, cb) {

    cb(
      null,
      Date.now() + "-" + file.originalname
    );

  },

});

const upload = multer({

  storage: storage,

  limits: {
    fileSize: 20 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp"
    ];

    if (
      allowedTypes.includes(file.mimetype)
    ) {

      cb(null, true);

    } else {

      cb(
        new Error(
          "Only JPG, PNG and WEBP files are allowed"
        )
      );

    }

  }

});
/* ---------------- MIDDLEWARE ---------------- */

app.use(cors());

app.use(express.json());

app.use(
  "/uploads",
  express.static("uploads")
);
/* ---------------- ADMIN MIDDLEWARE ---------------- */

const verifyAdmin = async (
  req,
  res,
  next
) => {

  try {

    const authHeader =
      req.headers["authorization"];

    if (!authHeader) {

      return res
        .status(401)
        .json("Access denied");

    }

    const token =
      authHeader.split(" ")[1];

    const decoded =
      jwt.verify(
        token,
        "secretkey"
      );

    const user =
      await pool.query(

        `
        SELECT role
        FROM users
        WHERE id = $1
        `,

        [decoded.user]

      );

    if (
      user.rows.length === 0
    ) {

      return res
        .status(404)
        .json("User not found");

    }

    if (
      user.rows[0].role !==
      "admin"
    ) {

      return res
        .status(403)
        .json(
          "Admin access only"
        );

    }

    req.user =
      decoded.user;

    next();

  } catch (err) {

    console.error(err);

    res
      .status(401)
      .json("Invalid token");

  }

};
/* ---------------- HEALTH CHECK ---------------- */

app.get("/", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT NOW()"
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).send(
      "Database connection error"
    );

  }

});

/* ---------------- REGISTER ---------------- */

app.post("/register", async (req, res) => {

  try {

    const {
      username,
      email,
      password
    } = req.body;

    const saltRounds = 10;

    const hashedPassword =
      await bcrypt.hash(
        password,
        saltRounds
      );

    const newUser = await pool.query(

      `
      INSERT INTO users
      (
        username,
        email,
        password
      )
      VALUES ($1, $2, $3)
      RETURNING *
      `,

      [
        username,
        email,
        hashedPassword
      ]

    );

    res.json(newUser.rows[0]);

  } catch (err) {

    console.error(err.message);

    res.status(500).send(
      "Server error"
    );

  }

});

/* ---------------- LOGIN ---------------- */

app.post("/login", async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    const user = await pool.query(

      `
      SELECT *
      FROM users
      WHERE email = $1
      `,

      [email]

    );

    if (user.rows.length === 0) {

      return res.status(401).json(
        "Invalid email"
      );

    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.rows[0].password
      );

    if (!validPassword) {

      return res.status(401).json(
        "Invalid password"
      );

    }

    const token = jwt.sign(

      {
        user: user.rows[0].id
      },

      "secretkey"

    );

    res.json({ token });

  } catch (err) {

    console.error(err.message);

    res.status(500).send(
      "Server error"
    );

  }

});

/* ---------------- DASHBOARD ---------------- */

app.get("/dashboard", (req, res) => {

  try {

    const authHeader =
      req.headers["authorization"];

    if (!authHeader) {

      return res.status(401).json(
        "Access denied"
      );

    }

    const token =
      authHeader.split(" ")[1];

    const verified = jwt.verify(
      token,
      "secretkey"
    );

    res.json({

      message:
        "Welcome to dashboard",

      user: verified,

    });

  } catch (err) {

    console.error(err.message);

    res.status(401).json(
      "Invalid token"
    );

  }

});

/* ---------------- UPLOAD IMAGE ---------------- */

app.post(
  "/upload",
  upload.single("image"),
  async (req, res) => {

    try {

      const authHeader = req.headers["authorization"];

      if (!authHeader) {
        return res.status(401).json("Access denied");
      }

      const token = authHeader.split(" ")[1];

      console.log("TOKEN RECEIVED:", token);

      const decoded = jwt.verify(
        token,
        "secretkey"
      );

      console.log("DECODED:", decoded);

      const {
        title,
        category,
        keywords
      } = req.body;

      if (!req.file) {
        return res.status(400).json(
          "No image uploaded"
        );
      }

      if (
        !title ||
        !category ||
        !keywords
      ) {
        return res.status(400).json(
          "All fields are required"
        );
      }

      const uploaded_by = decoded.user;

      console.log(
        "DECODED USER:",
        decoded.user
      );

      console.log("TITLE:", title);
      console.log("CATEGORY:", category);
      console.log("KEYWORDS:", keywords);
      console.log("FILE:", req.file);

      const newImage =
  await pool.query(
    `
    INSERT INTO images
    (
      title,
      filename,
      category,
      keywords,
      uploaded_by,
      created_at,
      downloads,
      views,
      likes,
      status
    )
    VALUES
    (
      $1,
      $2,
      $3,
      $4,
      $5,
      NOW(),
      0,
      0,
      0,
      'pending'
    )
    RETURNING *
    `,
    [
      title,
      req.file.filename,
      category,
      keywords,
      uploaded_by
    ]
  );
      res.json(
        newImage.rows[0]
      );

    } catch (err) {

      console.error(
        "UPLOAD ERROR:"
      );

      console.error(err);

      res.status(500).json(
        err.message
      );

    }

  }
);

/* ---------------- GET ALL IMAGES ---------------- */

app.get("/images", async (req, res) => {

  try {

    const page =
      parseInt(req.query.page) || 1;

    const limit =
      parseInt(req.query.limit) || 12;

    const offset =
      (page - 1) * limit;

    const images =
      await pool.query(

        `
        SELECT
  images.*,
  users.username
FROM images
LEFT JOIN users
ON images.uploaded_by = users.id
WHERE images.status = 'approved'
ORDER BY
  images.created_at DESC,
  images.id DESC
LIMIT $1
OFFSET $2
        `,
        [limit, offset]

      );

    const totalCount =
      await pool.query(

        `
        SELECT COUNT(*)
        FROM images
        WHERE status = 'approved'
        `

      );
      const stats =
  await pool.query(
    `
    SELECT
      COALESCE(SUM(likes),0) AS total_likes,
      COALESCE(SUM(downloads),0) AS total_downloads,
      COALESCE(SUM(views),0) AS total_views
    FROM images
    WHERE status = 'approved'
    `
  );

    res.json({
  images: images.rows,

  totalImages:
    parseInt(
      totalCount.rows[0].count
    ),

  totalLikes:
    parseInt(
      stats.rows[0].total_likes
    ),

  totalDownloads:
    parseInt(
      stats.rows[0].total_downloads
    ),

  totalViews:
    parseInt(
      stats.rows[0].total_views
    )
});

  } catch (err) {

    console.error(err.message);

    res.status(500).send(
      "Server error"
    );

  }

});
/* ---------------- GET SINGLE IMAGE ---------------- */

app.get(
  "/images/:id",
  async (req, res) => {

    try {

      const { id } = req.params;

      const image =
        await pool.query(

          `
          SELECT *
          FROM images
          WHERE id = $1
          `,

          [id]

        );

      if (
        image.rows.length === 0
      ) {

        return res.status(404).json(
          "Image not found"
        );

      }

      res.json(
        image.rows[0]
      );

    } catch (err) {

      console.error(err.message);

      res.status(500).send(
        "Fetch image error"
      );

    }

  }
);

/* ---------------- INCREASE VIEW COUNT ---------------- */

app.put(
  "/images/:id/view",
  async (req, res) => {

    try {

      const { id } = req.params;

      const updatedImage =
        await pool.query(

          `
          UPDATE images
          SET views = COALESCE(views, 0) + 1
          WHERE id = $1
          RETURNING *
          `,

          [id]

        );

      if (
        updatedImage.rows.length === 0
      ) {

        return res.status(404).json(
          "Image not found"
        );

      }

      res.json(
        updatedImage.rows[0]
      );

    } catch (err) {

      console.error(err.message);

      res.status(500).send(
        "View update error"
      );

    }

  }
);

/* ---------------- LIKE IMAGE ---------------- */

app.put(
  "/images/:id/like",
  async (req, res) => {

    try {

      const { id } = req.params;

      const updatedImage =
        await pool.query(

          `
          UPDATE images
          SET likes = COALESCE(likes, 0) + 1
          WHERE id = $1
          RETURNING *
          `,

          [id]

        );

      if (
        updatedImage.rows.length === 0
      ) {

        return res.status(404).json(
          "Image not found"
        );

      }

      res.json(
        updatedImage.rows[0]
      );

    } catch (err) {

      console.error(err.message);

      res.status(500).send(
        "Like error"
      );

    }

  }
);

/* ---------------- DOWNLOAD IMAGE ---------------- */

app.put(
  "/images/:id/download",
  async (req, res) => {

    try {

      const authHeader =
        req.headers["authorization"];

      if (!authHeader) {

        return res.status(401).json(
          "Access denied"
        );

      }

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          "secretkey"
        );

      const userId =
        decoded.user;

      /* CHECK USER CREDITS */

      const user =
        await pool.query(

          `
          SELECT credits
          FROM users
          WHERE id = $1
          `,

          [userId]

        );

      if (
        Number(
          user.rows[0].credits
        ) < 1
      ) {

        return res.status(400).json(
          "Not enough credits"
        );

      }

      /* DEDUCT 1 CREDIT */

      await pool.query(

        `
        UPDATE users
        SET credits = credits - 1
        WHERE id = $1
        `,

        [userId]

      );

      const { id } = req.params;
      await pool.query(

  `
  INSERT INTO downloads
  (
    user_id,
    image_id
  )
  VALUES
  (
    $1,
    $2
  )
  `,

  [
    userId,
    id
  ]

);

      const updatedImage =
        await pool.query(

          `
          UPDATE images
          SET
            downloads = COALESCE(downloads,0) + 1,
            earnings = COALESCE(earnings,0) + 0.25
          WHERE id = $1
          RETURNING *
          `,

          [id]

        );

      if (
        updatedImage.rows.length === 0
      ) {

        return res.status(404).json(
          "Image not found"
        );

      }

      res.json(
        updatedImage.rows[0]
      );

    } catch (err) {

      console.error(err.message);

      res.status(500).send(
        "Download count error"
      );

    }

  }
);
/* ---------------- DELETE IMAGE ---------------- */

app.delete(
  "/images/:id",
  async (req, res) => {

    try {

      const { id } = req.params;

      // Get image filename first

      const image =
        await pool.query(
          `
          SELECT filename
          FROM images
          WHERE id = $1
          `,
          [id]
        );

      if (
        image.rows.length === 0
      ) {

        return res
          .status(404)
          .json("Image not found");

      }

      const filename =
        image.rows[0].filename;

      // Delete favorites

      await pool.query(
        `
        DELETE FROM favorites
        WHERE image_id = $1
        `,
        [id]
      );

      // Delete downloads

      await pool.query(
        `
        DELETE FROM downloads
        WHERE image_id = $1
        `,
        [id]
      );

      // Delete image record

      await pool.query(
        `
        DELETE FROM images
        WHERE id = $1
        `,
        [id]
      );

      // Delete physical file

      const filePath =
        path.join(
          __dirname,
          "uploads",
          filename
        );

      if (
        fs.existsSync(filePath)
      ) {

        fs.unlinkSync(filePath);

      }

      res.json(
        "Image deleted successfully"
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Delete error"
      );

    }

  }
);
/* ---------------- UPDATE IMAGE ---------------- */

app.put(
  "/images/:id",
  async (req, res) => {

    try {

      const { id } = req.params;

      const {
        title,
        category,
        keywords
      } = req.body;

      const updatedImage =
        await pool.query(

          `
          UPDATE images
          SET
            title = $1,
            category = $2,
            keywords = $3
          WHERE id = $4
          RETURNING *
          `,

          [
            title,
            category,
            keywords,
            id
          ]

        );

      res.json(
        updatedImage.rows[0]
      );

    } catch (err) {

      console.error(err.message);

      res.status(500).send(
        "Update error"
      );

    }

  }
);
const authenticateToken = (
  req,
  res,
  next
) => {

  const authHeader =
    req.headers["authorization"];

  if (!authHeader) {

    return res.status(401).json(
      "Access denied"
    );

  }

  const token =
    authHeader.split(" ")[1];

  try {

    const decoded =
      jwt.verify(
        token,
        "secretkey"
      );

    req.user = {
      id: decoded.user
    };

    next();

  } catch (err) {

    return res.status(403).json(
      "Invalid token"
    );

  }

};
/* ---------------- USER PROFILE ---------------- */

app.get("/profile", async (req, res) => {

  try {

    console.log("PROFILE ROUTE HIT");

    const authHeader =
      req.headers["authorization"];

    console.log(
      "AUTH HEADER:",
      authHeader
    );

    if (!authHeader) {

      return res.status(401).json(
        "Access denied"
      );

    }

    const token =
      authHeader.split(" ")[1];

    const decoded =
      jwt.verify(
        token,
        "secretkey"
      );

    const user =
      await pool.query(

        `
        SELECT
id,
username,
email,
role,
credits
FROM users
WHERE id = $1
        `,

        [decoded.user]

      );

    if (
      user.rows.length === 0
    ) {

      return res.status(404).json(
        "User not found"
      );

    }

    res.json(
      user.rows[0]
    );

  } catch (err) {

    console.error(err);

    res.status(500).send(
      "Profile error"
    );

  }

});

app.get(
  "/dashboard-stats",
  authenticateToken,
  async (req, res) => {
    try {

      const userId = req.user.id;
      console.log(
  "DASHBOARD USER ID:",
  userId
);

      const uploads = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM images
        WHERE uploaded_by = $1
        `,
        [userId]
      );

      const downloads = await pool.query(
        `
        SELECT COALESCE(SUM(downloads),0) AS total
        FROM images
        WHERE uploaded_by = $1
        `,
        [userId]
      );

      const views = await pool.query(
        `
        SELECT COALESCE(SUM(views),0) AS total
        FROM images
        WHERE uploaded_by = $1
        `,
        [userId]
      );

      const likes = await pool.query(
        `
        SELECT COALESCE(SUM(likes),0) AS total
        FROM images
        WHERE uploaded_by = $1
        `,
        [userId]
      );

      res.json({
        uploads:
          Number(
            uploads.rows[0].total
          ),
        downloads:
          Number(
            downloads.rows[0].total
          ),
        views:
          Number(
            views.rows[0].total
          ),
        likes:
          Number(
            likes.rows[0].total
          )
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: "Server error"
      });

    }
  }
);
/* ---------------- PROFILE STATS ---------------- */

app.get(
  "/profile/stats",
  async (req, res) => {
    console.log("STATS ROUTE HIT");

const authHeader =
  req.headers["authorization"];

console.log(
  "STATS AUTH:",
  authHeader
);

    try {

      const authHeader =
        req.headers["authorization"];
        console.log(
        "PROFILE STATS AUTH:",
        authHeader
      );

      if (!authHeader) {

        return res.status(401).json(
          "Access denied"
        );

      }

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          "secretkey"
        );

      const stats =
        await pool.query(

          `
          SELECT

COUNT(*) AS total_uploads,

COUNT(*) FILTER
(
  WHERE status = 'approved'
)
AS approved_images,

COUNT(*) FILTER
(
  WHERE status = 'pending'
)
AS pending_images,

COUNT(*) FILTER
(
  WHERE status = 'rejected'
)
AS rejected_images,

COALESCE(
  SUM(likes),
  0
)
AS total_likes,

COALESCE(
  SUM(views),
  0
)
AS total_views,

COALESCE(
  SUM(downloads),
  0
)
AS total_downloads,

COALESCE(
  SUM(earnings),
  0
)
AS total_earnings,

COALESCE(
  MAX(downloads),
  0
)
AS top_downloads,

COALESCE(
  MAX(views),
  0
)
AS top_views,

COALESCE(
  MAX(likes),
  0
)
AS top_likes

FROM images

WHERE uploaded_by = $1
          `,

          [decoded.user]

        );

      res.json(
        stats.rows[0]
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Stats error"
      );

    }

  }
);

/* ---------------- MY UPLOADS ---------------- */

app.get(
  "/my-uploads",
  async (req, res) => {

    try {

      const authHeader =
        req.headers["authorization"];

      if (!authHeader) {

        return res.status(401).json(
          "Access denied"
        );

      }

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          "secretkey"
        );

      const images =
        await pool.query(

          `
          SELECT *
          FROM images
          WHERE uploaded_by = $1
          ORDER BY
          created_at DESC
          `,

          [decoded.user]

        );

      res.json(
        images.rows
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "My uploads error"
      );

    }

  }
);
/* ---------------- ADMIN ALL IMAGES ---------------- */

app.get(
  "/admin/images",
  verifyAdmin,
  async (req, res) => {

    try {

      const images =
        await pool.query(

          `
          SELECT *
          FROM images
          ORDER BY created_at DESC
          `

        );

      res.json(
        images.rows
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Admin fetch error"
      );

    }

  }
);
/* ---------------- APPROVE IMAGE ---------------- */

app.put(
  "/admin/approve/:id",
  verifyAdmin,
  async (req, res) => {

    try {

      const { id } = req.params;

      const image =
        await pool.query(

          `
          UPDATE images
          SET status = 'approved'
          WHERE id = $1
          RETURNING *
          `,

          [id]

        );

      res.json(
        image.rows[0]
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Approve error"
      );

    }

  }
);
/* ---------------- REJECT IMAGE ---------------- */

app.put(
  "/admin/reject/:id",
  verifyAdmin,
  async (req, res) => {

    try {

      const { id } = req.params;

      const image =
        await pool.query(

          `
          UPDATE images
          SET status = 'rejected'
          WHERE id = $1
          RETURNING *
          `,

          [id]

        );

      res.json(
        image.rows[0]
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Reject error"
      );

    }

  }
);
/* ---------------- ADD CREDITS ---------------- */

app.put(
  "/credits/add",
  async (req, res) => {

    try {

      const authHeader =
        req.headers["authorization"];

      if (!authHeader) {

        return res.status(401).json(
          "Access denied"
        );

      }

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          "secretkey"
        );

      const { credits } =
        req.body;

      const user =
        await pool.query(

          `
          UPDATE users
          SET credits =
            COALESCE(credits,0) + $1
          WHERE id = $2
          RETURNING *
          `,

          [
            credits,
            decoded.user
          ]

        );

      res.json(
        user.rows[0]
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Credit update error"
      );

    }

  }
);
/* ---------------- ADD FAVORITE ---------------- */

app.post(
  "/favorites/:imageId",
  async (req, res) => {

    try {

      const authHeader =
        req.headers["authorization"];

      if (!authHeader) {

        return res.status(401).json(
          "Access denied"
        );

      }

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          "secretkey"
        );

      const { imageId } =
        req.params;

      await pool.query(

        `
        INSERT INTO favorites
        (
          user_id,
          image_id
        )
        VALUES
        (
          $1,
          $2
        )
        `,

        [
          decoded.user,
          imageId
        ]

      );

      res.json(
        "Added to favorites"
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Favorite error"
      );

    }

  }
);
/* ---------------- REMOVE FAVORITE ---------------- */

app.delete(
  "/favorites/:imageId",
  async (req, res) => {

    try {

      const authHeader =
        req.headers["authorization"];

      if (!authHeader) {

        return res.status(401).json(
          "Access denied"
        );

      }

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          "secretkey"
        );

      const { imageId } =
        req.params;

      await pool.query(

        `
        DELETE FROM favorites
        WHERE uploaded_by = $1
        AND image_id = $2
        `,

        [
          decoded.user,
          imageId
        ]

      );

      res.json(
        "Favorite removed"
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Remove favorite error"
      );

    }

  }
);
/* ---------------- MY FAVORITES ---------------- */

app.get(
  "/favorites",
  async (req, res) => {

    try {

      const authHeader =
        req.headers["authorization"];

      if (!authHeader) {

        return res.status(401).json(
          "Access denied"
        );

      }

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          "secretkey"
        );

      const favorites =
        await pool.query(

          `
          SELECT
            images.*
          FROM favorites
          JOIN images
            ON favorites.image_id = images.id
          WHERE favorites.user_id = $1
          ORDER BY images.created_at DESC
          `,

          [decoded.user]

        );

      res.json(
        favorites.rows
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Favorites fetch error"
      );

    }

  }
);
/* ---------------- MY DOWNLOADS ---------------- */

app.get(
  "/my-downloads",
  async (req, res) => {

    try {

      const authHeader =
        req.headers["authorization"];

      if (!authHeader) {

        return res.status(401).json(
          "Access denied"
        );

      }

      const token =
        authHeader.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          "secretkey"
        );

      const downloads =
        await pool.query(

          `
          SELECT
            images.*,
            downloads.downloaded_at
          FROM downloads
          JOIN images
            ON downloads.image_id = images.id
          WHERE downloads.user_id = $1
          ORDER BY downloads.downloaded_at DESC
          `,

          [decoded.user]

        );

      res.json(
        downloads.rows
      );

    } catch (err) {

      console.error(err);

      res.status(500).send(
        "Downloads fetch error"
      );

    }

  }
);
/* ---------------- LEADERBOARD ---------------- */

app.get(
  "/leaderboard",
  async (req, res) => {

    res.json([
      {
        name: "Test User",
        uploads: 21,
        likes: 4,
        views: 14,
        downloads: 11
      }
    ]);

  }
);
/* ---------------- SERVER ---------------- */

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});