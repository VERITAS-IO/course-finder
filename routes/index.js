import functionCallingRoutes from "./FunctionCalling.js";

export default function loadRoutes(app) {
  app.use("/function-calling", functionCallingRoutes);
}


