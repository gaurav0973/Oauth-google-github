import { generateState } from "arctic";
import { github } from "../../common/oAuth/github.auth.js";
import { User } from "../../common/models/user.model.js";
import { OauthAccount } from "../../common/models/oauthAccount.model.js";

export const getGithubLoginPage = async (req, res) => {
    const state = generateState();

    const url = github.createAuthorizationURL(state, ["read:user", "user:email"]);
    console.log("Generated GitHub Auth URL 👉", url.toString());
    const cookieOptions = {
        httpOnly: true,
        secure: false, // ⚠️ localhost
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

    // 🔥 Fetch GitHub user
    const userRes = await fetch("https://api.github.com/user", {
        headers: {
        Authorization: `Bearer ${accessToken}`,
        },
    });

    const githubUser = await userRes.json();

    const { id: githubUserId, login: username, avatar_url } = githubUser;

  // 🔥 Fetch email separately (GitHub quirk)
    const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
        Authorization: `Bearer ${accessToken}`,
        },
    });

    const emails = await emailRes.json();
    const primaryEmail = emails.find((e) => e.primary)?.email;

    try {
        // ✅ STEP 1 — check OAuthAccount
        let oauthAccount = await OauthAccount.findOne({
        provider: "github",
        providerAccountId: githubUserId,
        }).populate("userId");

        if (oauthAccount) {
        return res.json({
            message: "Login successful (GitHub)",
            user: oauthAccount.userId,
        });
        }

        // ✅ STEP 2 — check existing user
        let user = await User.findOne({ email: primaryEmail });

        if (user) {
        await OauthAccount.create({
            userId: user._id,
            provider: "github",
            providerAccountId: githubUserId,
        });

        return res.json({
            message: "GitHub linked",
            user,
        });
        }

        // ✅ STEP 3 — create new user
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

        return res.json({
        message: "User created via GitHub",
        user,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal error");
    }
};