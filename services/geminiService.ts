import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  /**
   * Refines a user's rough goal draft into a SMART goal.
   */
  async makeGoalSmart(draftGoal: string): Promise<{
    title: string;
    description: string;
    metric: string;
    timebound: string;
    reasoning: string;
  }> {
    if (!process.env.API_KEY) throw new Error("API Key missing");

    const prompt = `
      You are an expert Performance Management Coach. 
      Convert the following vague goal into a SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goal.
      
      User's Draft: "${draftGoal}"

      Return a JSON object with the following structure:
      {
        "title": "A concise, action-oriented title",
        "description": "Detailed description of what is to be achieved",
        "metric": "The specific measure of success (M)",
        "timebound": "A suggested timeframe or deadline (T)",
        "reasoning": "Brief explanation of why this is better"
      }
      Do not include markdown code blocks. Just the JSON string.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      
      const text = response.text || "{}";
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini SMART Goal Error:", error);
      throw error;
    }
  },

  /**
   * Helps a manager write constructive feedback.
   */
  async improveFeedback(rawFeedback: string, tone: 'constructive' | 'praise' = 'constructive'): Promise<string> {
    if (!process.env.API_KEY) throw new Error("API Key missing");

    const prompt = `
      You are an HR specialist. Rewrite the following feedback to be more professional, actionable, and ${tone}.
      Ensure it follows the Situation-Behavior-Impact (SBI) model if possible.
      
      Raw Input: "${rawFeedback}"
      
      Output only the improved feedback text.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || rawFeedback;
    } catch (error) {
      console.error("Gemini Feedback Error:", error);
      return rawFeedback;
    }
  }
};