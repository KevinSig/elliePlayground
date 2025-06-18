export interface FormData {
  currentDose: string // e.g., "10units"
  timeOnCurrentMedication: string // e.g., "lessthan2months"
  dateOfLastDose: string
  weightLoss4Weeks: string // e.g., "0-1pounds"
  currentWeight: string
  sideEffects: string[] // e.g., ["Mild nausea", "Other"]
  otherSideEffectText: string
  nauseaMedicationPreference: string // "yes" | "no"
  appetiteControl: string // e.g., "always_hungry"
  foodCravings: string // e.g., "not_really"
  satisfactionRating: number // 1-5
  missedDoses4Weeks: string
  patientPreference: string // "increase", "maintain", "decrease", "unsure"
  weightGainEfforts: string[] // e.g., ["dietician", "calories"]
}

export interface Scores {
  WLS: number
  SES: number
  ASS: number
  PSS: number
  TEL: number
  TRS: number
  experienceLevel: "beginner" | "intermediate" | "expert"
  numericTier: number
}

export interface RecommendationResult {
  primaryRecommendation: string
  primaryProductId?: string
  reasoning: string
  alternativeRecommendations?: { recommendation: string; productId: string }[]
  safetyFlags: string[]
  importantFlags: string[]
  criticalFlags: string[]
  requiresPhysicianReview: boolean
  criticalAlert?: { title: string; description: string }
  scores: Scores
}

export interface DoseOption {
  value: string
  label: string
  tier: number // Numeric tier for logic
  tierName: string // Tier 1, Tier 1.5 etc.
  productId: string
}

export interface TimeOption {
  value: string
  label: string
  months: number // Numeric months for logic
}

export interface ExperienceLevelDetails {
  level: "beginner" | "intermediate" | "expert"
  tel: number
  numericTier: number
  timeOnMedMonths: number
}
