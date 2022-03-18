import cloudinaryImport, {
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";
import streamifier from "streamifier";
import StatusError from "./StatusError";
const cloudinary = cloudinaryImport.v2;

export const uploadFile = (buffer: Buffer) => {
  return new Promise((resolve, reject) => {
    const cloudUploader = cloudinary.uploader.upload_stream(
      { folder: "market" },
      (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
        if (result) {
          resolve(result);
        } else {
          reject(new StatusError("Image upload error", 500));
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(cloudUploader);
  });
};
