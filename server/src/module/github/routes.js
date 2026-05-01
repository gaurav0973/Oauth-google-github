import { Router } from "express";
import {
    getGithubLoginPage,
    getGithubCallbackPage,
} from "./controller.js";

const githubRouter = Router();

githubRouter.get("/github", getGithubLoginPage);
githubRouter.get("/github/callback", getGithubCallbackPage);

export default githubRouter;