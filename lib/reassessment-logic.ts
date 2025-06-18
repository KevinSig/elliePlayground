import type { FormData, Scores, RecommendationResult, ExperienceLevelDetails } from "./reassessment-types"
import {
  DOSES,
  WEIGHT_LOSS_OPTIONS,
  SIDE_EFFECT_OPTIONS,
  APPETITE_CONTROL_OPTIONS,
  SATISFACTION_OPTIONS,
  TIME_ON_MEDICATION_OPTIONS,
} from "./form-options"

export function getExperienceLevelDetails(currentDoseTier: number, timeOnMedMonths: number): ExperienceLevelDetails {
  let tel = 0
  let level: "beginner" | "intermediate" | "expert"

  if (currentDoseTier === 1) {
    // Tier 1
    tel = timeOnMedMonths < 2 ? 1 : 2
  } else if (currentDoseTier === 1.5) {
    // Tier 1.5 - treat as Tier 1 experienced for TEL
    tel = 2
  } else if (currentDoseTier === 2) {
    // Tier 2
    tel = timeOnMedMonths < 3 ? 2 : 3
  } else if (currentDoseTier === 2.5) {
    // Tier 2.5 - treat as Tier 2 experienced for TEL
    tel = 3
  } else if (currentDoseTier === 3) {
    // Tier 3
    tel = 4
  } else {
    // Microdose or other
    tel = 4 // Default to expert for unknown/micro
  }

  // UI Experience Level from Implementation Guide
  if (currentDoseTier <= 2 && timeOnMedMonths < 3) {
    level = "beginner"
  } else if (currentDoseTier <= 2 && timeOnMedMonths >= 3) {
    level = "intermediate"
  } else {
    level = "expert"
  }
  // If TEL implies higher experience, use that for UI level
  if (tel === 3 && level === "beginner") level = "intermediate"
  if (tel === 4 && (level === "beginner" || level === "intermediate")) level = "expert"

  return { level, tel, numericTier: currentDoseTier, timeOnMedMonths }
}

function calculateWLS(weightLoss4Weeks: string): number {
  return WEIGHT_LOSS_OPTIONS.find((opt) => opt.value === weightLoss4Weeks)?.wls ?? 0
}

function calculateSES(sideEffects: string[]): {
  score: number
  criticalFlags: string[]
  hasCriticalVomiting: boolean
  hasSevereSymptoms: boolean
} {
  let maxScore = 0
  const criticalFlags: string[] = []
  let hasCriticalVomiting = false
  let hasSevereSymptoms = false

  if (sideEffects.includes("No side effects"))
    return { score: 0, criticalFlags, hasCriticalVomiting, hasSevereSymptoms }

  sideEffects.forEach((seValue) => {
    const option = SIDE_EFFECT_OPTIONS.find((opt) => opt.value === seValue)
    if (option && option.ses > maxScore) {
      maxScore = option.ses
    }
    if (option?.flag === "Critical") {
      criticalFlags.push(option.label)
    }
    if (seValue === "Significant vomiting") hasCriticalVomiting = true
    if (option?.ses === 5) hasSevereSymptoms = true // e.g. Chest pain
  })
  return { score: maxScore, criticalFlags, hasCriticalVomiting, hasSevereSymptoms }
}

function calculateASS(appetiteControl: string): number {
  return APPETITE_CONTROL_OPTIONS.find((opt) => opt.value === appetiteControl)?.ass ?? 0
}

function calculatePSS(satisfactionRating: number): number {
  return SATISFACTION_OPTIONS.find((opt) => opt.value === satisfactionRating)?.pss ?? 0
}

function calculateTEL(
  currentDoseValue: string,
  timeOnMedValue: string,
): { tel: number; numericTier: number; timeOnMedMonths: number } {
  const doseInfo = DOSES.find((d) => d.value === currentDoseValue)
  const timeInfo = TIME_ON_MEDICATION_OPTIONS.find((t) => t.value === timeOnMedValue)

  if (!doseInfo || !timeInfo) return { tel: 1, numericTier: 1, timeOnMedMonths: 0 } // Default if not found

  const numericTier = doseInfo.tier
  const months = timeInfo.months

  if (numericTier === 1) return { tel: months < 2 ? 1 : 2, numericTier, timeOnMedMonths: months }
  if (numericTier === 1.5) return { tel: 2, numericTier, timeOnMedMonths: months } // Experienced beginner
  if (numericTier === 2) return { tel: months < 3 ? 2 : 3, numericTier, timeOnMedMonths: months }
  if (numericTier === 2.5) return { tel: 3, numericTier, timeOnMedMonths: months } // Experienced intermediate
  if (numericTier === 3) return { tel: 4, numericTier, timeOnMedMonths: months }
  return { tel: 4, numericTier, timeOnMedMonths: months } // Default to expert for microdose or others
}

