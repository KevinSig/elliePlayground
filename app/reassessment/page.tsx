"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Smile, Frown, Meh, Laugh, Angry, AlertTriangle, Info, CheckCircle2 } from "lucide-react"

import type { FormData, RecommendationResult, ExperienceLevelDetails } from "@/lib/reassessment-types"
import { calculateScoresAndRecommendation, getExperienceLevelDetails } from "@/lib/reassessment-logic"
import {
  DOSES,
  WEIGHT_LOSS_OPTIONS,
  SIDE_EFFECT_OPTIONS,
  APPETITE_CONTROL_OPTIONS,
  FOOD_CRAVINGS_OPTIONS,
  SATISFACTION_OPTIONS,
  PATIENT_PREFERENCE_OPTIONS,
  EFFORT_OPTIONS,
  TIME_ON_MEDICATION_OPTIONS,
} from "@/lib/form-options"

export default function ReassessmentPage() {
  const [formData, setFormData] = useState<FormData>({
    currentDose: "",
    timeOnCurrentMedication: "",
    dateOfLastDose: new Date().toISOString().split("T")[0],
    weightLoss4Weeks: "",
    currentWeight: "",
    sideEffects: [],
    otherSideEffectText: "",
    nauseaMedicationPreference: "",
    appetiteControl: "",
    foodCravings: "",
    satisfactionRating: 0,
    missedDoses4Weeks: "",
    patientPreference: "",
    weightGainEfforts: [],
  })

  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null)
  const [criticalAlert, setCriticalAlert] = useState<{ title: string; description: string } | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const experienceLevelDetails: ExperienceLevelDetails | null = useMemo(() => {
    if (formData.currentDose && formData.timeOnCurrentMedication) {
      const selectedDose = DOSES.find((d) => d.value === formData.currentDose)
      const timeOnMed = TIME_ON_MEDICATION_OPTIONS.find((t) => t.value === formData.timeOnCurrentMedication)
      if (selectedDose && timeOnMed) {
        return getExperienceLevelDetails(selectedDose.tier, timeOnMed.months)
      }
    }
    return null
  }, [formData.currentDose, formData.timeOnCurrentMedication])

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleSideEffectChange = (sideEffectValue: string, checked: boolean) => {
    setFormData((prev) => {
      const newSideEffects = checked
        ? [...prev.sideEffects, sideEffectValue]
        : prev.sideEffects.filter((se) => se !== sideEffectValue)
      return { ...prev, sideEffects: newSideEffects }
    })
  }

  const handleWeightGainEffortChange = (effortValue: string, checked: boolean) => {
    setFormData((prev) => {
      const newEfforts = checked
        ? [...prev.weightGainEfforts, effortValue]
        : prev.weightGainEfforts.filter((e) => e !== effortValue)
      return { ...prev, weightGainEfforts: newEfforts }
    })
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    if (!formData.currentDose) errors.currentDose = "Current dose is required."
    if (!formData.timeOnCurrentMedication) errors.timeOnCurrentMedication = "Time on current medication is required."
    if (!formData.dateOfLastDose) errors.dateOfLastDose = "Date of last dose is required."
    if (!formData.weightLoss4Weeks) errors.weightLoss4Weeks = "Weight loss information is required."
    if (!formData.currentWeight) errors.currentWeight = "Current weight is required."
    else if (
      isNaN(Number.parseFloat(formData.currentWeight)) ||
      Number.parseFloat(formData.currentWeight) < 50 ||
      Number.parseFloat(formData.currentWeight) > 500
    ) {
      errors.currentWeight = "Weight must be between 50 and 500 lbs."
    }
    if (formData.sideEffects.length === 0) errors.sideEffects = "Please select your side effect status."
    if (formData.sideEffects.includes("Other") && !formData.otherSideEffectText)
      errors.otherSideEffectText = "Please specify other side effects."
    if (!formData.appetiteControl) errors.appetiteControl = "Appetite control information is required."
    if (!formData.foodCravings) errors.foodCravings = "Food cravings information is required."
    if (formData.satisfactionRating === 0) errors.satisfactionRating = "Patient satisfaction is required."
    if (!formData.missedDoses4Weeks) errors.missedDoses4Weeks = "Information on missed doses is required."
    else if (isNaN(Number.parseInt(formData.missedDoses4Weeks)) || Number.parseInt(formData.missedDoses4Weeks) < 0) {
      errors.missedDoses4Weeks = "Missed doses must be a non-negative number."
    }

    if (experienceLevelDetails && experienceLevelDetails.level !== "beginner" && !formData.patientPreference) {
      errors.patientPreference = "Dose preference is required for your experience level."
    }
    if (formData.weightLoss4Weeks === "gaining_weight" && formData.weightGainEfforts.length === 0) {
      errors.weightGainEfforts = "Please select efforts made if gaining weight."
    }
    const hasModerateOrSevereNausea =
      formData.sideEffects.includes("Moderate nausea") || formData.sideEffects.includes("Significant vomiting")
    if (hasModerateOrSevereNausea && !formData.nauseaMedicationPreference) {
      errors.nauseaMedicationPreference = "Nausea medication preference is required."
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!validateForm()) {
      setRecommendation(null) // Clear previous recommendation if validation fails
      // Scroll to the first error or show a summary
      const firstErrorKey = Object.keys(formErrors).find((key) => formErrors[key])
      if (firstErrorKey) {
        const errorElement = document.getElementById(firstErrorKey)
        errorElement?.focus() // Or scrollIntoView
      }
      alert("Please correct the errors in the form.")
      return
    }

    const result = calculateScoresAndRecommendation(formData, experienceLevelDetails!)
    setRecommendation(result)

    if (result.criticalAlert) {
      setCriticalAlert(result.criticalAlert)
    } else {
      setCriticalAlert(null)
    }

    // Log API Payload
    const apiPayload = {
      patient_id: "PATIENT_123", // Example patient ID
      reassessment_date: new Date().toISOString(),
      current_tier_value: formData.currentDose,
      current_tier_mapped: DOSES.find((d) => d.value === formData.currentDose)?.tierName || "Unknown",
      time_on_medication_months:
        TIME_ON_MEDICATION_OPTIONS.find((t) => t.value === formData.timeOnCurrentMedication)?.months || 0,
      responses: {
        weight_loss_4weeks: formData.weightLoss4Weeks,
        current_weight: Number.parseFloat(formData.currentWeight),
        side_effects: formData.sideEffects,
        other_side_effect_text: formData.otherSideEffectText,
        nausea_medication_preference: formData.nauseaMedicationPreference,
        appetite_control: formData.appetiteControl,
        food_cravings: formData.foodCravings,
        satisfaction_rating: formData.satisfactionRating,
        missed_doses_4weeks: Number.parseInt(formData.missedDoses4Weeks),
        patient_preference: formData.patientPreference,
        weight_gain_efforts: formData.weightGainEfforts,
      },
      calculated_scores: result.scores,
      recommendation: {
        primary: result.primaryRecommendation,
        primary_product_id: result.primaryProductId,
        reasoning: result.reasoning,
        alternatives: result.alternativeRecommendations,
        safety_flags: result.safetyFlags,
      },
      flags: {
        important: result.importantFlags,
        critical: result.criticalFlags,
        requires_physician_review: result.requiresPhysicianReview,
      },
    }
    console.log("API Payload:", JSON.stringify(apiPayload, null, 2))
  }

  const showPatientPreferenceQuestion = experienceLevelDetails && experienceLevelDetails.level !== "beginner"
  const showWeightGainEffortsQuestion = formData.weightLoss4Weeks === "gaining_weight"
  const showNauseaMedicationQuestion =
    formData.sideEffects.includes("Moderate nausea") || formData.sideEffects.includes("Significant vomiting")

  const SatisfactionIcon = ({ value }: { value: number }) => {
    if (value === 1) return <Angry className="h-6 w-6 text-red-500" />
    if (value === 2) return <Frown className="h-6 w-6 text-orange-500" />
    if (value === 3) return <Meh className="h-6 w-6 text-yellow-500" />
    if (value === 4) return <Smile className="h-6 w-6 text-lime-500" />
    if (value === 5) return <Laugh className="h-6 w-6 text-green-500" />
    return null
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">GLP-1+B12 Reassessment</CardTitle>
          <CardDescription>
            Please complete this form to help us assess your progress and adjust your treatment plan if necessary.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Section 1: Current Status */}
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentDose">What is your current dose?</Label>
                  <Select
                    onValueChange={(value) => handleInputChange("currentDose", value)}
                    value={formData.currentDose}
                  >
                    <SelectTrigger id="currentDose">
                      <SelectValue placeholder="Select current dose" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOSES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.currentDose && <p className="text-sm text-red-500 mt-1">{formErrors.currentDose}</p>}
                </div>
                <div>
                  <Label htmlFor="timeOnCurrentMedication">
                    How long have you been on this current dose/medication?
                  </Label>
                  <Select
                    onValueChange={(value) => handleInputChange("timeOnCurrentMedication", value)}
                    value={formData.timeOnCurrentMedication}
                  >
                    <SelectTrigger id="timeOnCurrentMedication">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_ON_MEDICATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.timeOnCurrentMedication && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.timeOnCurrentMedication}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="dateOfLastDose">Date of last dose</Label>
                  <Input
                    id="dateOfLastDose"
                    type="date"
                    value={formData.dateOfLastDose}
                    onChange={(e) => handleInputChange("dateOfLastDose", e.target.value)}
                  />
                  {formErrors.dateOfLastDose && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.dateOfLastDose}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="currentWeight">What is your current weight in pounds?</Label>
                  <Input
                    id="currentWeight"
                    type="number"
                    placeholder="e.g., 150"
                    value={formData.currentWeight}
                    onChange={(e) => handleInputChange("currentWeight", e.target.value)}
                  />
                  {formErrors.currentWeight && <p className="text-sm text-red-500 mt-1">{formErrors.currentWeight}</p>}
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Section 2: Weight Loss Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Weight Loss Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Over the past 4 weeks, approximately how many pounds have you lost?</Label>
                  <RadioGroup
                    onValueChange={(value) => handleInputChange("weightLoss4Weeks", value)}
                    value={formData.weightLoss4Weeks}
                    className="mt-2 space-y-1"
                  >
                    {WEIGHT_LOSS_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`wls-${option.value}`} />
                        <Label htmlFor={`wls-${option.value}`}>{option.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {formErrors.weightLoss4Weeks && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.weightLoss4Weeks}</p>
                  )}
                </div>
                {showWeightGainEffortsQuestion && (
                  <div>
                    <Label>What other efforts have you made alongside medication?</Label>
                    <div className="mt-2 space-y-1">
                      {EFFORT_OPTIONS.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`effort-${option.value}`}
                            checked={formData.weightGainEfforts.includes(option.value)}
                            onCheckedChange={(checked) => handleWeightGainEffortChange(option.value, !!checked)}
                          />
                          <Label htmlFor={`effort-${option.value}`}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                    {formErrors.weightGainEfforts && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.weightGainEfforts}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Section 3: Side Effects Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Side Effects Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Are you experiencing any side effects that concern you?</Label>
                  <div className="mt-2 space-y-1">
                    {SIDE_EFFECT_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`se-${option.value}`}
                          checked={formData.sideEffects.includes(option.value)}
                          onCheckedChange={(checked) => handleSideEffectChange(option.value, !!checked)}
                        />
                        <Label htmlFor={`se-${option.value}`}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                  {formErrors.sideEffects && <p className="text-sm text-red-500 mt-1">{formErrors.sideEffects}</p>}
                </div>
                {formData.sideEffects.includes("Other") && (
                  <div>
                    <Label htmlFor="otherSideEffectText">Please specify other side effects:</Label>
                    <Input
                      id="otherSideEffectText"
                      value={formData.otherSideEffectText}
                      onChange={(e) => handleInputChange("otherSideEffectText", e.target.value)}
                    />
                    {formErrors.otherSideEffectText && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.otherSideEffectText}</p>
                    )}
                  </div>
                )}
                {showNauseaMedicationQuestion && (
                  <div>
                    <Label>Would you like us to send nausea medication (e.g., Ondansetron) to your pharmacy?</Label>
                    <RadioGroup
                      onValueChange={(value) => handleInputChange("nauseaMedicationPreference", value)}
                      value={formData.nauseaMedicationPreference}
                      className="mt-2 space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="nausea-yes" />
                        <Label htmlFor="nausea-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="nausea-no" />
                        <Label htmlFor="nausea-no">No</Label>
                      </div>
                    </RadioGroup>
                    {formErrors.nauseaMedicationPreference && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.nauseaMedicationPreference}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Note: Additional charges may apply for nausea medication.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Section 4: Appetite & Cravings */}
            <Card>
              <CardHeader>
                <CardTitle>Appetite & Cravings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>How is your appetite control?</Label>
                  <RadioGroup
                    onValueChange={(value) => handleInputChange("appetiteControl", value)}
                    value={formData.appetiteControl}
                    className="mt-2 space-y-1"
                  >
                    {APPETITE_CONTROL_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`ac-${option.value}`} />
                        <Label htmlFor={`ac-${option.value}`}>{option.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {formErrors.appetiteControl && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.appetiteControl}</p>
                  )}
                </div>
                <div>
                  <Label>Are you experiencing food cravings?</Label>
                  <RadioGroup
                    onValueChange={(value) => handleInputChange("foodCravings", value)}
                    value={formData.foodCravings}
                    className="mt-2 space-y-1"
                  >
                    {FOOD_CRAVINGS_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`fc-${option.value}`} />
                        <Label htmlFor={`fc-${option.value}`}>{option.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {formErrors.foodCravings && <p className="text-sm text-red-500 mt-1">{formErrors.foodCravings}</p>}
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Section 5: Satisfaction & Adherence */}
            <Card>
              <CardHeader>
                <CardTitle>Satisfaction & Adherence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>How satisfied are you with your progress? (1: Very Unhappy - 5: Very Happy)</Label>
                  <RadioGroup
                    onValueChange={(value) => handleInputChange("satisfactionRating", Number.parseInt(value))}
                    value={String(formData.satisfactionRating)}
                    className="mt-2 flex space-x-2 justify-around"
                  >
                    {SATISFACTION_OPTIONS.map((option) => (
                      <div key={option.value} className="flex flex-col items-center space-y-1">
                        <RadioGroupItem
                          value={String(option.value)}
                          id={`sat-${option.value}`}
                          className="sr-only peer"
                        />
                        <Label
                          htmlFor={`sat-${option.value}`}
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <SatisfactionIcon value={option.value} />
                          <span className="text-xs">{option.label}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {formErrors.satisfactionRating && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.satisfactionRating}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="missedDoses4Weeks">How many doses did you miss in the past 4 weeks?</Label>
                  <Input
                    id="missedDoses4Weeks"
                    type="number"
                    placeholder="e.g., 0"
                    value={formData.missedDoses4Weeks}
                    onChange={(e) => handleInputChange("missedDoses4Weeks", e.target.value)}
                  />
                  {formErrors.missedDoses4Weeks && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.missedDoses4Weeks}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Section 6: Patient Preference (Conditional) */}
            {showPatientPreferenceQuestion && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Preference</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>For your next prescription, would you prefer to:</Label>
                    <RadioGroup
                      onValueChange={(value) => handleInputChange("patientPreference", value)}
                      value={formData.patientPreference}
                      className="mt-2 space-y-1"
                    >
                      {PATIENT_PREFERENCE_OPTIONS.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={`pp-${option.value}`} />
                          <Label htmlFor={`pp-${option.value}`}>{option.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {formErrors.patientPreference && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.patientPreference}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            <Button type="submit" className="w-full">
              Get Recommendation
            </Button>
          </CardFooter>
        </form>

        {recommendation && !criticalAlert && (
          <CardContent className="mt-6">
            <Separator className="my-4" />
            <Alert
              variant={
                recommendation.primaryRecommendation.includes("DECREASE") ||
                recommendation.primaryRecommendation.includes("Stop medication")
                  ? "destructive"
                  : recommendation.primaryRecommendation.includes("INCREASE")
                    ? "default"
                    : "default"
              }
              className={recommendation.primaryRecommendation.includes("MAINTAIN") ? "border-green-500" : ""}
            >
              {recommendation.primaryRecommendation.includes("DECREASE") ||
              recommendation.primaryRecommendation.includes("Stop medication") ? (
                <AlertTriangle className="h-4 w-4" />
              ) : recommendation.primaryRecommendation.includes("MAINTAIN") ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Info className="h-4 w-4" />
              )}
              <AlertTitle className="font-bold">Recommendation: {recommendation.primaryRecommendation}</AlertTitle>
              <AlertDescription>
                <p className="mb-1">
                  <strong>Reasoning:</strong> {recommendation.reasoning}
                </p>
                {recommendation.primaryProductId && (
                  <p className="text-xs">Suggested Product ID: {recommendation.primaryProductId}</p>
                )}
                {recommendation.alternativeRecommendations && recommendation.alternativeRecommendations.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold">Alternative Options:</p>
                    <ul className="list-disc list-inside text-sm">
                      {recommendation.alternativeRecommendations.map((alt, idx) => (
                        <li key={idx}>
                          {alt.recommendation} (Product ID: {alt.productId})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {recommendation.safetyFlags && recommendation.safetyFlags.length > 0 && (
                  <div className="mt-2 text-amber-700 dark:text-amber-500">
                    <p className="font-semibold">Important Notes:</p>
                    <ul className="list-disc list-inside text-sm">
                      {recommendation.safetyFlags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recommendation.importantFlags && recommendation.importantFlags.length > 0 && (
                  <div className="mt-2 text-blue-700 dark:text-blue-400">
                    <p className="font-semibold">Flags:</p>
                    <ul className="list-disc list-inside text-sm">
                      {recommendation.importantFlags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {criticalAlert && (
        <AlertDialog open={!!criticalAlert} onOpenChange={() => setCriticalAlert(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                {criticalAlert.title}
              </AlertDialogTitle>
              <AlertDialogDescription>{criticalAlert.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setCriticalAlert(null)}>Understood</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </main>
  )
}
