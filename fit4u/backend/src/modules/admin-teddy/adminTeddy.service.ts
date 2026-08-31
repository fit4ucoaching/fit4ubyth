import OpenAI from "openai";

import { TEDDY_GLOBAL_SAFETY_PROMPT, TEDDY_IDENTITY_PROMPT } from "@fit4u/teddy-sdk";
import { env } from "../../config/env";
import { promptOverrideService } from "../../services/promptOverride.service";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

/**
 * Aperçu de prompt (Volume 6 : "tester des prompts") — appel OpenAI
 * DIRECT et minimal, jamais via `initiateTeddyTurn()` (qui exigerait une
 * mémoire utilisateur complète, hors-sujet pour tester un simple TON de
 * réponse). Toujours l'identité + la sécurité globale (jamais désactivables,
 * même en aperçu) + le Domain Prompt candidat.
 */
export async function previewDomainPrompt(candidateContent: string, sampleMessage: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: `${TEDDY_IDENTITY_PROMPT}\n\n${TEDDY_GLOBAL_SAFETY_PROMPT}\n\n${candidateContent}` },
      { role: "user", content: sampleMessage },
    ],
    temperature: 0.7,
    max_tokens: 400,
  });

  return completion.choices[0]?.message.content ?? "Aucune réponse générée.";
}

export { promptOverrideService };
