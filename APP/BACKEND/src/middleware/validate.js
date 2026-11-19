export const validate = (schema) => async (req, res, next) => {
  try {

    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Request body:", req.body);


    const result = schema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        errors: result.error.format(),
      });
    }

    req.body = result.data;


    return next();
  } catch (error) {
    return next(error);
  }
}; 