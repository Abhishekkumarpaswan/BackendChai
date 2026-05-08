import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { asyncHandler } from "./asyncHandler.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary as the upload operation got failed
    return null;
  }
};

const removeFilefromCloudinary = asyncHandler(async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, (error, result) => {
    if (error) {
      console.log("Error while removing file from cloudinary", error);
    } else {
      console.log("File removed from cloudinary", result);
    }
  });
});

const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{extension}
  // We need to extract the public_id from the URL
  const parts = url.split("/");
  const lastPart = parts[parts.length - 1]; // filename.extension
  const publicId = lastPart.split(".")[0]; // remove extension
  return publicId;
};

export { uploadOnCloudinary, removeFilefromCloudinary, getPublicIdFromUrl };
