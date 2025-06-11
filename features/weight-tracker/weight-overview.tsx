"use client"

import * as React from "react"
import { useMemo } from "react"

interface WeightEntry {
  date: string
  weight: number
}

interface WeightOverviewProps {
  data: WeightEntry[]
  goalWeight: number
  timeRange?: string
}

const inspirationalQuotes = [
  "Every step forward is progress, no matter how small.",
  "Your only limit is your mind.",
  "Believe in yourself and you're halfway there.",
  "Progress, not perfection.",
  "You are stronger than you think.",
  "Success is the sum of small efforts repeated daily.",
  "Don't quit when you're already in progress.",
  "You've got this! Keep pushing forward.",
  "Your dedication is paying off!",
]

const formatDate = (dateString: string) => {
  if (!dateString) return ""
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  })
}

export function WeightOverview({ data, goalWeight, timeRange }: WeightOverviewProps) {
  const {
    currentWeight,
    startWeight,
    weightLoss,
    progressPercentage,
    remainingWeight,
    currentQuote,
    startDate,
    currentDate,
    isGoalAchieved,
  } = useMemo(() => {
    const cw = data[data.length - 1]?.weight ?? 0
    const sw = data[0]?.weight ?? 0
    const loss = sw - cw
    const totalToLose = sw - goalWeight
    const progress = totalToLose > 0 ? Math.max(0, Math.min(100, (loss / totalToLose) * 100)) : 0
    const remaining = Math.max(0, cw - goalWeight)
    const achieved = cw <= goalWeight

    let quoteIndex = 0
    if (progress >= 80) quoteIndex = 8
    else if (progress >= 60) quoteIndex = 7
    else if (progress >= 40) quoteIndex = 5
    else if (progress >= 20) quoteIndex = 3

    return {
      currentWeight: cw,
      startWeight: sw,
      weightLoss: loss,
      progressPercentage: progress,
      remainingWeight: remaining,
      currentQuote: inspirationalQuotes[quoteIndex],
      startDate: formatDate(data[0]?.date),
      currentDate: formatDate(data[data.length - 1]?.date),
      isGoalAchieved: achieved,
    }
  }, [data, goalWeight])

  return (
    <div className="grid grid-cols-9 gap-5 w-full h-full">
      {/* Left Card - Total Weight Loss */}
      <div className="col-span-4 bg-putty rounded-2xl p-4 flex flex-col justify-between">
        <h2 className="text-sm font-medium text-dark text-center">Total Weight Loss</h2>
        <div className="text-center my-3">
          <span className="text-4xl font-bold text-teal-400">{Math.abs(weightLoss).toFixed(0)}</span>
          <span className="text-3xl font-semibold text-dark ml-1">lbs</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark font-medium">Progress to Goal</span>
            <span className="font-semibold text-teal-400">{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div 
              className="bg-teal-400 h-2 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 pt-1">
            <span>{isGoalAchieved ? "Goal Achieved! 🎉" : `${remainingWeight.toFixed(1)} lbs to go`}</span>
            {timeRange && <span>{timeRange}</span>}
          </div>
        </div>
      </div>

      {/* Right Side - Weight Stats Grid */}
      <div className="col-span-5 flex flex-col justify-between">
        <StatCard label="Starting Weight" date={startDate} weight={startWeight} barColor="bg-teal-400" />
        <StatCard label="Current Weight" date={currentDate} weight={currentWeight} barColor="bg-teal-400" />
        <StatCard label="Goal Weight" weight={goalWeight} barColor="bg-coral-400" highlight />
        <div className="bg-white rounded-2xl p-4 flex items-center justify-center border border-gray-200/80 min-h-[60px]">
          <p className="text-sm text-gray-600 italic text-center">&ldquo;{currentQuote}&rdquo;</p>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  date?: string
  weight: number
  barColor: string
  highlight?: boolean
}

function StatCard({ label, date, weight, barColor, highlight = false }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-3 flex items-center gap-3 ${highlight ? "bg-teal-100" : "bg-white"}`}>
      <div className={`w-1.5 h-7 ${barColor} rounded-full`} />
      <div className="flex-1 min-w-0">
        <p className="text-dark font-medium text-sm">{label}</p>
        {date && <p className="text-gray-500 text-xs">{date}</p>}
      </div>
      <p className="text-base font-bold text-dark whitespace-nowrap">{weight} lbs</p>
    </div>
  )
} 