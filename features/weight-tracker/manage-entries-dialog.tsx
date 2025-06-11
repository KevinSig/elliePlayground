"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Pencil, X } from "lucide-react"
import { WeightDialog, type WeightEntry } from "./weight-dialog"

interface ManageEntriesDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  entries: WeightEntry[]
  onEditEntry: (updatedEntry: WeightEntry) => void
  onDeleteEntry: (id: string) => void
}

export function ManageEntriesDialog({
  isOpen,
  onOpenChange,
  entries,
  onEditEntry,
  onDeleteEntry,
}: ManageEntriesDialogProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [entryToEdit, setEntryToEdit] = useState<WeightEntry | null>(null)

  const handleEditClick = (entry: WeightEntry) => {
    setEntryToEdit(entry)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = (updatedEntry: WeightEntry) => {
    onEditEntry(updatedEntry)
    setIsEditDialogOpen(false)
    setEntryToEdit(null)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  // Sort entries by date, most recent first for display
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (!isOpen) return null

  return (
    <>
      <div className="absolute inset-0 z-50 flex items-center justify-center">
        {/* Backdrop with subtle blur effect - scoped to component */}
        <div 
          className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl"
          onClick={handleClose}
        />
        
        {/* Modal content */}
        <div className="relative bg-white border border-black-100 rounded-2xl shadow-lg p-6 w-96 mx-4 animate-in fade-in zoom-in-95 duration-200 max-h-[320px] grid grid-rows-[auto_1fr_auto] gap-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-lg font-semibold text-dark">Manage Weight Entries</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 rounded-full hover:bg-black-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Content - scrollable area */}
          <div className="min-h-0 overflow-hidden">
            <ScrollArea className="h-full -mx-2 px-2">
              {sortedEntries.length === 0 ? (
                <p className="text-center text-black-300 py-8">No entries yet.</p>
              ) : (
                <div className="space-y-2">
                  {sortedEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between py-2 px-4 bg-light rounded-full hover:bg-putty transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <p className="font-medium text-dark text-sm">{entry.weight} lbs</p>
                          <p className="text-sm text-black-400">
                            {new Date(entry.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-teal-400 hover:text-teal-400 hover:bg-teal-100 rounded-full"
                          onClick={() => handleEditClick(entry)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Footer */}
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="rounded-full"
            >
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Dialog - rendered conditionally */}
      <WeightDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        mode="edit"
        entryToEdit={entryToEdit}
        onSaveEntry={handleSaveEdit}
        onDeleteEntry={onDeleteEntry}
      />
    </>
  )
} 