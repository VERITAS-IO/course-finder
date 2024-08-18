// routes/functionCallingRoutes.js
import express from "express";
import FunctionCallingsController from "../controllers/FunctionCallingsController.js";

const router = express.Router();

router.post("", FunctionCallingsController.getResponse);

export default router;
