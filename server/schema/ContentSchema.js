const mongoose = require("mongoose");

const PictureSchema = new mongoose.Schema({
  id: { type: String, required: true }, // Google Drive file ID
  url: { type: String, required: true }, // Public URL for accessing the file
  filename: { type: String, required: true }, // Original filename
});

const ContentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    instagram: {
      type: String,
      default: "",
    },
    discord: {
      type: String,
      default: "",
    },
    twitter: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    pictures: [PictureSchema],

    time: {
      type: Date,
      required: true, // Content must have a deadline
    },
    date: {
      type: Date,
      required: true, // Content must have a deadline
    },

    type: {
      type: String,
      enum: ["static", "video", "live"],
      default: "static",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Content", ContentSchema);
