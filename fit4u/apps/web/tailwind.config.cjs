/**
 * Config Tailwind Web — mêmes tokens que NativeWind (apps/mobile), pour une
 * identité visuelle strictement identique entre plateformes (Volume 4).
 * Expose light ET dark via des variables CSS (voir src/theme/global.css),
 * NativeWind n'ayant pas cette contrainte (thème résolu côté JS).
 */
const { spacing, radius } = require("@fit4u/ui");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        surfaceElevated: "var(--color-surface-elevated)",
        primary: "var(--color-primary)",
        primaryMuted: "var(--color-primary-muted)",
        textPrimary: "var(--color-text-primary)",
        textSecondary: "var(--color-text-secondary)",
        textTertiary: "var(--color-text-tertiary)",
        border: "var(--color-border)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
      },
      spacing: Object.fromEntries(Object.entries(spacing).map(([k, v]) => [k, `${v}px`])),
      borderRadius: Object.fromEntries(Object.entries(radius).map(([k, v]) => [k, `${v}px`])),
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
