const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path');

const { awsAccessKeyId, awsSecretAccessKey, awsRegion, awsS3BucketName } = require('../config/variables');

AWS.config.update({
  secretAccessKey: awsSecretAccessKey,
  accessKeyId: awsAccessKeyId,
  region: awsRegion
});

const s3 = new AWS.S3();

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

const uploadImage = multer({
  fileFilter,
  storage: multerS3({
    s3: s3,
    bucket: awsS3BucketName,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, path.basename(file.originalname, path.extname(file.originalname)) + '-' + Date.now() + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 5000000 }, // In bytes: 5000000 bytes = 5 MB
});

module.exports = uploadImage;
