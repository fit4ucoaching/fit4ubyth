import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import de from "./locales/de.json";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import it from "./locales/it.json";
import pt from "./locales/pt.json";

/** Config i18next web — mêmes clés que mobile (Volume 1/4), langue par défaut fr. */
void i18next.use(initReactI18next).init({
  resources: {
    fr: { translation: fr }, en: { translation: en }, es: { translation: es },
    de: { translation: de }, it: { translation: it }, pt: { translation: pt },
  },
  lng: "fr",
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

export default i18next;
