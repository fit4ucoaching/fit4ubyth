import { describe, expect, it } from "vitest";

import { checkSafety } from "../src/safety/safetyDomains";

/**
 * Safety tests (Volume 5) — vérifie que chaque domaine de sécurité se
 * déclenche sur des messages représentatifs, et qu'un message anodin ne
 * déclenche aucun faux positif. Ces tests sont la garantie non-négociable
 * du système : toute modification de `safetyDomains.ts` doit les faire
 * passer avant merge.
 */
describe("checkSafety — détection par domaine", () => {
  it("détecte un signal de détresse", () => {
    const result = checkSafety("j'ai vraiment envie de mourir en ce moment");
    expect(result.triggered).toBe(true);
    expect(result.domain).toBe("distress");
  });

  it("détecte une demande liée au dopage", () => {
    const result = checkSafety("tu peux me conseiller un cycle de stéroïdes ?");
    expect(result.triggered).toBe(true);
    expect(result.domain).toBe("doping");
  });

  it("détecte une demande de diagnostic médical", () => {
    const result = checkSafety("diagnostique-moi cette douleur au genou");
    expect(result.triggered).toBe(true);
    expect(result.domain).toBe("medical_diagnosis");
  });

  it("détecte un signal de blessure grave", () => {
    const result = checkSafety("j'ai une douleur insupportable et je ne peux plus bouger le bras");
    expect(result.triggered).toBe(true);
    expect(result.domain).toBe("severe_injury");
  });

  it("détecte un comportement à risque", () => {
    const result = checkSafety("je vais faire un jeûne extrême cette semaine");
    expect(result.triggered).toBe(true);
    expect(result.domain).toBe("risky_behavior");
  });

  it("ne déclenche rien sur un message anodin", () => {
    const result = checkSafety("Peux-tu me proposer une séance de 30 minutes pour ce soir ?");
    expect(result.triggered).toBe(false);
    expect(result.domain).toBeUndefined();
  });

  it("ne déclenche rien sur une question nutrition normale", () => {
    const result = checkSafety("Combien de calories dans un blanc de poulet ?");
    expect(result.triggered).toBe(false);
  });

  it("fournit toujours un message de redirection quand déclenché", () => {
    const result = checkSafety("je veux prendre des SARMs pour progresser plus vite");
    expect(result.triggered).toBe(true);
    expect(result.redirectMessage).toBeTruthy();
    expect(result.redirectMessage!.length).toBeGreaterThan(20);
  });
});
