const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;
const busboy = require("busboy");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const streamAndUpload = async (req, res) => {
  try {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return res.status(400).send({ error: "Unsupported content type" });
    }

    const bb = busboy({ headers: req.headers });
    const fileUploads = []; // To store upload promises

    bb.on("file", (name, stream, info) => {
      const { filename, mimeType } = info;
      console.log(`Uploading file: ${filename} with type: ${mimeType}`);

      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "uploaded_files",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) {
              console.log(error);
              reject({ error: "File not uploaded", filename });
            } else {
              console.log("Uploaded: ", result.secure_url);
              resolve({ url: result.secure_url, filename });
            }
          }
        );

        stream.pipe(uploadStream);
      });

      fileUploads.push(uploadPromise);
    });

    bb.on("finish", async () => {
      try {
        const uploadedFiles = await Promise.all(fileUploads); // Wait for all files to upload
        res.status(200).json({ files: uploadedFiles });
      } catch (err) {
        res
          .status(400)
          .json({ error: "Some files failed to upload", details: err });
      }
    });

    req.pipe(bb);
  } catch (e) {
    console.log("error : ", e);
    return res.status(400).json({ error: "Cannot upload file" });
  }
};
module.exports = streamAndUpload;

// delete a file from cloudinary
// export const deleteFile = async (req, res) => {
//   try {
//     const { publicId } = req.body;
//     if (!publicId) return res.status(400).json({ error: "Bad request" });
//     const result = await cloudinary.uploader.destroy(publicId);
//     return res.status(200).json(result);
//   } catch (e) {
//     console.log(e);
//     return res.status(400).json({ error: "cannot delete file" });
//   }
// };
