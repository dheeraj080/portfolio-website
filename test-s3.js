const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
import { config } from "dotenv";

config({ path: ".env" });


const client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const command = new PutObjectCommand({
  Bucket: "portfolio-animation1",
  Key: "test-image.txt",
  Body: "Hello world!",
  ContentType: "text/plain",
});

client.send(command).then(console.log).catch(console.error);
