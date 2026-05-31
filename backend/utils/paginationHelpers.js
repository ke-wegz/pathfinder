/**
 * Helper to build pagination options for Mongoose queries
 */
const getPaginationOptions = (page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  
  return {
    skip: (pageNum - 1) * limitNum,
    limit: limitNum
  };
};

module.exports = {
  getPaginationOptions
};
