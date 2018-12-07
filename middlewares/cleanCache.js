const {
  clearHash
} = require('../services/cache');

module.exports = async (req, res, next) => {
  await next();
  console.log('ryanhssn');
  clearHash(req.user.id);
}