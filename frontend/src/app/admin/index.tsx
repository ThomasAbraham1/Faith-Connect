import { TabsDemo } from "@/components/dynamic/DynamicTab"

export const SettingsPage = () => {
    return (
        <div className="grid gap-7 md:grid-cols-3 justify-items-center">
            <TabsDemo tabContent={'Here goes some general settings'} />
        </div>
    )
}