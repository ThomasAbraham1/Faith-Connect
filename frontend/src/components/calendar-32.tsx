import * as React from "react"
import { CalendarPlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"

export default function Calendar32({ calendarLabel, onChange, calendarDescription, getLastSunday }: { calendarLabel: string, onChange: (value?: Date) => void, calendarDescription?: string, getLastSunday: () => void }) {
  const [open, setOpen] = React.useState(false)



  // 🔹 Function to get last Sunday (most recent)

  // 🔹 Initialize state with last Sunday
  const [date, setDate] = React.useState<Date | undefined>(() => getLastSunday())

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1">
        {calendarLabel}
      </Label>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-48 justify-between font-normal"
          >
            {date ? date.toLocaleDateString() : "Select date"}
            <CalendarPlusIcon />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="w-auto overflow-hidden p-0">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Select date</DrawerTitle>
            <DrawerDescription>Set your date of birth</DrawerDescription>
          </DrawerHeader>
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              setDate(date)
              setOpen(false)
              onChange(date)
            }}
            disabled={(day) => day.getDay() !== 0}
            className="mx-auto [--cell-size:clamp(0px,calc(100vw/7.5),52px)]"
          />
        </DrawerContent>
      </Drawer>
      <div className="text-muted-foreground px-1 text-sm">
        {calendarDescription}
      </div>
    </div>
  )
}
