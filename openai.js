"use strict";

/**
 * Generates a completion using the OpenAI chat API.
 * @param {Object} props - An object containing the properties for generating the completion.
 * @param {import('openai').OpenAIApi} props.client - The OpenAI API client instance.
 * @param {Object[]} props.messages - An array of conversation messages.
 * @param {number} [props.temperature=0.7] - The temperature for the completion generation (optional, defaults to 0.7).
 * @param {string} [props.model='gpt-4o'] - The name of the model to use for completion generation (optional, defaults to 'gpt-4o').
 * @param {Object[]} [props.functions=[]] - An array of functions to be used for the completion generation (optional, defaults to an empty array).
 * @param {string} [props.function_call='auto'] - The function call behavior for the completion generation (optional, defaults to 'auto').
 * @returns {Promise<import('openai').ChatCompletionResponseChoicesInner>} A Promise that resolves with the completion response from the OpenAI API.
 */
export async function getCompletion(props) {
  try {
    const {
      client,
      messages,
      temperature = 0.7,
      model = "gpt-4o",
      functions = [],
      function_call = "auto",
    } = props;

    // Check if the client is defined
    if (!client) {
      throw new Error('OpenAI API client is not provided.');
    }

    // Check if messages array is provided and not empty
    if (!messages || messages.length === 0) {
      throw new Error('Messages array is empty or not provided.');
    }

    // Generate completion using OpenAI API
    const completionResponse = await client.chat.completions.create({
      temperature,
      messages,
      model,
      functions,
      function_call,
    });

    return completionResponse;
  } catch (error) {
    // Handle any errors that occur during completion generation
    console.error('An error occurred while generating completion:', error.message);
    // Re-throw the error to propagate it further
    throw error;
  }
}
