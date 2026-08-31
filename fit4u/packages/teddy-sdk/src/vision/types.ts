export interface VisionAnalysisResult {
  exerciseName?: string;
  observations: {
    posture: string;
    alignment: string;
    stability: string;
    rangeOfMotion?: string;
  };
  corrections: string[];
  confidence: "low" | "medium" | "high";
  disclaimer: string;
}
