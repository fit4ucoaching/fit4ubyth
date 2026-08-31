/**
 * Config Tailwind pour NativeWind — les couleurs/espacements/rayons pointent
 * TOUJOURS vers les tokens partagés de @fit4u/ui (jamais de valeur en dur),
 * pour rester visuellement identique au web (même palette, même échelle).
 */
const { darkPalette, spacing, radius } = require("@fit4u/ui");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: darkPalette.background,
        surface: darkPalette.surface,
        surfaceElevated: darkPalette.surfaceElevated,
        primary: darkPalette.primary,
        primaryMuted: darkPalette.primaryMuted,
        textPrimary: darkPalette.textPrimary,
        textSecondary: darkPalette.textSecondary,
        border: darkPalette.border,
        success: darkPalette.success,
        warning: darkPalette.warning,
        danger: darkPalette.danger,
      },
      spacing: Object.fromEntries(Object.entries(spacing).map(([k, v]) => [k, `${v}px`])),
      borderRadius: Object.fromEntries(Object.entries(radius).map(([k, v]) => [k, `${v}px`])),
    },
  },
  plugins: [],
};
