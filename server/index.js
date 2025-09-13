const connectToMongo = require("./db");
const express = require("express");
var cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const { google } = require("googleapis");
const apikeys = require("./apikeys.json");
const multer = require("multer");
const SCOPE = ["https://www.googleapis.com/auth/drive"];
const path = require("path");
const bodyParser = require("body-parser");
const FOLDER_ID = process.env.FOLDER_ID;

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir }); // Safe now

let port = process.env.PORT || 5000;
const app = express();
dotenv.config();
connectToMongo();

app.use(bodyParser.json({ limit: "10000mb" }));

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("HELLO FROM API");
});

app.use("/content", require("./routes/Content"));

async function authorize() {
  const jwtClient = new google.auth.JWT(
    apikeys.client_email,
    null,
    apikeys.private_key,
    SCOPE
  );
  await jwtClient.authorize();
  return jwtClient;
}

// Upload file to Google Drive
async function uploadFile(authClient, file) {
  const drive = google.drive({ version: "v3", auth: authClient });

  const fileMetaData = {
    name: file.originalname,
    parents: [FOLDER_ID],
  };

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path),
  };

  const response = await drive.files.create({
    resource: fileMetaData,
    media: media,
    fields: "id",
  });

  fs.unlinkSync(file.path); // Remove temp file
  return response.data.id;
}

// Express API Route
app.post("/upload", upload.array("files"), async (req, res) => {
  try {
    const authClient = await authorize();
    const fileUploadPromises = req.files.map((file) =>
      uploadFile(authClient, file)
    );
    const fileIds = await Promise.all(fileUploadPromises);

    res.json({ success: true, fileIds });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("HELLO FROM API");
});

app.listen(port, () => console.log("API IS RUNNING 🚀 at port:", port));
