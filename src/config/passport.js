// src/config/passport.js
// ─────────────────────────────────────────────────────────────────────────────
// Passport is an authentication middleware for Node.js.
// We configure TWO strategies here:
//   1. JwtStrategy  — for protecting API routes using JWT tokens
//   2. GoogleStrategy — for Google OAuth2 login ("Sign in with Google")
// ─────────────────────────────────────────────────────────────────────────────

const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const pool = require("./db"); // Our database connection
const { v4: uuidv4 } = require("uuid"); // Generates unique IDs

// ── 1. JWT STRATEGY ──────────────────────────────────────────────────────────
// This strategy reads the JWT from the Authorization header (Bearer token).
// On every protected route, Passport automatically validates the token and
// attaches the decoded user to req.user.

const jwtOptions = {
  // Extract the token from the "Authorization: Bearer <token>" header
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

  // The same secret used to sign tokens — must match what's in authController
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    // jwtPayload is the decoded token data (we stored { id, email, role } in it)
    try {
      // Look up the user by the ID stored in the token payload
      const result = await pool.query(
        "SELECT id, name, email, role, avatar FROM users WHERE id = $1",
        [jwtPayload.id]
      );

      if (result.rows.length === 0) {
        // User no longer exists in DB (maybe deleted) — reject the token
        return done(null, false);
      }

      // Token is valid and user exists — attach user to req.user
      return done(null, result.rows[0]);
    } catch (err) {
      return done(err, false);
    }
  })
);

// ── 2. GOOGLE OAUTH2 STRATEGY ────────────────────────────────────────────────
// This strategy handles the Google "Sign in with Google" flow.
// When a user clicks "Login with Google", they're redirected to Google,
// they approve access, and Google sends back their profile info.
// We then find or create a user in our database.

// ── 2. GOOGLE OAUTH2 STRATEGY ────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const name = profile.displayName;
          const avatar = profile.photos[0]?.value;
          const googleId = profile.id;

          let result = await pool.query(
            "SELECT * FROM users WHERE google_id = $1", [googleId]
          );
          if (result.rows.length > 0) return done(null, result.rows[0]);

          result = await pool.query(
            "SELECT * FROM users WHERE email = $1", [email]
          );
          if (result.rows.length > 0) {
            await pool.query(
              "UPDATE users SET google_id = $1, avatar = $2 WHERE email = $3",
              [googleId, avatar, email]
            );
            return done(null, result.rows[0]);
          }

          const newUser = await pool.query(
            `INSERT INTO users (id, name, email, google_id, avatar, role)
             VALUES ($1, $2, $3, $4, $5, 'jobseeker') RETURNING *`,
            [uuidv4(), name, email, googleId, avatar]
          );
          return done(null, newUser.rows[0]);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
  console.log("✅ Google OAuth strategy registered");
} else {
  console.log("⚠️  Google OAuth disabled — GOOGLE_CLIENT_ID not set in .env");
}

// Passport serialize/deserialize — needed for session support during OAuth flow
// Only the user ID is stored in the session cookie
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
