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
  let keys = [];
  const listObjectsParams = {
    Bucket: BUCKET_NAME,
    Prefix: "fotodaun/",
  };
  const data = await s3.send(new ListObjectsV2Command(listObjectsParams));
  const files = data.Contents;

  keys = files
    .map((data) => {
      return data.Key !== "fotodaun/"
        ? {
            Key: rmdir(data.Key),
            Date: data.LastModified,
          }
        : null;
    })
    .filter(Boolean);

  const promises = keys.map(async (e) => {
    await getData(e);
  });

  await Promise.all(promises);

  res.json(dataFiles);
};

module.exports = { getAllFiles };
