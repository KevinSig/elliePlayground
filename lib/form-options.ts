import type { DoseOption, TimeOption } from "./reassessment-types"

export const DOSES: DoseOption[] = [
  {
    value: "10units",
    label: "10 units weekly (0.25mg Semaglutide)",
    tier: 1,
    tierName: "Tier 1",
    productId: "T1_RAMP",
  },
  {
    value: "15units",
    label: "15 units weekly (0.38mg Semaglutide)",
    tier: 1.5,
    tierName: "Tier 1.5",
    productId: "T1_MAINTAIN",
  },
  { value: "20units", label: "20 units weekly (0.5mg Semaglutide)", tier: 2, tierName: "Tier 2", productId: "T2_RAMP" },
  {
    value: "30units",
    label: "30 units weekly (0.75mg Semaglutide)",
    tier: 2.5,
    tierName: "Tier 2.5",
    productId: "T2_MAINTAIN",
  },
  { value: "40units", label: "40 units weekly (1.0mg Semaglutide)", tier: 3, tierName: "Tier 3", productId: "T3_RAMP" },
  {
    value: "5units_micro",
    label: "Microdose (5 units weekly Semaglutide)",
    tier: 0.5,
    tierName: "Microdose",
    productId: "MICRO_MAINTAIN",
  }, // Assuming microdose is tier 0.5 for logic
]

export const TIME_ON_MEDICATION_OPTIONS: TimeOption[] = [
  { value: "lessthan1month", label: "< 1 month", months: 0.5 },
  { value: "1month", label: "1 month", months: 1 },
  { value: "lessthan2months", label: "< 2 months", months: 1.5 }, // For Tier 1 TEL logic
  { value: "2months", label: "2 months", months: 2 },
  { value: "lessthan3months", label: "< 3 months", months: 2.5 }, // For Tier 2 TEL logic
  { value: "3months", label: "3 months", months: 3 },
  { value: "4months", label: "4 months", months: 4 },
  { value: "5months", label: "5 months", months: 5 },
  { value: "6plusmonths", label: "6+ months", months: 6 },
]

export const WEIGHT_LOSS_OPTIONS = [
  { value: "gaining_weight", label: "I'm gaining weight", wls: -2, flag: "Important" },
  { value: "0-1pounds", label: "0-1 pounds", wls: -1 },
  { value: "2-3pounds", label: "2-3 pounds", wls: 0 },
  { value: "4-6pounds", label: "4-6 pounds", wls: 1 },
  { value: "7-12pounds", label: "7-12 pounds", wls: 2 },
  { value: "13-20pounds", label: "13-20 pounds", wls: 3, flag: "Important" },
  { value: "gt20pounds", label: "More than 20 pounds", wls: 4, flag: "Critical" },
]

export const SIDE_EFFECT_OPTIONS = [
  { value: "No side effects", label: "No side effects", ses: 0 },
  { value: "Mild nausea (manageable)", label: "Mild nausea (manageable)", ses: 1 },
  { value: "Moderate nausea", label: "Moderate nausea", ses: 2 }, // Branch to nausea management
  {
    value: "Significant vomiting",
    label: "Significant vomiting (e.g., multiple times a day, unable to keep fluids down)",
    ses: 4,
    flag: "Critical",
  },
  {
    value: "Abdominal pain (severe or persistent)",
    label: "Abdominal pain (severe or persistent)",
    ses: 4,
    flag: "Critical",
  }, // Doc1: SES 4, Doc2: SES 4
  {
    value: "Dizziness (severe or causing falls)",
    label: "Dizziness (severe or causing falls)",
    ses: 4,
    flag: "Critical",
  }, // Doc1: SES 5, Doc2: SES 4. Using 4 from Doc2 for now.
  { value: "Chest pain", label: "Chest pain", ses: 5, flag: "Critical" }, // Doc1: SES 5, Doc2: SES 5
  { value: "Other", label: "Other (please specify below)", ses: 1 }, // Default SES for "Other", physician review needed
]

export const APPETITE_CONTROL_OPTIONS = [
  { value: "always_hungry", label: "I'm always hungry!", ass: -2 },
  { value: "somewhat_decreased", label: "Somewhat decreased appetite", ass: -1 },
  { value: "just_right", label: "Yes, just where I want to be", ass: 0 },
  { value: "too_much_suppression", label: "Way too much appetite suppression, can't eat", ass: 3, flag: "Important" },
]

export const FOOD_CRAVINGS_OPTIONS = [
  { value: "not_really", label: "Not really" },
  { value: "sometimes", label: "Sometimes" },
  { value: "quite_often", label: "Quite often" },
]

export const SATISFACTION_OPTIONS = [
  { value: 1, label: "Very Unhappy", pss: -2 },
  { value: 2, label: "Unhappy", pss: -1 },
  { value: 3, label: "Neutral", pss: 0 },
  { value: 4, label: "Happy", pss: 1 },
  { value: 5, label: "Very Happy", pss: 2 },
]

export const PATIENT_PREFERENCE_OPTIONS = [
  { value: "increase", label: "Increase my dose" },
  { value: "maintain", label: "Stay at the same dose" },
  { value: "decrease", label: "Decrease my dose" },
  { value: "unsure", label: "I'm not sure, please recommend" },
]

export const EFFORT_OPTIONS = [
  { value: "dietician", label: "Seen a dietician" },
  { value: "calories", label: "Decreased calorie intake" },
  { value: "exercise", label: "Started exercise program" },
  { value: "stress", label: "Working on stress management" },
  { value: "none", label: "None of the above" },
]
