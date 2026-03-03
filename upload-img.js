const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');
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
  Key: "pixel.png",
  Body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64"),
  ContentType: "image/png",
});

client.send(command).then(() => console.log('Upload image ok')).catch(console.error);
