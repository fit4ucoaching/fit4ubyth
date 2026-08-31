import OpenAI from "openai";

import type { VisionAnalysisResult } from "./types";

const VISION_DISCLAIMER = `Cette analyse est une observation visuelle générale, pas un diagnostic
médical ni une mesure biomécanique précise. En cas de douleur ou de doute sur ta technique,
consulte un coach sportif ou un professionnel de santé en présentiel.`;

/**
 * Module Vision — Premium (Volume 5). Analyse QUALITATIVE d'une photo
 * d'exécution d'exercice via un LLM multimodal (même pattern que
 * `nutrition.analyzeFoodPhoto`). "Aucun diagnostic médical, toujours
 * rappeler les limites de l'analyse" est appliqué à la lettre : le
 * disclaimer est codé en dur, jamais laissé à la discrétion du prompt.
 *
 * LIMITATION IMPORTANTE (transparence, pas de simplification silencieuse) :
 * une mesure précise d'amplitude/vitesse/angles articulaires nécessite un
 * pipeline d'estimation de pose dédié (MediaPipe Pose, OpenPose) opérant
 * sur une séquence vidéo — hors du périmètre d'un LLM multimodal sur image
 * fixe. Ce module fournit un retour qualitatif utile (posture générale,
 * alignement visible, conseils), pas une mesure biomécanique.
 */
export async function analyzeExerciseForm(
  openai: OpenAI,
  imageBase64DataUrl: string,
  exerciseName?: string,
): Promise<VisionAnalysisResult> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Tu es Teddy, coach fitness. Analyse cette photo d'exécution d'exercice
${exerciseName ? `("${exerciseName}")` : ""} et donne un retour qualitatif bienveillant sur la
posture, l'alignement visible et la stabilité apparente. Ne donne AUCUN diagnostic médical, ne
mesure aucun angle précis (tu ne peux pas le faire de façon fiable sur une image fixe) — reste
sur des observations visuelles générales et des conseils actionnables.
Réponds en JSON strict : { "observations": { "posture": "...", "alignment": "...", "stability": "..." },
"corrections": ["..."], "confidence": "low"|"medium"|"high" }`,
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyse ma posture sur cet exercice." },
          { type: "image_url", image_url: { url: imageBase64DataUrl } },
        ],
      },
    ],
    temperature: 0.4,
    response_format: { type: "json_object" },
    max_tokens: 400,
  });

  const parsed = JSON.parse(completion.choices[0]?.message.content ?? "{}") as Omit<
    VisionAnalysisResult,
    "disclaimer" | "exerciseName"
  >;

  return { ...parsed, exerciseName, disclaimer: VISION_DISCLAIMER };
}

export * from "./types";
