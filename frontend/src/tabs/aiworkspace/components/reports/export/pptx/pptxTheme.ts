export const PPTX = {
  width: 13.333,
  height: 7.5,
  margin: 0.55,
  colors: {
    ink: "0B1720",
    muted: "5D6B76",
    soft: "EEF3F1",
    line: "D9E3DF",
    dark: "0B3340",
    dark2: "174B5A",
    white: "FFFFFF",
    green: "047857",
    greenSoft: "E9F8EF",
    red: "B42318",
    redSoft: "FDECEC",
    amber: "A15C07",
    amberSoft: "FFF7E6",
  },
  font: "Aptos",
}

export const slideTitle = {
  fontFace: PPTX.font,
  fontSize: 26,
  bold: true,
  color: PPTX.colors.ink,
  margin: 0,
  breakLine: false,
}

export const eyebrow = {
  fontFace: PPTX.font,
  fontSize: 8.5,
  bold: true,
  color: "8392A0",
  margin: 0,
}

export const bodyText = {
  fontFace: PPTX.font,
  fontSize: 10.5,
  color: PPTX.colors.muted,
  fit: "shrink" as const,
  margin: 0,
  breakLine: false,
}
