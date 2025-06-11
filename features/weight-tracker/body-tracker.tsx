"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WeightChart } from "./weight-chart"
import { WeightOverview } from "./weight-overview"
import { PlusCircle, Pencil } from "lucide-react"
import { FancySwitch } from "@/components/ui/fancy-switch"

const mockData = [
  { date: "2024-01-01", weight: 215.0 },
  { date: "2024-02-15", weight: 210.4 },
  { date: "2024-04-01", weight: 204.8 },
  { date: "2024-05-15", weight: 200.3 },
  { date: "2024-07-01", weight: 195.7 },
  { date: "2024-09-01", weight: 189.6 },
  { date: "2024-11-01", weight: 183.2 },
  { date: "2025-01-01", weight: 176.5 },
  { date: "2025-03-15", weight: 169.1 },
  { date: "2025-06-11", weight: 162.3 },
]

const goalWeight = 175

type FilterOption = "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL"
type ViewMode = "tracker" | "overview"

export function BodyTracker() {
  const [activeFilter, setActiveFilter] = React.useState<FilterOption>("3M")
  const [viewMode, setViewMode] = React.useState<ViewMode>("tracker")

  const filterOptions: FilterOption[] = ["1W", "1M", "3M", "6M", "1Y", "ALL"]
  const viewOptions = ["tracker", "overview"]

  const handleViewModeChange = (value: string) => {
    setViewMode(value as ViewMode)
  }

  // Simplified data filtering for demonstration.
  // A real implementation would filter based on current date and selected range.
  const filteredData = React.useMemo(() => {
    switch (activeFilter) {
      case "1W":
        return mockData.slice(-2) // Example: last 2 entries
      case "1M":
        return mockData.slice(-3) // Example: last 3 entries
      case "3M":
        // To match screenshot's timeframe (Dec 31 to Mar 28) with 4 points
        return [
          { date: "2024-12-31", weight: 200 },
          { date: "2025-01-31", weight: 195 },
          { date: "2025-02-28", weight: 190 },
          { date: "2025-03-28", weight: 185 },
        ]
      case "6M":
        return mockData.slice(-7) // Example: last 7 entries
      case "1Y":
        return mockData.slice(-10) // Example: last 10 entries (or all if less than a year)
      case "ALL":
      default:
        return mockData
    }
  }, [activeFilter])

  console.log("Filtered Data for Chart:", filteredData)
  console.log("Number of data points:", filteredData.length)

  return (
    <div className="bg-light min-h-screen flex justify-center items-start p-4 sm:p-6 md:p-8">
      <Card className="w-[600px] h-[400px] p-5 shadow-lg rounded-2xl bg-white border-0 grid grid-rows-[auto_1fr] gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-serif text-dark">Body Tracker</h1>
          <div className="flex items-center space-x-1">
            <FancySwitch
              value={viewMode}
              onChange={handleViewModeChange}
              options={viewOptions}
              className="bg-gray-100"
            />
            <Button variant="ghost" size="icon" aria-label="Add Entry" className="hover:bg-light h-8 w-8">
              <PlusCircle className="h-4 w-4 text-dark" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Edit Entries" className="hover:bg-light h-8 w-8">
              <Pencil className="h-4 w-4 text-dark" />
            </Button>
          </div>
        </div>

        <div className="min-h-0 relative">
          <div 
            className={`absolute inset-0 transition-opacity duration-300 ${
              viewMode === "tracker" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <WeightChart 
              data={filteredData} 
              goalWeight={goalWeight} 
              timeRange={activeFilter}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              filterOptions={filterOptions}
            />
          </div>
          <div 
            className={`absolute inset-0 transition-opacity duration-300 ${
              viewMode === "overview" ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <WeightOverview data={mockData} goalWeight={goalWeight} timeRange="Overall" />
          </div>
        </div>
      </Card>
    </div>
  )
} 