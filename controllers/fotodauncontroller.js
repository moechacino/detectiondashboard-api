const s3 = require("../models/s3model");
const {
  GetObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const BUCKET_NAME = process.env.BUCKET_NAME;

const rmdir = (val) => {
  return val.split("/").pop();
};

const getAllFiles = async (req, res) => {
  let dataFiles = [];

  const getData = async (keys) => {
    let getObjectParams = {
      Bucket: BUCKET_NAME,
      Key: `fotodaun/${keys.Key}`,
    };
    try {
      const headObjectData = await s3.send(
        new HeadObjectCommand(getObjectParams)
      );

      const userMetadata = headObjectData.Metadata;
      const date = new Date(keys.Date);
      const command = new GetObjectCommand(getObjectParams);

      const url = await getSignedUrl(s3, command);
      dataFiles.push({
        key: keys.Key,
        date: date.toDateString(),
        time: date.toTimeString(),
        prediction: userMetadata["prediction"],
        image_url: url,
      });
    } catch (error) {
      console.error(`Error getting metadata for ${keys.Key}:`, error);
    }
  };

  const listObjectsParams = {
    Bucket: BUCKET_NAME,
    Prefix: "fotodaun/",
  };
  const data = await s3.send(new ListObjectsV2Command(listObjectsParams));
  const files = data.Contents;

  const sortedFiles = files.sort(
    (a, b) =>
      new Date(b.LastModified).getTime() - new Date(a.LastModified).getTime()
  );

  for (const file of sortedFiles) {
    if (file.Key !== "fotodaun/") {
      const key = rmdir(file.Key);
      const date = file.LastModified;

      await getData({ Key: key, Date: date });
    }
  }

  res.json(dataFiles);
};

module.exports = { getAllFiles };
