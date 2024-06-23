import { createAuth } from "../../utils.js";
import resourceConstants from "../../constants/ResourceConstants.js";

export const headers = {
  Accept: "*/*",
  Authorization: createAuth(resourceConstants.UDEMY),
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Content-Type": "application/json",
};
