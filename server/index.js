import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import bodyParser from "body-parser";
import dotenv from "dotenv"
import helmet from "helmet"
import morgan from "morgan";
import path from "path"
import { fileURLToPath } from "url";
import { error } from "console";
import authRoutes from "./routes/auth.js"
import userRoutes from './routes/users.js'
import postRoutes from './routes/posts.js'
import {register} from "./controllers/auth.js"
import { verifyToken } from "./middlewares/auth.js";
import { createPost } from "./controllers/posts.js";
import User from "./models/User.js";
import Posts from "./models/Posts.js";
import { users,posts } from "./data/index.js";

import { create } from "domain";
 
/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ADD DATA ONE TIME */
     
    // User.insertMany(users);
    // Posts.insertMany(posts);
    // User.findOneAndRemove({email:null});
    
  })
  .catch((error) => console.log(`${error} did not connect`));