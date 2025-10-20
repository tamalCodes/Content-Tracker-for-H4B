const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../schema/UserSchema");

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());

const normalizeEmail = (email) => (email || "").trim().toLowerCase();

const GENERIC_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "hotmail.com",
  "protonmail.com",
  "mail.com",
  "yandex.com",
  "gmx.com",
  "live.com",
  "zoho.com",
  "comcast.net",
  "att.net",
  "verizon.net",
  "fastmail.com",
  "rediffmail.com",
  "mail.ru",
  "qq.com",
  "sina.com",
];

const getDomain = (email) => normalizeEmail(email).split("@")[1] || "";

const isGenericDomain = (email) =>
  GENERIC_EMAIL_DOMAINS.includes(getDomain(email));

const BCRYPT_SALT_ROUNDS = parseInt(
  process.env.BCRYPT_SALT_ROUNDS || process.env.BCRYPT_ROUNDS || "10",
  10
);

const isStrongPassword = (pwd = "") => {
  const min = pwd.length >= 12;
  const upper = /[A-Z]/.test(pwd);
  const lower = /[a-z]/.test(pwd);
  const digit = /\d/.test(pwd);
  const special = /[^A-Za-z0-9]/.test(pwd);
  return min && upper && lower && digit && special;
};

const toSafeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user._id,
    email: user.email,
    accountType: user.accountType,
    organizationName: user.organizationName || null,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Checks whether a user account already exists for the provided email.
 */
exports.getEmailStatus = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "A valid email is required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail }).lean();

    const exists = Boolean(user);
    const nextStep = exists
      ? user.accountType === "org"
        ? "signup_org"
        : "signup_generic"
      : isGenericDomain(normalizedEmail)
      ? "signup_generic"
      : "signup_org";

    return res.status(200).json({ exists, nextStep });
  } catch (error) {
    console.error("Auth:getEmailStatus error:", error);
    return res.status(500).json({ message: "Failed to resolve email status" });
  }
};

/**
 * Authenticates a user using email and password and returns a signed JWT.
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !isValidEmail(email) || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are both required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordHash"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return res.status(200).json({
      token,
      user: toSafeUser(user),
    });
  } catch (error) {
    console.error("Auth:loginUser error:", error);
    return res.status(500).json({ message: "Failed to sign in" });
  }
};

/**
 * Creates a new account (generic or organization) based on the provided payload.
 */
exports.createEntry = async (req, res) => {
  try {
    const { email, organization, password } = req.body || {};

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "A valid email is required" });
    }

    if (!password || !isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 12 characters with upper, lower, digit, and special characters",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedOrg = organization?.trim() || "";
    const domainIsGeneric = isGenericDomain(normalizedEmail);
    const accountType = normalizedOrg ? "org" : "generic";

    if (!domainIsGeneric && !normalizedOrg) {
      return res.status(400).json({
        message: "Organization name is required for non-generic domains",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "An account already exists for this email" });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      organizationName: normalizedOrg || null,
      accountType,
      status: "active",
    });

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return res.status(201).json({
      token,
      user: toSafeUser(user),
    });
  } catch (error) {
    console.error("Auth:createEntry error:", error);
    return res.status(500).json({ message: "Failed to create account" });
  }
};
