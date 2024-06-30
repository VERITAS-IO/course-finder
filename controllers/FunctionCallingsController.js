// controllers/functionCallingController.js
import FunctionCallingService from "../services/FunctionCallingService.js";

class FunctionCallingsController {
  constructor() {}
  async getResponse(req, res, next) {
    try {
      const { userInput, resourceFlags } = req.body;
      const chatMessages = [
        {
          role: "system",
          content:
            "Be precise, funny and give a humorous answer, not only list the videos, but explain them and create a natural response instead of listing links like a robot",
        },
        {
          role: "user",
          content: `${userInput}`,
        },
      ];
      const response = await FunctionCallingService.getResponse(
        chatMessages,
        resourceFlags
      );
      const parsedResponse = JSON.parse(response);
      res.status(200).json({ parsedResponse});
    } catch (error) {
      next(error);
    }
  }
}

export default new FunctionCallingsController();
