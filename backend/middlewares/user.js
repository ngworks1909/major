const zod = require("zod");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const nameSchema = zod.string().min(3);
const emailSchema = zod.string().email();
const passwordSchema = zod.string().min(5);

const validateUser = (req, res, next) => {
  const email = req.body["email"];
  const password = req.body["password"];
  const emailResult = emailSchema.safeParse(email);
  const passwordResult = passwordSchema.safeParse(password);

  if ( emailResult.success && passwordResult.success) {
    next();
  } else {
    next({ status: 400, success: false, error: "Invalid credentials..." });
  }
};

const validateCredentials = (req, res, next) => {
  const email = req.body["email"];
  const password = req.body["password"];
  const emailResult = emailSchema.safeParse(email);
  const passwordResult = zod.string().min(1).safeParse(password);
  if (emailResult.success && passwordResult.success) {
    next();
  } else {
    next({ status: 400, success: false, error: "Invalid credentials..." });
  }
};

const fetchUser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res
      .status(400)
      .json({ error: "Please validate using valid auth token..." });
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(400).json({ error: "Please authenticate using valid token..." });
  }
};

module.exports = { validateUser, validateCredentials, fetchUser};