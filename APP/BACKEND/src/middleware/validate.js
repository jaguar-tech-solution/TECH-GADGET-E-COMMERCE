export const validate = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Replace with validated/sanitized input, ensuring fallback structures remain intact
    req.body = parsed.body || {};
    req.query = parsed.query || {};
    req.params = parsed.params || {};
    
    return next();
  } catch (error) {
    return next(error);
  }
};