const AWS = require('aws-sdk');

const { awsAccessKeyId, awsRegion, awsSecretAccessKey, awsS3BucketName } = require('../config/variables');

const s3 = new AWS.S3({
  accessKeyId: awsAccessKeyId,
  secretAccessKey: awsSecretAccessKey,
  region: awsRegion
});

const uploadToAWS = async (file) => {
  const fileName = `${new Date().getTime()}_${file.name}`;
  const mimetype = file.mimetype;

  const params = {
    Bucket: awsS3BucketName,
    Key: fileName,
    Body: file.data,
    ContentType: mimetype,
    ACL: 'public-read'
  };

  const res = await new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => err == null ? resolve(data) : reject(err));
  });

  return { photoUrl: res.Location, photoName: fileName };
};

const deleteFile = async (fileName) => {
  const params = {
    Bucket: awsS3BucketName,
    Key: fileName,
  };

  const res = await new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, data) => err == null ? resolve(data) : reject(err));
  });

  return res;
};

module.exports = {
  uploadToAWS,
  deleteFile
};
