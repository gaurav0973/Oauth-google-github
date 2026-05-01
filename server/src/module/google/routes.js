import { Router } from "express";
import {
    getGoogleLoginCallbackPage,
    getGoogleLoginPage,
} from "./controller.js";

const googleAuthRouter = Router();

googleAuthRouter.get("/google", getGoogleLoginPage);
googleAuthRouter.get("/google/callback", getGoogleLoginCallbackPage);


export default googleAuthRouter;
