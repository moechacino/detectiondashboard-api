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

const getVideo = async (req, res) => {
  let dataFiles = [];

  const getData = async (keys) => {
    let getObjectParams = {
      Bucket: BUCKET_NAME,
      Key: `fotopemilik/${keys.Key}`,
    };
    try {
      const headObjectData = await s3.send(
        new HeadObjectCommand(getObjectParams)
      );

      const userMetadata = headObjectData.Metadata;
      const date = new Date(keys.Date);
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command);
      let namapemilik;
      let buzzer;
      if (userMetadata["detection"] === "unknown") {
        buzzer = true;
      } else {
        buzzer = false;
      }
      if (userMetadata["namapemilik"] === "unknown") {
        namapemilik = "unknown";
      } else {
        namapemilik = userMetadata["namapemilik"];
      }
      dataFiles.push({
        key: keys.Key,
        namapemilik: namapemilik,
        date: date.toDateString(),
        time: date.toTimeString(),
        detection: userMetadata["detection"],
        image_url: url,
        buzzer_condition: buzzer,
      });
    } catch (error) {
      console.error(`Error getting metadata for ${keys.Key}:`, error);
    }
  };

  const listObjectsParams = {
    Bucket: BUCKET_NAME,
    Prefix: "fotopemilik/",
  };
  const data = await s3.send(new ListObjectsV2Command(listObjectsParams));
  const files = data.Contents;
  const sortedFiles = files.sort(
    (a, b) =>
      new Date(b.LastModified).getTime() - new Date(a.LastModified).getTime()
  );

  for (const file of sortedFiles) {
    if (file.Key !== "fotopemilik/") {
      const key = rmdir(file.Key);
      const date = file.LastModified;

      await getData({ Key: key, Date: date });
    }
  }

  res.json(dataFiles);
};

module.exports = { getVideo };
