"use client"

import * as React from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

interface WeightEntry {
  date: string
  weight: number
}

interface WeightChartProps {
  data: WeightEntry[]
  goalWeight: number
  timeRange?: string // e.g., "3M", "1Y", "ALL"
}

const chartConfig = {
  weight: {
    label: "Weight",
    color: "#079393", // teal-400
  },
  goal: {
    label: "Goal Weight",
    color: "#FA5B4C", // coral-400
  },
} satisfies ChartConfig

// Custom label for the goal weight reference line
const CustomGoalLabel = (props: any) => {
  const { viewBox, value } = props

  // Add a guard to ensure viewBox and its properties are defined
  if (!viewBox || typeof viewBox.x !== "number" || typeof viewBox.y !== "number" || typeof viewBox.width !== "number") {
    // If viewBox is not properly defined, return null to prevent rendering errors
    return null
  }

  const { x, y, width } = viewBox

  // Calculate positions based on viewBox
  // Position "Goal Weight" text to the left of the line, near the start of the chart
  const labelX = x + 5 // Small padding from the left edge of the chart
  // Position the goal weight value text to the right of the line, near the end of the chart
  const valueX = x + width - 5 // Small padding from the right edge of the chart
  // Position text slightly above the line
  const textY = y - 5

  return (
    <g>
      <text
        x={labelX}
        y={textY}
        fill="#FA5B4C"
        dy={0}
        fontSize="11"
        fontWeight="500"
        textAnchor="start"
      >
        Goal Weight
      </text>
      <text x={valueX} y={textY} fill="#FA5B4C" dy={0} fontSize="11" fontWeight="500" textAnchor="end">
        {value} lbs
      </text>
    </g>
  )
}

export function WeightChart({ data, goalWeight, timeRange = "3M" }: WeightChartProps) {
  const formattedData = React.useMemo(() => {
    return data.map((entry) => ({
      ...entry,
      // Format date for XAxis tick display
      displayDate: new Date(entry.date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }),
    }))
  }, [data])

  // Determine Y-axis domain dynamically
  const yDomain = React.useMemo(() => {
    const weights = formattedData.map((d) => d.weight)
    const minWeight = Math.min(...weights, goalWeight)
    const maxWeight = Math.max(...weights)
    return [Math.floor(minWeight / 10) * 10 - 10, Math.ceil(maxWeight / 10) * 10 + 5]
  }, [formattedData, goalWeight])

  // Determine X-axis ticks dynamically based on time range
  const xTicks = React.useMemo(() => {
    if (formattedData.length <= 1) return undefined // Recharts default ticks

    // For simplicity, show a fixed number of ticks or all if few points
    if (formattedData.length <= 5) {
      return formattedData.map((d) => d.date)
    }
    // More sophisticated tick logic can be added here based on timeRange
    // For now, let Recharts decide for larger datasets or implement specific logic
    const numTicks = 4 // Example: aim for 4 ticks
    const step = Math.max(1, Math.floor(formattedData.length / (numTicks - 1)))
    const ticks = []
    for (let i = 0; i < formattedData.length; i += step) {
      ticks.push(formattedData[i].date)
    }
    if (ticks[ticks.length - 1] !== formattedData[formattedData.length - 1].date) {
      ticks[ticks.length - 1] = formattedData[formattedData.length - 1].date // Ensure last tick is the last data point
    }
    return ticks
  }, [formattedData, timeRange])

  return (
    <ChartContainer config={chartConfig} className="w-full h-full ">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          accessibilityLayer
          data={formattedData}
          margin={{
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="2 2" stroke="#E5E5E5" opacity={0.7} />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })}
            tickLine={false}
            axisLine={false}
            
            padding={{ left: 8, right: 8 }}
            ticks={xTicks}
            tick={{ fill: "#333333", fontSize: 11 }}
            label={{
              value: "Date",
              position: "insideBottom",
              
              style: { fill: "#333333", fontSize: "12px", fontWeight: "600" },
            }}
          />
          <YAxis
            tickFormatter={(value) => `${value}`}
            domain={yDomain}
            tickLine={false}
            axisLine={false}
            
            width={60}
            tick={{ fill: "#333333", fontSize: 11 }}
            label={{
              value: "Pounds (lbs)",
              angle: -90,
              position: "insideLeft",
              offset: 5,
              style: { textAnchor: "middle", fill: "#333333", fontSize: "12px", fontWeight: "600" },
            }}
          />
          <ChartTooltip
            cursor={true}
            content={
              <ChartTooltipContent
                className="w-[150px] bg-white border border-gray-200 shadow-lg rounded-lg"
                nameKey="weight"
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                }
                indicator="line"
                formatter={(value: ValueType, name: NameType) => [
                  `${value} lbs`,
                  name === "weight" ? "Weight" : String(name),
                ]}
              />
            }
          />
          <ReferenceLine
            y={goalWeight}
            stroke="#FA5B4C"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={<CustomGoalLabel value={goalWeight} />}
          />
          <Line
            dataKey="weight"
            type="monotone"
            stroke="#079393"
            strokeWidth={3}
            dot={{
              fill: "#079393",
              stroke: "#079393",
              strokeWidth: 0,
              r: 6,
            }}
            activeDot={{
              fill: "#079393",
              r: 8,
              strokeWidth: 3,
              stroke: "#ffffff",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
