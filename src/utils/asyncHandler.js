// const asyncHandler = (func) => {
//   async (error, req, res, next) => {
//     try{
//         await func(req, res, next);
//     }catch(err){
//         res.status(err.code || 500).json({
//             success: false,
//             message:err.message
//         })
//     }
//   };
// };

// export default asyncHandler;

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export default asyncHandler;
