let mongoDBUrl = '';

if (process.env.NODE_ENV === 'development') {
  mongoDBUrl = process.env.DEV_DATABASE_URL;
} else if (process.env.NODE_ENV === 'production') {
  mongoDBUrl = process.env.PROD_DATABASE_URL;
}

module.exports = {
  mongoDBUrl
};
