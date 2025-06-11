"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface WeightEntry {
  id?: string
  date: string
  weight: number
}

interface WeightDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  mode: 'add' | 'edit'
  entryToEdit?: WeightEntry | null
  onSaveEntry: (entry: WeightEntry | Omit<WeightEntry, 'id'>) => void
  onDeleteEntry?: (id: string) => void
}

// Simple date grid component
function DatePicker({ 
  selected, 
  onSelect 
}: { 
  selected?: Date; 
  onSelect: (date: Date) => void 
}) {
  const today = new Date()
  const currentMonth = selected || today
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()
  
  const [currentDate, setCurrentDate] = useState(currentMonth)
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  
  const days = []
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-8" />)
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const isSelected = selected && 
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    const isToday = 
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    
    days.push(
      <button
        key={day}
        onClick={() => onSelect(date)}
        className={cn(
          "h-8 w-8 rounded-md text-sm hover:bg-gray-100 focus:bg-gray-100",
          isSelected && "bg-teal-400 text-white hover:bg-teal-500",
          isToday && !isSelected && "bg-gray-200 font-semibold"
        )}
      >
        {day}
      </button>
    )
  }
  
  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 rounded-md"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-semibold text-sm">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded-md"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  )
}

export function WeightDialog({ isOpen, onOpenChange, mode, entryToEdit, onSaveEntry, onDeleteEntry }: WeightDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [weight, setWeight] = useState<string>("")
  const [error, setError] = useState<string>("")

  // Reset form when mode changes or when opening in add mode
  useEffect(() => {
    if (mode === 'add' && isOpen) {
      setSelectedDate(new Date())
      setWeight("")
      setError("")
    } else if (mode === 'edit' && entryToEdit) {
      setSelectedDate(new Date(entryToEdit.date))
      setWeight(entryToEdit.weight.toString())
      setError("")
    }
  }, [mode, isOpen, entryToEdit])

  const handleSubmit = () => {
    if (!selectedDate || !weight) {
      setError("Both date and weight are required.")
      return
    }
    const weightValue = Number.parseFloat(weight)
    if (isNaN(weightValue) || weightValue <= 0) {
      setError("Please enter a valid positive weight.")
      return
    }

    const dateString = selectedDate.toISOString().split("T")[0]

    if (mode === 'edit' && entryToEdit) {
      onSaveEntry({ 
        ...entryToEdit, 
        date: dateString, 
        weight: weightValue 
      })
    } else {
      onSaveEntry({ 
        date: dateString, 
        weight: weightValue 
      })
    }

    setError("")
    if (mode === 'add') {
      setWeight("") // Reset weight for add mode
    }
    onOpenChange(false)
  }

  const handleClose = () => {
    setError("")
    if (mode === 'add') {
      setWeight("")
    }
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (mode === 'edit' && entryToEdit?.id && onDeleteEntry) {
      onDeleteEntry(entryToEdit.id)
      onOpenChange(false)
    }
  }

  if (!isOpen) return null

  const isEditMode = mode === 'edit'
  const title = isEditMode ? "Edit Weight Entry" : "Add New Weight Entry"
  const buttonText = isEditMode ? "Save Changes" : "Add Entry"

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop with subtle blur effect - only for add mode */}
      {mode === 'add' && (
        <div 
          className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl animate-in fade-in duration-300"
          onClick={handleClose}
        />
      )}
      
      {/* Modal content */}
      <div className="relative bg-white border border-gray-200 rounded-xl shadow-xl p-6 w-96 mx-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-dark">{title}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-dark">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <DatePicker
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-sm font-medium text-dark">
              Weight (lbs)
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g., 180.5"
              className="w-full"
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-in slide-in-from-top-2 duration-200">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          <div className="flex justify-between pt-4">
            {/* Delete button - only show in edit mode */}
            {mode === 'edit' && onDeleteEntry && (
              <Button
                type="button"
                variant="outline"
                effect="animatedIcon"
                icon={Trash2}
                iconPlacement="left"
                onClick={handleDelete}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:!text-red-600 [&_svg]:text-red-600 hover:[&_svg]:!text-red-600"
              >
                Delete
              </Button>
            )}
            
            {/* Right side buttons */}
            <div className="flex space-x-3 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit}
                className="bg-teal-400 text-white hover:bg-teal-500"
              >
                {buttonText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 