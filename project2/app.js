//core module
require("dotenv").config();
const path = require("path");
const fs = require("fs");

//external/npm module
const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const MongoDBstore = require("connect-mongodb-session")(session);
const multer = require("multer");
const dns = require("dns");

//change dns
dns.setServers(["1.1.1.1", "8.8.8.8"]);

//local module
const rootDir = require("./utilities/pathutil");
const { errorpage, notFoundPage } = require("./controller/errors");
const HostRouters = require("./routes/hostRouter");
const UserRouters = require("./routes/userRouter");
const AuthRouters = require("./routes/authRouter");

const DB_PATH = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;
const PORT = process.env.PORT || 5000;

if (!DB_PATH) {
  console.error("FATAL: MONGO_URI is not set in .env file. Exiting.");
  process.exit(1);
}
if (!SESSION_SECRET) {
  console.error("FATAL: SESSION_SECRET is not set in .env file. Exiting.");
  process.exit(1);
}

//ejs engine
app.set("view engine", "ejs");
app.set("views", "views");

const store = new MongoDBstore({
  uri: DB_PATH,
  collection: "sessions",
});

// Handle session store errors to prevent silent crashes
store.on("error", (err) => {
  console.error("Session store error:", err);
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    cb(null, timestamp + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG and PNG are allowed."), false);
  }
};

app.use(express.urlencoded({ extended: true }));
app.use(multer({ storage, fileFilter }).single("photo"));
app.use(express.static(path.join(rootDir, "public")));
app.use("/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/host/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/user/uploads", express.static(path.join(rootDir, "uploads")));
app.use(
  "/user/home-list/home-details/uploads",
  express.static(path.join(rootDir, "uploads"))
);

//session
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
    },
  })
);

//middleware — attach session data to every request
app.use((req, res, next) => {
  req.isLogin = req.session.isLogin || false;
  next();
});

//routes
app.use(UserRouters);
app.use(AuthRouters);

app.use("/host", (req, res, next) => {
  if (req.isLogin) {
    next();
  } else {
    res.redirect("/login");
  }
});

app.use("/host", HostRouters);

// 404 handler — must come after all routes
app.use(notFoundPage);

// Global error handler — must be last and have 4 args
app.use(errorpage);

// Catch unhandled promise rejections globally
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Catch synchronous uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

mongoose
  .connect(DB_PATH)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error while connecting to MongoDB:", err);
    process.exit(1);
  });
