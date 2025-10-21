const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../schema/UserSchema");

const { google } = require("googleapis");

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const SERVER_BASE_URL = process.env.SERVER_BASE_URL || "http://localhost:5000";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  `${SERVER_BASE_URL.replace(/\/$/, "")}/auth/google/callback`;

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
const RESET_TOKEN_EXPIRY_MINUTES = parseInt(
  process.env.RESET_TOKEN_EXPIRY_MINUTES || "30",
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

const ensureGoogleConfig = () => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error(
      "Google OAuth configuration is missing. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
    );
  }
};

const createOAuthClient = () => {
  ensureGoogleConfig();
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
};

const randomPasswordHash = async () => {
  const randomSecret = crypto.randomBytes(32).toString("hex");
  return bcrypt.hash(randomSecret, BCRYPT_SALT_ROUNDS);
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
    name: user.name || null,
    avatarUrl: user.avatarUrl || null,
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

/**
 * Handles client logout requests. JWTs are stateless, so we simply acknowledge.
 */
exports.logoutUser = async (_req, res) => {
  try {
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Auth:logoutUser error:", error);
    return res.status(500).json({ message: "Failed to logout" });
  }
};

/**
 * Initiates the Google OAuth flow by redirecting the user to Google.
 */
exports.startGoogleAuth = async (_req, res) => {
  try {
    const oauth2Client = createOAuthClient();
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
    });

    return res.redirect(authUrl);
  } catch (error) {
    console.error("Auth:startGoogleAuth error:", error);
    return res
      .status(500)
      .json({ message: "Google authentication is not configured correctly" });
  }
};

/**
 * Handles the Google OAuth callback, issuing a JWT and redirecting back to the client.
 */
exports.handleGoogleCallback = async (req, res) => {
  try {
    const { code } = req.query || {};

    if (!code) {
      return res.status(400).json({ message: "Missing OAuth code" });
    }

    const oauth2Client = createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();
    const email = data?.email;
    const name = data?.name;
    const picture = data?.picture;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Unable to retrieve email from Google" });
    }

    const normalizedEmail = normalizeEmail(email);
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const domainIsGeneric = isGenericDomain(normalizedEmail);
      const passwordHash = await randomPasswordHash();

      user = await User.create({
        email: normalizedEmail,
        passwordHash,
        accountType: domainIsGeneric ? "generic" : "org",
        organizationName: domainIsGeneric
          ? null
          : normalizedEmail.split("@")[1],
        name: name || null,
        avatarUrl: picture || null,
        status: "active",
      });
    }

    let shouldUpdate = false;
    if (name && user.name !== name) {
      user.name = name;
      shouldUpdate = true;
    }
    if (picture && user.avatarUrl !== picture) {
      user.avatarUrl = picture;
      shouldUpdate = true;
    }
    if (shouldUpdate) {
      await user.save();
    }

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    const safeUser = toSafeUser(user);
    const payload = Buffer.from(JSON.stringify({ ...safeUser, picture })).toString(
      "base64"
    );

    const redirectUrl = new URL("/auth", FRONTEND_URL);
    redirectUrl.searchParams.set("provider", "google");
    redirectUrl.searchParams.set("token", token);
    redirectUrl.searchParams.set("user", payload);

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Auth:handleGoogleCallback error:", error);
    return res.status(500).json({ message: "Failed to authenticate with Google" });
  }
};

const buildResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
};

/**
 * Generates a password reset token for the provided email address.
 */
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "A valid email is required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Do not reveal whether the email exists.
      return res.status(200).json({
        success: true,
        message:
          "If an account exists for this email, a reset link has been generated.",
      });
    }

    const { rawToken, tokenHash } = buildResetToken();
    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
    );

    user.resetTokenHash = tokenHash;
    user.resetTokenExpiry = expiresAt;
    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset link generated. Use the provided token to reset your password.",
      resetToken: rawToken,
      expiresAt,
    });
  } catch (error) {
    console.error("Auth:requestPasswordReset error:", error);
    return res
      .status(500)
      .json({ message: "Failed to initiate password reset" });
  }
};

/**
 * Resets the user's password using a valid reset token.
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body || {};

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Reset token is required" });
    }

    if (!password || !isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 12 characters with upper, lower, digit, and special characters",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetTokenHash: tokenHash,
      resetTokenExpiry: { $gt: new Date() },
    }).select("+passwordHash");

    if (!user) {
      return res.status(400).json({
        message: "Reset token is invalid or has expired",
      });
    }

    user.passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    user.resetTokenHash = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    const newToken = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return res.status(200).json({
      token: newToken,
      user: toSafeUser(user),
    });
  } catch (error) {
    console.error("Auth:resetPassword error:", error);
    return res.status(500).json({ message: "Failed to reset password" });
  }
};
