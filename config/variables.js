module.exports = {
  nodeEnv: process.env.NODE_ENV,
  devDatabaseUrl: process.env.DEV_DATABASE_URL,
  prodDatabaseUrl: process.env.PROD_DATABASE_URL,
  authTokenSecret: process.env.AUTH_TOKEN_SECRET,
  resetTokenSecret: process.env.RESET_TOKEN_SECRET,
  clientUrl: process.env.CLIENT_URL,
  mailgunApiKey: process.env.MAILGUN_API_KEY,
  mailgunDomain: process.env.MAILGUN_DOMAIN,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION,
  awsS3BucketName: process.env.AWS_S3_BUCKET_NAME,
};
