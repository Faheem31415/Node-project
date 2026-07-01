//core module
const path = require("path");
const fs = require("fs");

//external/npm module
const express = require("express");
const app = express();
const session = require("express-session");
const { default: mongoose } = require("mongoose");
const MongoDBstore = require("connect-mongodb-session")(session);
const multer = require("multer");
const dns =require('dns')

//change dns
dns.setServers(["1.1.1.1", "8.8.8.8"]);

//local module
const rootDir = require("./utilities/pathutil");
const { errorpage } = require("./controller/errors");
const HostRouters = require("./routes/hostRouter");
const UserRouters = require("./routes/userRouter");
const AuthRouters = require("./routes/authRouter");

const DB_PATH ="mongodb+srv://shahfaheem:Faheem8899@pi-db.hn983nb.mongodb.net/airbnb?retryWrites=true&w=majority&appName=pi-db";

//ejs engine
app.set("view engine", "ejs");
app.set("views", "views");

const store = new MongoDBstore({
  uri: DB_PATH,
  collection: "sessions",
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
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    store: store,
  })
);

//routes
app.use((req, res, next) => {
  //islogin,sessions and cookies are header part
  req.isLogin = req.session.isLogin;
  next();
});

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

//error handling
app.use(errorpage);

const PORT = 5000;

mongoose
  .connect(DB_PATH)
  .then(() => {
    console.log("Connected to Mongo");
    app.listen(PORT, () => {
      console.log(`http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error while connecting to Mongo", err);
  });
