// Wrap async functions with this utility
const catchAsync = (fn) => {
    return (req, res, next) => {
      fn(req, res, next).catch(next);
    };
  };
  
  module.exports = catchAsync;
  