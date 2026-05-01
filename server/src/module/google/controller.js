import { decodeIdToken, generateCodeVerifier, generateState } from "arctic";
import { google } from "../../common/oAuth/google.auth.js";
import { OauthAccount } from "../../common/models/oauthAccount.model.js";
import { User } from "../../common/models/user.model.js";
import { generateToken } from "../../common/utils/jwt.js";

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

export const getGoogleLoginPage = async (req, res) => {
  const state = generateState();
  console.log("Generated State 👉", state);

  const codeVerifier = generateCodeVerifier();
  console.log("Generated Code Verifier 👉", codeVerifier);

  const scopes = ["openid", "profile", "email"];
  const url = google.createAuthorizationURL(state, codeVerifier, scopes);
  console.log("AUTH URL 👉", url.toString());

  // setup in cookies
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 5 * 60 * 1000, // 5 minutes
    sameSite: "lax",
  };
  res.cookie("google_oauth_state", state, cookieOptions);
  res.cookie("google_code_verifier", codeVerifier, cookieOptions);

  return res.redirect(url.toString());
};




export const getGoogleLoginCallbackPage = async (req, res) => {
    const { code, state } = req.query;
    console.log("Received Code 👉", code);
    console.log("Received State 👉", state);
    if (!code || !state) {
        return res.status(400).send("Missing code or state in the callback URL");
    }
    // jo cookies me hai and jo query me aaya hai unka state match karna chahiye
    const storedState = req.cookies.google_oauth_state;
    const codeVerifier = req.cookies.google_code_verifier;
    if (!storedState || !codeVerifier) {
        return res
        .status(400)
        .send("Missing stored state or code verifier in cookies");
    }
    if (storedState !== state) {
        return res.status(400).send("Invalid state parameter");
    }

    let tokens;
    try {
        tokens = await google.validateAuthorizationCode(code, codeVerifier);
        console.log("Received Token 👉", tokens);
    } catch (error) {
        console.error("Error validating authorization code:", error);
        return res
        .status(500)
        .send("Error occurred while validating authorization code");
    }

    const claims = decodeIdToken(tokens.idToken());
    const { sub: googleUserId, email, name, picture } = claims;

    try {
        // 🔥 STEP 1 — Check OAuthAccount first
        let oauthAccount = await OauthAccount.findOne({
            provider: "google",
            providerAccountId: googleUserId,
        }).populate("userId");

        if (oauthAccount) {
            // ✅ CASE 1: already linked
            console.log("✅ Existing Google user");

            const user = oauthAccount.userId;
            console.log("User from DB 👉", user);

            // TODO: generate JWT and set cookie here for real app
            const token = generateToken(user._id);

            res.cookie("token", token, {
                httpOnly: true,
                secure: false, // change to true in production (HTTPS)
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            // clear temp OAuth cookies
            res.clearCookie("google_oauth_state");
            res.clearCookie("google_code_verifier");

            return res.redirect(`${FRONTEND_ORIGIN}/profile`);
        }

        // 🔥 STEP 2 — Check if user exists by email
        let user = await User.findOne({ email });

        if (user) {
            // ✅ CASE 2: user exists but not linked
            console.log("🔗 Linking Google to existing user");

            await OauthAccount.create({
                userId: user._id,
                provider: "google",
                providerAccountId: googleUserId,
            });

            // TODO: generate JWT and set cookie here for real app
            const token = generateToken(user._id);

            res.cookie("token", token, {
                httpOnly: true,
                secure: false, // change to true in production (HTTPS)
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            // clear temp OAuth cookies
            res.clearCookie("google_oauth_state");
            res.clearCookie("google_code_verifier");
            return res.redirect(`${FRONTEND_ORIGIN}/profile`);
        }

        // 🔥 STEP 3 — completely new user
        console.log("🆕 Creating new user");

        user = await User.create({
            email,
            username: name, // optional
        });

        await OauthAccount.create({
            userId: user._id,
            provider: "google",
            providerAccountId: googleUserId,
        });

        // TODO: generate JWT and set cookie here for real app
        const token = generateToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // change to true in production (HTTPS)
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // clear temp OAuth cookies
        res.clearCookie("google_oauth_state");
        res.clearCookie("google_code_verifier");

        return res.redirect(`${FRONTEND_ORIGIN}/profile`);

    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
};
