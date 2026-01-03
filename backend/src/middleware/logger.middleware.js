/**
 * Request logging middleware
 */
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  console.log('[Request] Headers:', JSON.stringify(req.headers, null, 2));
  console.log('[Request] Body:', JSON.stringify(req.body, null, 2));
  next();
};

/**
 * Response logging middleware
 */
export const responseLogger = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function (data) {
    console.log('[Response] Status:', res.statusCode);
    console.log('[Response] Body:', data);
    originalSend.call(this, data);
  };
  
  next();
};


