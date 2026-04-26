import { GoogleGenerativeAI } from "@google/generative-ai";

// GET KEY FROM ENV
const genAI = new GoogleGenerativeAI(
  process.env.REACT_APP_GEMINI_KEY
);

// CREATE MODEL
export const model = genAI.getGenerativeModel({
  model: "gemini-pro",
});