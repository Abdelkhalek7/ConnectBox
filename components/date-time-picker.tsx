"use client"

import * as React from "react"
import { CalendarIcon } from 'lucide-react'
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
  const [selectedDateTime, setSelectedDateTime] = React.useState<Date | undefined>(date)

  const handleSelect = (selectedDate: Date | undefined) => {
    setSelectedDateTime(selectedDate)
    setDate(selectedDate)
  }

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const timeString = event.target.value
    if (selectedDateTime && timeString) {
      const [hours, minutes] = timeString.split(':')
      const newDateTime = new Date(selectedDateTime)
      newDateTime.setHours(parseInt(hours, 10))
      newDateTime.setMinutes(parseInt(minutes, 10))
      setSelectedDateTime(newDateTime)
      setDate(newDateTime)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP HH:mm") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDateTime}
          onSelect={handleSelect}
          initialFocus
        />
        <div className="p-3 border-t">
          <Input
            type="time"
            onChange={handleTimeChange}
            value={selectedDateTime ? format(selectedDateTime, "HH:mm") : ""}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

