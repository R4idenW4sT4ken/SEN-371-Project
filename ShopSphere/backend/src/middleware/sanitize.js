// Strips Mongo operator keys ($gt, $ne, $where, ...) and dotted paths
// out of incoming data before it ever reaches Mongoose, preventing
// NoSQL-injection-style query overrides through body/query/params.
//
// Note: the express-mongo-sanitize package (already listed in
// package.json) reassigns req.query wholesale, which throws under
// Express 5 because req.query is a getter-only property there. This
// middleware does the same job but mutates req.query/req.params in
// place instead of replacing them, so it's safe on Express 5.
function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        continue;
      }
      clean[key] = sanitizeValue(val);
    }
    return clean;
  }

  return value;
}

export function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }

  if (req.query && typeof req.query === "object") {
    const cleaned = sanitizeValue(req.query);
    for (const key of Object.keys(req.query)) {
      if (!(key in cleaned)) {
        delete req.query[key];
      }
    }
    Object.assign(req.query, cleaned);
  }

  if (req.params && typeof req.params === "object") {
    Object.assign(req.params, sanitizeValue(req.params));
  }

  next();
}

export default sanitizeInput;
