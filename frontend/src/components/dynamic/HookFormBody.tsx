import type { ReactNode } from "react"

export const HookFormBody = ({ children }: { children: ReactNode }) => {
    return (
        <div className="grid gap-6 p-4">
            <div className="grid gap-6 sm:grid-cols-2">

                {children}
            </div>
        </div>
    )
}