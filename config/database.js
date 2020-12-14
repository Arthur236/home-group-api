const { nodeEnv, devDatabaseUrl, prodDatabaseUrl } = require('../config/variables');

let mongoDBUrl = '';

if (nodeEnv === 'development') {
  mongoDBUrl = devDatabaseUrl;
} else if (nodeEnv === 'production') {
  mongoDBUrl = prodDatabaseUrl;
}

module.exports = {
  mongoDBUrl
};
