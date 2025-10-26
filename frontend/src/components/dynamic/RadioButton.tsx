import { Label } from "@/components/ui/label"
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group"
import { useEffect, useRef, type Dispatch } from "react"

export function RadioGroupButton({ onChange, radioOptions,  attendanceStatus }: { onChange: (value: string) => void, radioOptions: string[], attendanceStatus: string }) {
    return (
        <RadioGroup className="flex flex-row" defaultValue={attendanceStatus} onValueChange={(value) => { onChange(value) }}>
            {radioOptions.map((value, index) =>
                <div key={index} className="flex items-center gap-3">
                    <RadioGroupItem value={value} id={'r' + index} />
                    <Label htmlFor={'r' + index} className="normal-case">{value}</Label>
                </div>
            )}
            {/* <div className="flex items-center gap-3">
                <RadioGroupItem value="comfortable" id="r2" />
                <Label htmlFor="r2">Comfortable</Label>
            </div>
            <div className="flex items-center gap-3">
                <RadioGroupItem value="compact" id="r3" />
                <Label htmlFor="r3">Compact</Label>
            </div> */}
        </RadioGroup>
    )
}
