import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import auth from "./auth.js";
import UserRoute from "./routes/User.js";
import cron from "node-cron";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", auth, UserRoute);
// mongoose connection

const URI = process.env.ATLAS_URI;
mongoose.connect(URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", function () {
  console.log("db is connected successfully.");
});

app.get("/", (req, res) => {
  res.send("all good");
});

app.get(
  "/quality-bazar/alsfkapwoehsfalkjs/changepassword/:id/6067f1a68a8c9c341916977b;",
  (req, res) => {
    res.sendFile(path.join(__dirname + "/changepassword.html"));
  }
);

cron.schedule("* * * * *", () => {
  console.log("running a task every minute");
});

app.listen(PORT, () => {
  console.log(`backend is running on port ${PORT}`);
});
