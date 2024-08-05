const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const CryptoJS = require("crypto-js");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const url =
  "mongodb+srv://admin:1234@cluster0.xr886v6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const secretKey = "YCqHFg395T";

mongoose
  .connect(url, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("connected mongoDB");
  });

const userSchema = new mongoose.Schema({
  emailOrPhone: String,
  password: String,
  name: String,
});

const User = mongoose.model("users", userSchema);

app.get("/", async (req, res) => {
  res.send("Hello World");
});

app.post("/register", async (req, res) => {
  const { emailOrPhone, password, name } = req.body;

  const checkUser = await User.findOne({ emailOrPhone });

  if (checkUser) {
    return res.status(400).send({
      success: false,
      message: "This email or phone is already have.",
    });
  }

  const encryptedPassword = CryptoJS.AES.encrypt(
    password,
    secretKey
  ).toString();

  const user = new User({ emailOrPhone, password: encryptedPassword, name });
  await user.save();
  res.send({ success: true, name: name });
});

app.post("/login", async (req, res) => {
  const { emailOrPhone, password } = req.body;
  const user = await User.findOne({ emailOrPhone });

  console.log("reqq >>>>>>>>>", user);
  if (!user) {
    return res.status(400).send({ success: false, message: "User not found" });
  }

  const decryptedPassword = CryptoJS.AES.decrypt(
    user.password,
    secretKey
  ).toString(CryptoJS.enc.Utf8);
  if (decryptedPassword !== password) {
    return res
      .status(400)
      .send({ success: false, message: "Incorrect password" });
  }

  res.send({ success: true, name: user.name });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