export function calculateScoresAndRecommendation(
  formData: FormData,
  experienceDetails: ExperienceLevelDetails,
): RecommendationResult {
  const { tel, numericTier, experienceLevel, timeOnMedMonths } = experienceDetails

  const WLS = calculateWLS(formData.weightLoss4Weeks)
  const {
    score: SES,
    criticalFlags: sesCriticalFlags,
    hasCriticalVomiting,
    hasSevereSymptoms,
  } = calculateSES(formData.sideEffects)
  const ASS = calculateASS(formData.appetiteControl)
  const PSS = calculatePSS(formData.satisfactionRating)
  const TRS = WLS * 2 + SES * -1.5 + ASS * 1 + PSS * 0.5

  const scores: Scores = { WLS, SES, ASS, PSS, TEL: tel, TRS, experienceLevel, numericTier }

  let primaryRecommendation = "Consult with healthcare provider."
  let primaryProductId: string | undefined = undefined
  let reasoning = "Standard consultation needed."
  const alternativeRecommendations: { recommendation: string; productId: string }[] = []
  const safetyFlags: string[] = []
  const importantFlags: string[] = []
  const criticalFlags: string[] = [...sesCriticalFlags]
  let requiresPhysicianReview = false
  let criticalAlert: { title: string; description: string } | undefined = undefined

  // Populate importantFlags from form options
  const wlsOption = WEIGHT_LOSS_OPTIONS.find((opt) => opt.value === formData.weightLoss4Weeks)
  if (wlsOption?.flag === "Important") importantFlags.push(`Weight loss: ${wlsOption.label}`)
  if (wlsOption?.flag === "Critical") criticalFlags.push(`Weight loss: ${wlsOption.label}`)

  const appetiteOption = APPETITE_CONTROL_OPTIONS.find((opt) => opt.value === formData.appetiteControl)
  if (appetiteOption?.flag === "Important") importantFlags.push(`Appetite: ${appetiteOption.label}`)

  // Critical Safety Overrides
  if (hasSevereSymptoms || SES >= 5) {
    // SES 5 from "Chest pain" etc.
    primaryRecommendation = "STOP MEDICATION & SEEK IMMEDIATE MEDICAL CARE"
    reasoning =
      "Severe symptoms reported (e.g., chest pain, severe dizziness). This requires immediate medical attention."
    safetyFlags.push("Discontinue medication immediately.", "Contact your doctor or emergency services.")
    criticalAlert = {
      title: "Critical Health Alert!",
      description:
        "You've reported severe symptoms. Please stop your medication and seek immediate medical attention from your doctor or emergency services.",
    }
    requiresPhysicianReview = true
    criticalFlags.push("Severe symptoms reported - Emergency Protocol Triggered")
    return {
      primaryRecommendation,
      reasoning,
      alternativeRecommendations,
      safetyFlags,
      importantFlags,
      criticalFlags,
      requiresPhysicianReview,
      criticalAlert,
      scores,
      primaryProductId,
    }
  }

  if (WLS >= 4) {
    // Dangerously fast weight loss (>20 lbs in 4 weeks)
    primaryRecommendation = "DECREASE DOSE - Mandatory"
    reasoning = "Weight loss is dangerously fast. Dose decrease is required. Medical consultation needed."
    safetyFlags.push("Your weight loss rate is very high. A dose decrease and medical consultation are mandatory.")
    requiresPhysicianReview = true
    criticalFlags.push("Dangerously fast weight loss - Medical Consultation Required")
    // Suggest next lower tier or specific decrease logic
    const currentDose = DOSES.find((d) => d.tier === numericTier)
    if (currentDose) {
      const lowerDose = DOSES.slice()
        .reverse()
        .find((d) => d.tier < currentDose.tier) // Find next lower tier
      if (lowerDose) {
        primaryProductId = lowerDose.productId
        primaryRecommendation = `DECREASE DOSE to ${lowerDose.label}`
      } else {
        primaryRecommendation = `DECREASE DOSE (specifics TBD by physician)`
      }
    }
    return {
      primaryRecommendation,
      reasoning,
      alternativeRecommendations,
      safetyFlags,
      importantFlags,
      criticalFlags,
      requiresPhysicianReview,
      criticalAlert,
      scores,
      primaryProductId,
    }
  }

  if (hasCriticalVomiting && SES === 4) {
    // Significant vomiting
    primaryRecommendation = "DECREASE DOSE - Mandatory"
    reasoning = "Significant vomiting reported. Dose decrease is required. Consider anti-nausea medication."
    safetyFlags.push(
      "Significant vomiting requires a dose decrease. Your physician may also prescribe anti-nausea medication.",
    )
    requiresPhysicianReview = true
    criticalFlags.push("Significant vomiting - Dose Decrease & Anti-Nausea Offered")
    const currentDose = DOSES.find((d) => d.tier === numericTier)
    if (currentDose) {
      const lowerDose = DOSES.slice()
        .reverse()
        .find((d) => d.tier < currentDose.tier)
      if (lowerDose) {
        primaryProductId = lowerDose.productId
        primaryRecommendation = `DECREASE DOSE to ${lowerDose.label}`
      } else {
        primaryRecommendation = `DECREASE DOSE (specifics TBD by physician)`
      }
    }
    if (formData.nauseaMedicationPreference === "yes") {
      importantFlags.push("Patient requested nausea medication.")
    }
    return {
      primaryRecommendation,
      reasoning,
      alternativeRecommendations,
      safetyFlags,
      importantFlags,
      criticalFlags,
      requiresPhysicianReview,
      criticalAlert,
      scores,
      primaryProductId,
    }
  }

  // Adherence Check
  const missedDoses = Number.parseInt(formData.missedDoses4Weeks)
  if (WLS <= -1 && missedDoses > 2) {
    // Too slow weight loss and missed > 2 doses
    primaryRecommendation = "MAINTAIN DOSE & FOCUS ON ADHERENCE"
    reasoning = `You've missed ${missedDoses} doses. Consistent medication use is key before considering a dose change.`
    safetyFlags.push("Focus on taking your medication as prescribed for the next 4 weeks.")
    primaryProductId = DOSES.find((d) => d.tier === numericTier)?.productId
    return {
      primaryRecommendation,
      reasoning,
      alternativeRecommendations,
      safetyFlags,
      importantFlags,
      criticalFlags,
      requiresPhysicianReview,
      criticalAlert,
      scores,
      primaryProductId,
    }
  }

  // Decision Matrix & Tier-Specific Logic
  // This is a simplified interpretation. A full matrix would be more complex.
  // General TRS based recommendations first
  if (TRS >= 4 && WLS >= 3) {
    primaryRecommendation = "DECREASE DOSE"
    reasoning = "Weight loss is progressing very quickly. A dose decrease is recommended."
    requiresPhysicianReview = true
    const lowerDose = DOSES.slice()
      .reverse()
      .find((d) => d.tier < numericTier)
    primaryProductId = lowerDose?.productId
    if (lowerDose) primaryRecommendation = `DECREASE DOSE to ${lowerDose.label}`
  } else if (TRS >= 2 && TRS < 4 && WLS >= 1 && WLS <= 2 && SES <= 2) {
    primaryRecommendation = "INCREASE DOSE"
    reasoning = "Good progress with tolerable side effects. An increase may optimize results."
    const higherDose = DOSES.find((d) => d.tier > numericTier)
    primaryProductId = higherDose?.productId
    if (higherDose) primaryRecommendation = `INCREASE DOSE to ${higherDose.label}`
    else primaryRecommendation = "INCREASE DOSE (Consider max dose or consult)"
  } else if (TRS >= -1 && TRS < 2 && WLS >= 0 && WLS <= 1 && SES <= 1) {
    primaryRecommendation = "MAINTAIN DOSE"
    reasoning = "You're in an ideal range. Let's maintain this effective level."
    primaryProductId = DOSES.find((d) => d.tier === numericTier)?.productId
    // Maintenance Tier Logic (Simplified)
    if (WLS === 0 && PSS >= 1 && SES <= 1) {
      reasoning += " This is a perfect state for maintenance. Consider a maintenance tier if available."
      if (numericTier === 1) {
        const maint15 = DOSES.find((d) => d.tierName === "Tier 1.5")
        if (maint15)
          alternativeRecommendations.push({
            recommendation: `Move to Maintenance ${maint15.label}`,
            productId: maint15.productId,
          })
      } else if (numericTier === 2) {
        const maint25 = DOSES.find((d) => d.tierName === "Tier 2.5")
        if (maint25)
          alternativeRecommendations.push({
            recommendation: `Move to Maintenance ${maint25.label}`,
            productId: maint25.productId,
          })
      }
    }
  } else if (TRS < -1 && WLS <= 0 && SES <= 2) {
    primaryRecommendation = "INCREASE DOSE"
    reasoning = "Progress seems insufficient. An increase may be beneficial, provided adherence is good."
    const higherDose = DOSES.find((d) => d.tier > numericTier)
    primaryProductId = higherDose?.productId
    if (higherDose) primaryRecommendation = `INCREASE DOSE to ${higherDose.label}`
    else primaryRecommendation = "INCREASE DOSE (Consider max dose or consult)"
  } else if (SES >= 3 && SES < 5) {
    // Moderate to concerning side effects not yet critical (SES 3)
    primaryRecommendation = "DECREASE DOSE or MAINTAIN WITH CAUTION"
    reasoning = "Side effects are concerning. Consider decreasing dose or maintaining with close monitoring."
    requiresPhysicianReview = true
    const lowerDose = DOSES.slice()
      .reverse()
      .find((d) => d.tier < numericTier)
    primaryProductId = lowerDose?.productId // Default to decrease
    if (lowerDose) {
      primaryRecommendation = `DECREASE DOSE to ${lowerDose.label}`
      const currentDoseProduct = DOSES.find((d) => d.tier === numericTier)
      if (currentDoseProduct)
        alternativeRecommendations.push({
          recommendation: `MAINTAIN ${currentDoseProduct.label} with caution`,
          productId: currentDoseProduct.productId,
        })
    } else {
      primaryRecommendation = `MAINTAIN DOSE with caution` // If no lower dose
      primaryProductId = DOSES.find((d) => d.tier === numericTier)?.productId
    }
  }

  // Tier-Specific Adjustments (Simplified - overlays or refines above)
  if (experienceLevel === "beginner" || tel <= 2) {
    // Tier 1 users (TEL 1 or 2)
    // Hand-holding, limited choices, safety first
    if (primaryRecommendation.includes("INCREASE")) {
      const currentTierInfo = DOSES.find((d) => d.tier === numericTier)
      let targetTierProductId: string | undefined
      let targetTierLabel: string | undefined

      if (numericTier === 1) {
        // From Tier 1
        const tier2 = DOSES.find((d) => d.tierName === "Tier 2")
        if (tier2) {
          targetTierProductId = tier2.productId
          targetTierLabel = tier2.label
        }
      } else if (numericTier === 1.5) {
        // From Tier 1.5
        const tier2 = DOSES.find((d) => d.tierName === "Tier 2")
        if (tier2) {
          targetTierProductId = tier2.productId
          targetTierLabel = tier2.label
        }
      }
      // Cap increase for beginners
      if (targetTierProductId && targetTierLabel) {
        primaryRecommendation = `INCREASE DOSE to ${targetTierLabel}`
        primaryProductId = targetTierProductId
        reasoning = "Conservative increase recommended for your experience level."
      } else if (currentTierInfo) {
        // If can't go higher or already at Tier 2
        primaryRecommendation = `MAINTAIN DOSE at ${currentTierInfo.label}`
        primaryProductId = currentTierInfo.productId
        reasoning = "Maintaining current dose. Consult physician for further increases."
      }
    }
    if (primaryRecommendation.includes("MAINTAIN") && WLS === 0 && PSS >= 1 && SES <= 1 && numericTier === 1) {
      const tier1_5 = DOSES.find((d) => d.tierName === "Tier 1.5")
      if (tier1_5) {
        primaryRecommendation = `MOVE TO MAINTENANCE TIER: ${tier1_5.label}`
        primaryProductId = tier1_5.productId
        reasoning = "Excellent progress on Tier 1. Moving to Tier 1.5 for maintenance is recommended."
      }
    }
  } else if (experienceLevel === "intermediate" || tel === 3) {
    // Tier 2 users (TEL 3)
    // Guided choices, more flexibility
    if (primaryRecommendation.includes("INCREASE") && numericTier === 2) {
      const tier3 = DOSES.find((d) => d.tierName === "Tier 3")
      if (tier3) {
        primaryRecommendation = `INCREASE DOSE to ${tier3.label}`
        primaryProductId = tier3.productId
      }
    }
    if (primaryRecommendation.includes("MAINTAIN") && WLS === 0 && PSS >= 1 && SES <= 1 && numericTier === 2) {
      const tier2_5 = DOSES.find((d) => d.tierName === "Tier 2.5")
      if (tier2_5) {
        primaryRecommendation = `MOVE TO MAINTENANCE TIER: ${tier2_5.label}`
        primaryProductId = tier2_5.productId
        reasoning = "Excellent progress on Tier 2. Moving to Tier 2.5 for maintenance is recommended."
      }
    }
  } else if (experienceLevel === "expert" || tel === 4) {
    // Tier 3 users (TEL 4)
    // Full autonomy - present options
    reasoning = `As an experienced user, here's data-driven insight: TRS=${TRS.toFixed(1)}, WLS=${WLS}, SES=${SES}, ASS=${ASS}, PSS=${PSS}. Consider these options:`
    const currentDoseInfo = DOSES.find((d) => d.tier === numericTier)
    if (currentDoseInfo) {
      alternativeRecommendations.push({
        recommendation: `Continue ${currentDoseInfo.label}`,
        productId: currentDoseInfo.productId,
      })
    }
    DOSES.forEach((d) => {
      if (d.tier !== numericTier) {
        // Add other tiers as alternatives
        alternativeRecommendations.push({ recommendation: `Switch to ${d.label}`, productId: d.productId })
      }
    })
    // If patient preference is provided, highlight it or make it primary if safe
    if (formData.patientPreference && formData.patientPreference !== "unsure") {
      const preferredDoseChange = formData.patientPreference // "increase", "decrease", "maintain"
      let preferredOption: { recommendation: string; productId: string } | undefined

      if (preferredDoseChange === "increase") {
        const higherDose = DOSES.find((d) => d.tier > numericTier)
        if (higherDose)
          preferredOption = { recommendation: `Increase to ${higherDose.label}`, productId: higherDose.productId }
      } else if (preferredDoseChange === "decrease") {
        const lowerDose = DOSES.slice()
          .reverse()
          .find((d) => d.tier < numericTier)
        if (lowerDose)
          preferredOption = { recommendation: `Decrease to ${lowerDose.label}`, productId: lowerDose.productId }
      } else {
        // maintain
        if (currentDoseInfo)
          preferredOption = {
            recommendation: `Maintain ${currentDoseInfo.label}`,
            productId: currentDoseInfo.productId,
          }
      }

      if (preferredOption && primaryRecommendation !== preferredOption.recommendation) {
        // Check if it's safe (basic check, more robust needed)
        if (!primaryRecommendation.includes("STOP MEDICATION") && !primaryRecommendation.includes("Mandatory")) {
          primaryRecommendation = `PATIENT PREFERENCE: ${preferredOption.recommendation}`
          primaryProductId = preferredOption.productId
          reasoning = `Based on your preference and overall assessment. Original system suggestion was different. TRS=${TRS.toFixed(1)}.`
        } else {
          importantFlags.push(`Patient preferred ${preferredDoseChange} but system override due to safety/efficacy.`)
        }
      }
    }
  }

  if (criticalFlags.length > 0 || safetyFlags.length > 0 || importantFlags.length > 0) {
    requiresPhysicianReview = true
  }

  return {
    primaryRecommendation,
    primaryProductId,
    reasoning,
    alternativeRecommendations,
    safetyFlags,
    importantFlags,
    criticalFlags,
    requiresPhysicianReview,
    criticalAlert,
    scores,
  }
}
