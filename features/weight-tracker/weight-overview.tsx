"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"

interface WeightEntry {
  date: string
  weight: number
}

interface WeightOverviewProps {
  data: WeightEntry[]
  goalWeight: number
  timeRange?: string
}

export function WeightOverview({ data, goalWeight, timeRange }: WeightOverviewProps) {
  const currentWeight = data[data.length - 1]?.weight ?? 0
  const startWeight = data[0]?.weight ?? 0
  const weightLoss = startWeight - currentWeight
  
  // Get dates for display
  const startDate = data[0]?.date ? new Date(data[0].date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }) : ""
  const currentDate = data[data.length - 1]?.date ? new Date(data[data.length - 1].date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }) : ""

  return (
    <div className="w-full h-full flex gap-3">
      {/* Left Card - Total Weight Loss */}
      <div className="flex-1 bg-putty rounded-xl p-4 flex flex-col justify-center items-center">
        <h2 className="text-sm font-medium text-dark mb-2 text-center">Total Weight Loss</h2>
        <div className="text-center">
          <span className="text-3xl font-bold text-teal-400">{Math.abs(weightLoss).toFixed(0)}</span>
          <span className="text-3xl font-bold text-dark ml-1">lbs</span>
        </div>
        <p className="text-gray-500 text-xs mt-1">{timeRange?.toLowerCase() || 'selected period'}</p>
      </div>

      {/* Right Side - Weight Stats */}
      <div className="flex-1 flex flex-col gap-2">
        {/* Starting Weight */}
        <div className="bg-white rounded-lg p-3 flex items-center gap-3">
          <div className="w-1 h-10 bg-teal-400 rounded-full"></div>
          <div className="flex-1">
            <p className="text-dark font-medium text-sm">Starting Weight</p>
            <p className="text-gray-500 text-xs">{startDate}</p>
          </div>
          <p className="text-lg font-bold text-dark">{startWeight} lbs</p>
        </div>

        {/* Current Weight */}
        <div className="bg-white rounded-lg p-3 flex items-center gap-3">
          <div className="w-1 h-10 bg-teal-400 rounded-full"></div>
          <div className="flex-1">
            <p className="text-dark font-medium text-sm">Current Weight</p>
            <p className="text-gray-500 text-xs">{currentDate}</p>
          </div>
          <p className="text-lg font-bold text-dark">{currentWeight} lbs</p>
        </div>

        {/* Goal Weight */}
        <div className="bg-teal-100 rounded-lg p-3 flex items-center gap-3">
          <div className="w-1 h-10 bg-coral-400 rounded-full"></div>
          <div className="flex-1">
            <p className="text-dark font-medium text-sm">Goal Weight</p>
          </div>
          <p className="text-lg font-bold text-dark">{goalWeight} lbs</p>
        </div>
      </div>
    </div>
  )
} 