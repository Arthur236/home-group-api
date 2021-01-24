module.exports = {
  nodeEnv: process.env.NODE_ENV,
  devDatabaseUrl: process.env.DEV_DATABASE_URL,
  prodDatabaseUrl: process.env.PROD_DATABASE_URL,
  authTokenSecret: process.env.AUTH_TOKEN_SECRET,
  resetTokenSecret: process.env.RESET_TOKEN_SECRET,
  clientUrl: process.env.CLIENT_URL,
  mailgunApiKey: process.env.MAILGUN_API_KEY,
  mailgunDomain: process.env.MAILGUN_DOMAIN,
};
