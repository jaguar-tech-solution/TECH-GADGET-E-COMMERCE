export const validate = (schema) => async (req, res, next) => {
  try {

    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Request body:", req.body);
    /*  const parsed = await schema.parseAsync({
       body: req.body,
       query: req.query,
       params: req.params,
     }); */

    const result = schema.safeParse(req.body)


    // Store validated and transformed data separately
    //req.validated = parsed;

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        errors: result.error.format(), // or result.error.issues
      });
    }

    // Replace req.body with the parsed/sanitized data
    req.body = result.data;


    return next();
  } catch (error) {
    return next(error);
  }
};