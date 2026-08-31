import OpenAI from "openai";

import {
  buildChallengeGenerationPrompt,
  buildNutritionGenerationPrompt,
  buildProgressAnalysisPrompt,
  buildWorkoutGenerationPrompt,
} from "../prompts/systemPrompts";

const MODEL = "gpt-4o-mini";

async function completeJson(openai: OpenAI, prompt: string): Promise<unknown> {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "system", content: prompt }],
    temperature: 0.6,
    response_format: { type: "json_object" },
  });
  const raw = completion.choices[0]?.message.content ?? "{}";
  return JSON.parse(raw) as unknown;
}

export async function generateWorkoutPlanData(
  openai: OpenAI,
  userContext: string,
  params: {
    goalType: string;
    difficultyLevel: string;
    durationWeeks: number;
    sessionsPerWeek: number;
    availableEquipment: string[];
  },
): Promise<unknown> {
  return completeJson(openai, buildWorkoutGenerationPrompt(userContext, params));
}

export async function generateNutritionPlanData(
  openai: OpenAI,
  userContext: string,
  params: { dailyCalorieTarget?: number; dietaryPreferences: string[]; mealsPerDay: number },
): Promise<unknown> {
  return completeJson(openai, buildNutritionGenerationPrompt(userContext, params));
}

export async function generateProgressSummary(
  openai: OpenAI,
  userContext: string,
  rawData: string,
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "system", content: buildProgressAnalysisPrompt(userContext, rawData) }],
    temperature: 0.7,
    max_tokens: 400,
  });
  return completion.choices[0]?.message.content ?? "Analyse indisponible pour le moment.";
}

export async function generateChallengeData(
  openai: OpenAI,
  userContext: string,
  params: { focus: string; durationDays: number },
): Promise<unknown> {
  return completeJson(openai, buildChallengeGenerationPrompt(userContext, params));
}

/**
 * Analyse une photo de repas (Vision) — utilisée par `POST /nutrition/analyze-photo`.
 * L'image est transmise en base64 data URL par l'appelant (jamais stockée par le SDK).
 */
export async function analyzeFoodPhoto(openai: OpenAI, imageBase64DataUrl: string): Promise<unknown> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Tu es Teddy, coach nutrition de Fit4U. Analyse la photo de repas fournie et
réponds UNIQUEMENT avec un objet JSON de la forme :
{ "identifiedFoods": [{ "name": "...", "estimatedGrams": 150 }], "estimatedCalories": 450,
  "estimatedProteinG": 30, "estimatedCarbsG": 40, "estimatedFatG": 15, "confidence": "low"|"medium"|"high" }`,
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyse cette photo de repas." },
          { type: "image_url", image_url: { url: imageBase64DataUrl } },
        ],
      },
    ],
    temperature: 0.4,
    response_format: { type: "json_object" },
    max_tokens: 400,
  });

  return JSON.parse(completion.choices[0]?.message.content ?? "{}") as unknown;
}
