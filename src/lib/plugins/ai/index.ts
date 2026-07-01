import { GoogleGenerativeAI } from "@google/generative-ai"
import { createClient } from "@/utils/supabase/server"

export interface AIProvider {
  verifySubmission(
    apiKey: string, 
    systemPrompt: string, 
    userText: string | null, 
    fileBase64?: string, 
    mimeType?: string
  ): Promise<{ score: number, reasoning: string }>
}

export class GeminiProvider implements AIProvider {
  async verifySubmission(
    apiKey: string, 
    systemPrompt: string, 
    userText: string | null,
    fileBase64?: string,
    mimeType?: string
  ) {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } })

    const fullPrompt = `
      ${systemPrompt}

      The user has submitted the following proof for the task.
      User Text: ${userText || "No text provided"}

      Analyze the submission (text and/or image/pdf if attached).
      Determine if it meets the requirements of the task.
      
      Respond STRICTLY in this JSON format:
      {
        "score": <number between 0 and 100 representing your confidence that the task was completed correctly>,
        "reasoning": "<a short, constructive paragraph explaining your decision to the user>"
      }
    `

    const parts: any[] = [{ text: fullPrompt }]

    if (fileBase64 && mimeType) {
      parts.push({
        inlineData: {
          data: fileBase64,
          mimeType: mimeType
        }
      })
    }

    const result = await model.generateContent(parts)
    const response = await result.response
    const json = JSON.parse(response.text())

    return {
      score: json.score,
      reasoning: json.reasoning
    }
  }
}

export const aiClient: AIProvider = new GeminiProvider()
