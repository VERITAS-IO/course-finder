import express from "express";
import helmet from "helmet";
import config from "./config/index.js";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import loadRoutes from "./routes/index.js";
import globalErrorHandler from "./middlewares/error.js";
import ApiError from "./models/errors/ApiError.js"
import httpStatus from "http-status";
import Messages from "./constants/messages/index.js";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url); //get all name
const __dirname = path.dirname(__filename); //get dir name from it.

config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // replace with your frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors()) // include before other route

app.use("/uploads", express.static(path.join(__dirname, "./", "uploads")));
app.use(express.json()); //TIP: to use json files in the js.
app.use(helmet()); //TIP: Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!
app.use(fileUpload()); //TIP:When you upload a file, the file will be accessible from req.files.

loadRoutes(app); //import route usings from another module. => funciton-calling/getResponse => buldu ama hata aldi

//404 handler
app.use((req, res, next) => {
  const error = new ApiError(
    Messages.ERROR.PAGE_NOT_FOUND,
    httpStatus.NOT_FOUND
  );
  next(error);
});

app.use(globalErrorHandler); //INFO: if you use () globalErrorHandler middleware will be invoked immediately when app starts running.

app.listen(process.env.APP_PORT, () => {
  console.log("server is listening on port " + process.env.APP_PORT);
});
