'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WeightChart } from './weight-chart'
import { WeightOverview } from './weight-overview'
import { WeightDialog, type WeightEntry } from './weight-dialog'
import { ManageEntriesDialog } from './manage-entries-dialog'
import { PlusCircle, Pencil } from 'lucide-react'
import { FancySwitch } from '@/components/ui/fancy-switch'

const initialMockData: WeightEntry[] = [
  { id: '1', date: '2024-01-01', weight: 215.0 },
  { id: '2', date: '2024-02-15', weight: 210.4 },
  { id: '3', date: '2024-04-01', weight: 204.8 },
  { id: '4', date: '2024-05-15', weight: 200.3 },
  { id: '5', date: '2024-07-01', weight: 195.7 },
  { id: '6', date: '2024-09-01', weight: 189.6 },
  { id: '7', date: '2024-11-01', weight: 183.2 },
  { id: '8', date: '2025-01-01', weight: 176.5 },
  { id: '9', date: '2025-03-15', weight: 169.1 },
  { id: '10', date: '2025-06-11', weight: 162.3 },
]

const goalWeight = 175

type FilterOption = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'
type ViewMode = 'tracker' | 'overview'

export function BodyTracker() {
  const [activeFilter, setActiveFilter] = React.useState<FilterOption>('3M')
  const [viewMode, setViewMode] = React.useState<ViewMode>('tracker')
  const [weightData, setWeightData] =
    React.useState<WeightEntry[]>(initialMockData)
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [isManageModalOpen, setIsManageModalOpen] = React.useState(false)

  const filterOptions: FilterOption[] = ['1W', '1M', '3M', '6M', '1Y', 'ALL']
  const viewOptions = ['tracker', 'overview']

  const handleViewModeChange = (value: string) => {
    setViewMode(value as ViewMode)
  }

  const handleAddEntry = (entry: Omit<WeightEntry, 'id'>) => {
    const newEntry: WeightEntry = {
      ...entry,
      id: Date.now().toString(), // Simple ID generation
    }

    // Add the new entry and sort by date
    setWeightData(prevData => {
      const updatedData = [...prevData, newEntry]
      return updatedData.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    })
  }

  const handleEditEntry = (updatedEntry: WeightEntry) => {
    setWeightData(prevData => {
      const updatedData = prevData.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
      return updatedData.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    })
  }

  const handleDeleteEntry = (id: string) => {
    setWeightData(prevData => prevData.filter(entry => entry.id !== id))
  }

  // Simplified data filtering for demonstration.
  // A real implementation would filter based on current date and selected range.
  const filteredData = React.useMemo(() => {
    switch (activeFilter) {
      case '1W':
        return weightData.slice(-2) // Example: last 2 entries
      case '1M':
        return weightData.slice(-3) // Example: last 3 entries
      case '3M':
        // To match screenshot's timeframe (Dec 31 to Mar 28) with 4 points
        return [
          { id: 'demo1', date: '2024-12-31', weight: 200 },
          { id: 'demo2', date: '2025-01-31', weight: 195 },
          { id: 'demo3', date: '2025-02-28', weight: 190 },
          { id: 'demo4', date: '2025-03-28', weight: 185 },
        ]
      case '6M':
        return weightData.slice(-7) // Example: last 7 entries
      case '1Y':
        return weightData.slice(-10) // Example: last 10 entries (or all if less than a year)
      case 'ALL':
      default:
        return weightData
    }
  }, [activeFilter, weightData])

  console.log('Filtered Data for Chart:', filteredData)
  console.log('Number of data points:', filteredData.length)

  return (
    <div className='bg-light min-h-screen flex justify-center items-start p-4 sm:p-6 md:p-8'>
      <Card className='relative w-[600px] h-[400px] p-5 rounded-2xl bg-white border border-black-100 shadow-lg grid grid-rows-[auto_1fr] gap-4'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-semibold text-dark'>Body Tracker</h1>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Button
                variant='ghost'
                effect='animatedIcon'
                icon={PlusCircle}
                iconPlacement='left'
                aria-label='Add Entry'
                className='h-[28px] px-2 py-1 text-xs font-medium rounded-full'
                onClick={() => setIsAddModalOpen(true)}
              >
                Input Weight
              </Button>

              <Button
                variant='ghost'
                effect='animatedIcon'
                icon={Pencil}
                iconPlacement='left'
                aria-label='Edit Entries'
                className='h-[28px] px-2 py-1 text-xs font-medium rounded-full'
                onClick={() => setIsManageModalOpen(true)}
              >
                Edit Entries
              </Button>
            </div>
            <FancySwitch
              value={viewMode}
              onChange={handleViewModeChange}
              options={viewOptions}
              className='bg-black-100'
            />
          </div>
        </div>

        <div className='min-h-0 relative'>
          <div
            className={`absolute inset-0 transition-opacity duration-200 ${
              viewMode === 'tracker'
                ? 'opacity-100'
                : 'opacity-0 pointer-events-none'
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
            className={`absolute inset-0 transition-opacity duration-200 ${
              viewMode === 'overview'
                ? 'opacity-100'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <WeightOverview
              data={weightData}
              goalWeight={goalWeight}
              timeRange='Overall'
            />
          </div>
        </div>

        {/* Component-scoped modals */}
        <WeightDialog
          isOpen={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          mode="add"
          onSaveEntry={handleAddEntry}
        />
        
        <ManageEntriesDialog
          isOpen={isManageModalOpen}
          onOpenChange={setIsManageModalOpen}
          entries={weightData}
          onEditEntry={handleEditEntry}
          onDeleteEntry={handleDeleteEntry}
        />
      </Card>
    </div>
  )
}
