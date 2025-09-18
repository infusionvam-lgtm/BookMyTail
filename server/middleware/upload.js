import multer from "multer";
import path from "path";
import fs from "fs";

// Room uploads
const roomDir = path.join("images", "upload", "rooms");
if (!fs.existsSync(roomDir)) fs.mkdirSync(roomDir, { recursive: true });

const roomStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, roomDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Avatar uploads
const avatarDir = path.join("images", "upload", "avatars");
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, req.user._id + "-" + Date.now() + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|avif/;
  if (allowedTypes.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only image files allowed"), false);
};

export const roomUpload = multer({ storage: roomStorage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
export const avatarUpload = multer({ storage: avatarStorage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
