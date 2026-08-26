const crypto = require("node:crypto");

const secret = process.env.JWT_SECRET || "kernel-local-mock-secret";

const encode = (value) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

const signToken = (extraClaims = {}, expiresInSeconds = 3600) => {
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({
    exp: now + expiresInSeconds,
    iat: now,
    principal_type: "user",
    ...extraClaims,
  });
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
};

const verifyToken = (token) => {
  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return null;

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${payload}`)
      .digest();
    const received = Buffer.from(signature, "base64url");
    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      return null;
    }

    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    return claims.exp > Math.floor(Date.now() / 1000) ? claims : null;
  } catch {
    return null;
  }
};

module.exports = { signToken, verifyToken };
