const express = require("express");
const multer = require("multer");
const Content = require("../schema/ContentSchema");
const streamAndUpload = require("../controllers/cloudinaryConfig");
const { google } = require("googleapis");
const fs = require("fs");
const router = express.Router();
const apikeys = require("../apikeys.json");
const upload = multer({ dest: "uploads/" });

const SCOPE = ["https://www.googleapis.com/auth/drive"];

// Authorize Google Drive API
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

async function uploadFile(authClient, file) {
  const drive = google.drive({ version: "v3", auth: authClient });

  const fileMetaData = {
    name: file.originalname,
    parents: [process.env.FOLDER_ID],
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

  // Generate public URL
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: { role: "reader", type: "anyone" },
  });

  const fileUrl = `https://drive.google.com/uc?id=${response.data.id}`;

  fs.unlinkSync(file.path); // Remove temp file

  return {
    id: response.data.id,
    url: fileUrl,
    filename: file.originalname, // <-- Add this line
  };
}

// Create Content with Google Drive File Links
router.post("/create", upload.array("pictures", 10), async (req, res) => {
  try {
    const {
      title,
      description,
      instagram,
      twitter,
      linkedin,
      discord,
      time,
      date,
      type,
    } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    if (!time || !date) {
      return res.status(400).json({ error: "Time and date are required" });
    }

    const authClient = await authorize();

    // Upload images to Google Drive and get their URLs
    const uploadedFiles = await Promise.all(
      req.files.map((file) => uploadFile(authClient, file))
    );

    // Store content in MongoDB with Google Drive file links
    const newContent = new Content({
      title,
      description,
      type: type || "static",
      instagram: instagram || "",
      twitter: twitter || "",
      linkedin: linkedin || "",
      discord: discord || "",
      pictures: uploadedFiles,
      time: new Date(time),
      date: new Date(date),
    });

    await newContent.save();

    res
      .status(201)
      .json({ message: "Content created successfully!", content: newContent });
  } catch (error) {
    console.error("Error creating content:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const contents = await Content.find(
      {},
      "_id updatedAt date time type title description"
    )
      .sort({ updatedAt: -1 }) // Sort by last updated time (latest first)
      .lean();

    // Transform data to include a derived title (first available non-empty platform content)
    const formattedContents = contents.map((content) => ({
      _id: content._id,
      lastUpdated: content.updatedAt,
      date: content.date,
      time: content.time,
      type: content.type,
      description: content.description,
      title: content.title,
    }));

    res.status(200).json(formattedContents);
  } catch (error) {
    console.error("Error fetching contents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const contentId = req.params.id;

    // Find content by ID
    const content = await Content.findById(contentId).lean();

    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.status(200).json(content);
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/update/:id", upload.array("pictures", 10), async (req, res) => {
  try {
    const contentId = req.params.id;

    let {
      title,
      description,
      instagram,
      twitter,
      linkedin,
      discord,
      time,
      date,
      type,
      existingPictures,
    } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    if (!time || !date) {
      return res.status(400).json({ error: "Time and date are required" });
    }

    existingPictures = existingPictures ? JSON.parse(existingPictures) : [];

    // Fetch the existing content
    const existingContent = await Content.findById(contentId);
    if (!existingContent) {
      return res.status(404).json({ error: "Content not found" });
    }

    const authClient = await authorize();
    const drive = google.drive({ version: "v3", auth: authClient });

    // Find images that should be deleted
    const imagesToDelete = existingContent.pictures.filter(
      (pic) => !existingPictures.some((newPic) => newPic.id === pic.id)
    );

    // Delete images from Google Drive
    await Promise.all(
      imagesToDelete.map(async (pic) => {
        try {
          await drive.files.delete({ fileId: pic.id });
          console.log(`✅ Deleted image from Drive: ${pic.filename}`);
        } catch (error) {
          console.error(`❌ Error deleting image ${pic.filename}:`, error);
        }
      })
    );

    // Upload new images to Google Drive
    const newUploadedFiles = await Promise.all(
      req.files.map((file) => uploadFile(authClient, file))
    );

    // Merge existing and newly uploaded images
    const updatedPictures = [...existingPictures, ...newUploadedFiles];

    // Update content with only provided fields
    const updatedContent = await Content.findByIdAndUpdate(
      contentId,
      {
        $set: {
          title,
          description,
          instagram,
          twitter,
          linkedin,
          discord,
          pictures: updatedPictures,
          time: new Date(time),
          date: new Date(date),
          type,
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Content updated successfully!",
      updatedContent,
    });
  } catch (error) {
    console.error("Error updating content:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete Content and Associated Google Drive Files
router.delete("/delete/:id", async (req, res) => {
  try {
    const contentId = req.params.id;
    console.log("🗑️ Deleting content with ID:", contentId);

    // Fetch the content to delete
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    const authClient = await authorize();
    const drive = google.drive({ version: "v3", auth: authClient });

    // Delete associated files from Google Drive
    await Promise.all(
      content.pictures.map(async (pic) => {
        try {
          await drive.files.delete({ fileId: pic.id });
          console.log(`✅ Deleted image from Drive: ${pic.filename}`);
        } catch (error) {
          console.error(
            `❌ Error deleting image ${pic.filename}:`,
            error.message
          );
        }
      })
    );

    // Delete the content document from MongoDB
    await Content.findByIdAndDelete(contentId);

    res.status(200).json({ message: "Task deleted successfully!" });
  } catch (error) {
    console.error("Error deleting content:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/upload", (req, res) => streamAndUpload(req, res));

module.exports = router;
