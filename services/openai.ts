const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export interface CardAnalysisResult {
  totalPoints: number;
  cards: string[];
  confidence: number;
  error?: string;
}

export const OpenAIService = {
  async analyzeCards(imageUri: string): Promise<CardAnalysisResult> {
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Analyze this image of Rummy cards and calculate the total points. 
Card values for Rummy scoring:
- Cards A: 15 points each
- Cards 3, 4, 5, 6, 7: 5 points each
- Cards 8, 9, 10, J, Q, K: 10 points each
- Number 2 cards: 20 points each (wild cards)
- Jokers: 50 points each

Respond ONLY with a valid JSON object containing:
{
  "totalPoints": number,
  "cards": ["card1", "card2", ...],
  "confidence": number (0-1)
}`,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: imageUri,
                      detail: "low",
                    },
                  },
                ],
              },
            ],
            max_tokens: 300,
            temperature: 0,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No response from OpenAI");
      }

      // Clean and parse JSON response
      const cleanContent = content.trim().replace(/```json\n?|\n?```/g, "");
      const result = JSON.parse(cleanContent);

      return {
        totalPoints: result.totalPoints || 0,
        cards: result.cards || [],
        confidence: result.confidence || 0,
      };
    } catch (error) {
      console.error("Error analyzing cards:", error);
      return {
        totalPoints: 0,
        cards: [],
        confidence: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
