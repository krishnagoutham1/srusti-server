// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const SequelizeStoreFactory = require("connect-session-sequelize");
const path = require("path");

const { connectToDB, sequelize, syncDB } = require("./config/db"); // ensure sequelize is exported
require("./models"); // load models/associations
const appRoutes = require("./routes/appRoutes");
const { bootstrapAdmin } = require("./scripts/bootstrapAdmin");

const app = express();
const port = process.env.PORT || 4000;

// If behind a proxy (Render, Heroku, Cloudflare), enable trust proxy
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// CORS - allow only your client(s)
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (origin === CLIENT_URL) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(helmet());

// Session store using Sequelize (DB-backed)
const SequelizeStore = SequelizeStoreFactory(session.Store);

const sessionOptions = {
  name: process.env.SESSION_NAME || "session",
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: false, // recommended: false
  saveUninitialized: false, // recommended: false
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // must be true in prod (HTTPS)
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: Number(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // default 1 day
    // domain: process.env.COOKIE_DOMAIN || undefined, // uncomment if using subdomains
  },
};

// Create session store instance (will be attached once DB connected)
let sessionStore;

// Apply session middleware after store is assigned (we'll init below)

// Routes & handlers that don't need session store yet
app.use("/api", (req, res, next) => next()); // placeholder so route order preserved

app.get("/", (req, res) =>
  res.json({ message: "API is running...", data: req.session?.user || null })
);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "Something went wrong!" });
});

const startServer = async () => {
  // 1) Connect DB
  await connectToDB();

  // 2) Optional DB sync in development (use with caution)
  if (process.env.NODE_ENV === "development") {
    // await syncDB(); // uncomment if you want Sequelize to sync models in dev
    // await bootstrapAdmin(); // optional
  }

  // 3) Setup the Sequelize session store (after DB connected)
  sessionStore = new SequelizeStore({
    db: sequelize,
    tableName: process.env.SESSION_TABLE_NAME || "Sessions",
    expiration: Number(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000,
  });

  // Sync the session table (creates table if missing). In prod you may want
  // to run migrations instead of sync().
  try {
    await sessionStore.sync();
    console.log("✅ Session table synced.");
  } catch (err) {
    console.error("❌ Failed to sync session table:", err);
    // proceed: session store might still work if table exists; otherwise you'll get runtime errors
  }

  // 4) Now apply session middleware (store is ready)
  app.use(
    session({
      ...sessionOptions,
      store: sessionStore,
    })
  );

  // 5) Now mount real routes (after session middleware)
  app._router.stack = app._router.stack.filter(Boolean); // no-op to be safe
  app.use("/api", appRoutes);

  // 6) Initialize cron jobs AFTER DB is connected
  try {
    require("./cronJobs");
  } catch (e) {
    console.warn("⚠️ cronJobs failed to initialize:", e.message || e);
  }

  // 7) Start server
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`NODE_ENV=${process.env.NODE_ENV || "development"}`);
    console.log(`CLIENT_URL=${CLIENT_URL}`);
  });
};

startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
