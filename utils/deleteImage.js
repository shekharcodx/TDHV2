const cloudinary = require("../config/cloudinary");

async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Image Deleted", result);
  } catch (err) {
    console.error("Error deleting image:", err);
  }
}

module.exports = deleteImage;
