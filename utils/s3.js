const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const mime = require("mime-types");

const s3 = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadFile = async (buffer, folder, filename) => {
  try {
    const key = `${folder}/${Date.now()}-${filename}`;
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mime.lookup(filename) || "application/octet-stream",
    });

    await s3.send(command);
    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return { url, key, filename };
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
};

const deleteFile = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });
    await s3.send(command);
    console.log(`File deleted: ${key}`);
    return true;
  } catch (err) {
    console.error("Error deleting file:", err);
    return false;
  }
};

const getFile = async (key) => {
  try {
    console.log("key", key);
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });
    const response = await s3.send(command);
    const fileBuffer = await streamToBuffer(response.Body);
    return {
      buffer: fileBuffer,
      contentType: response.ContentType,
      fileName: key.split("/").pop(),
    };
  } catch (err) {
    console.error("Error getting file:", err);
    return null;
  }
};

const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
};

module.exports = { uploadFile, deleteFile, getFile };
