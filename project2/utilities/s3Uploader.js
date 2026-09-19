const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const fs = require("fs");

// ── Detect whether AWS credentials are configured ──────────────────────────
const AWS_CONFIGURED =
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_REGION &&
  process.env.AWS_BUCKET_NAME;

if (AWS_CONFIGURED) {
  console.log("AWS S3 storage enabled — uploads will be stored in S3.");
} else {
  console.log(
    "AWS credentials not found — falling back to local disk storage (uploads/)."
  );
}

// ── S3 Client ──────────────────────────────────────────────────────────────
const s3 = AWS_CONFIGURED
  ? new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

// ── File filter (jpeg/png only) ────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG and PNG images are allowed."),
      false
    );
  }
};

// ── Build multer storage engine ────────────────────────────────────────────
let storage;

if (AWS_CONFIGURED) {
  storage = multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const timestamp = Date.now();
      const safeName = file.originalname.replace(/\s+/g, "_");
      cb(null, `homes/${timestamp}-${safeName}`);
    },
  });
} else {
  // Ensure uploads/ directory exists for local fallback
  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const timestamp = new Date().toISOString().replace(/:/g, "-");
      cb(null, `${timestamp}-${file.originalname}`);
    },
  });
}

// ── Export configured multer instance ────────────────────────────────────
const upload = multer({ storage, fileFilter });

// ── Helper: delete a file from S3 or local disk ───────────────────────────
const deleteFile = async (fileUrlOrPath) => {
  if (!fileUrlOrPath) return;

  try {
    if (AWS_CONFIGURED && fileUrlOrPath.startsWith("https://")) {
      // Extract the S3 object key from the URL
      // e.g. https://bucket-name.s3.region.amazonaws.com/homes/key.jpg
      const url = new URL(fileUrlOrPath);
      const key = decodeURIComponent(url.pathname.slice(1)); // remove leading slash

      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
        })
      );
      console.log(`Deleted S3 object: ${key}`);
    } else {
      // Local file — strip any leading /uploads/ prefix then delete
      let localPath = fileUrlOrPath;
      if (localPath.startsWith("/uploads/")) {
        localPath = localPath.slice(1); // => uploads/filename
      }
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        console.log(`Deleted local file: ${localPath}`);
      }
    }
  } catch (err) {
    console.error("Error deleting file:", err.message);
    // Non-fatal — don't crash the request
  }
};

module.exports = { upload, deleteFile, s3, AWS_CONFIGURED };
