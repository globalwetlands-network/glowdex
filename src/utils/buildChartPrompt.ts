export type ChartPromptType =
  | "distribution"
  | "unusual"
  | "drivers";

export function buildChartPrompt(
  indicatorLabel: string,
  promptType: ChartPromptType
): string {
  const lowercaseLabel = indicatorLabel.toLowerCase();

  switch (promptType) {
    case "distribution":
      return `What does the violin plot show about ${lowercaseLabel} in this location?`;

    case "unusual":
      return `How unusual is the ${lowercaseLabel} value compared to the typology distribution?`;

    case "drivers":
      return `What ecological factors might explain why this location has a high ${lowercaseLabel} value?`;
  }
}
