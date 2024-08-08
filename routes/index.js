import functionCallingRoutes from "./FunctionCalling.js";

export default function loadRoutes(app) {
  app.use("/api/function-calling", functionCallingRoutes);
}


