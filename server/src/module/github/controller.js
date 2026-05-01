import { generateState } from "arctic";
import { github } from "../../common/oAuth/github.auth.js";
import { User } from "../../common/models/user.model.js";
import { OauthAccount } from "../../common/models/oauthAccount.model.js";
import { generateAccessToken, generateRefreshToken } from "../../common/utils/jwt.js";

const FRONTEND_ORIGIN =
    process.env.FRONTEND_ORIGIN || "http://localhost:5173";

export const getGithubLoginPage = async (req, res) => {
    const state = generateState();

    const url = github.createAuthorizationURL(state, [
        "read:user",
        "user:email",
    ]);

    const cookieOptions = {
        httpOnly: true,
        secure: false,
        maxAge: 5 * 60 * 1000,
        sameSite: "lax",
    };

    res.cookie("github_oauth_state", state, cookieOptions);

    return res.redirect(url.toString());
};

export const getGithubCallbackPage = async (req, res) => {
    const { code, state } = req.query;
    const storedState = req.cookies.github_oauth_state;

    if (!code || !state || !storedState) {
        return res.status(400).send("Invalid request");
    }

    if (state !== storedState) {
        return res.status(400).send("Invalid state");
    }

    let tokens;
    try {
        tokens = await github.validateAuthorizationCode(code);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Token exchange failed");
    }

    const accessToken = tokens.accessToken();

    // 🔥 GitHub user
    const userRes = await fetch("https://api.github.com/user", {
        headers: {
        Authorization: `Bearer ${accessToken}`,
        },
    });

    const githubUser = await userRes.json();
    const { id: githubUserId, login: username, avatar_url } = githubUser;

    // 🔥 GitHub email
    const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
        Authorization: `Bearer ${accessToken}`,
        },
    });

    const emails = await emailRes.json();
    const primaryEmail = emails.find((e) => e.primary)?.email;

    try {
        let oauthAccount = await OauthAccount.findOne({
        provider: "github",
        providerAccountId: githubUserId,
        }).populate("userId");

        let user;

        // ✅ CASE 1: already linked
        if (oauthAccount) {
        user = oauthAccount.userId;
        } else {
        // ✅ CASE 2: user exists
        user = await User.findOne({ email: primaryEmail });

        if (user) {
            await OauthAccount.create({
            userId: user._id,
            provider: "github",
            providerAccountId: githubUserId,
            });
        } else {
            // ✅ CASE 3: new user
            user = await User.create({
            email: primaryEmail,
            username,
            photo: avatar_url,
            });

            await OauthAccount.create({
            userId: user._id,
            provider: "github",
            providerAccountId: githubUserId,
            });
        }
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.clearCookie("github_oauth_state");

        return res.redirect(`${FRONTEND_ORIGIN}/profile`);

    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal error");
    }
};