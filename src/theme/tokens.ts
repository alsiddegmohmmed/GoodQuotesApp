export const colors = {
  bg: "#0B0B0D",
  surface: "#121317",
  surface2: "#1A1C21",
  surface3: "#22252C",
  text: "#F5F5F2",
  textSoft: "#C8CBD2",
  textMuted: "#8B909A",
  line: "#2A2D34",
  white: "#FFFFFF",
  accentPrimary: "#E8E3D6",
  accentSecondary: "#8E98A7",
  accentWarm: "#C7A98B",
} as const;

export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, xxl: 40 } as const;
export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;

export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: "700" },
  title: { fontSize: 22, lineHeight: 28, fontWeight: "700" },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
  meta: { fontSize: 12, lineHeight: 16, fontWeight: "500" },
} as const;
