import cloudinaryImport, {
  ResponseCallback,
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

export const deleteFile = (url: string) => {
  return new Promise((resolve, reject) => {
    // Get image id from url
    const imageId = url
      .slice(0, url.length - 5)
      .split("/")
      .at(-1);
    cloudinary.uploader.destroy("market/" + imageId!, {}, (error: any, result: any) => {
      if (result) {
        resolve(result);
      } else {
        reject(new StatusError("Image deletion error", 500));
      }
    });
  });
};
