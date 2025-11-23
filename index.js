require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectToDB, syncDB } = require("./config/db");
const session = require("express-session");
const helmet = require("helmet");

// Import models (ensure associations are registered)
require("./models");

const appRoutes = require("./routes/appRoutes");
const { bootstrapAdmin } = require("./scripts/bootstrapAdmin");

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(helmet());

// express-session setup
app.use(
  session({
    name: "session",
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true only in production (HTTPS)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

app.use("/api", appRoutes);

app.get("/", (req, res) =>
  res.json({ message: "API is running...", data: req.session.user })
);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const startServer = async () => {
  await connectToDB();

  if (process.env.NODE_ENV === "development") {
    // await syncDB(); // 👈 run only in dev
    // bootstrapAdmin();
  }

  // ✅ Initialize cron jobs AFTER DB is connected, BEFORE app.listen
  require("./cronJobs");

  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
};

startServer();
