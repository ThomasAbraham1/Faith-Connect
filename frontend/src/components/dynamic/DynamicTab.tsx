import { AppWindowIcon, CodeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

export function TabsDemo({ tabContent }) {
    return (
        <div className="flex w-full max-w-sm flex-col gap-6">
            <Tabs defaultValue="account">
                <TabsList>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="signature">Signature</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <Card>
                        <CardContent>
                            {tabContent}
                        </CardContent>
                        {/* <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Make changes to your account here. Click save when you&apos;re
                done.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-name">Name</Label>
                <Input id="tabs-demo-name" defaultValue="Pedro Duarte" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="tabs-demo-username">Username</Label>
                <Input id="tabs-demo-username" defaultValue="@peduarte" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter> */}
                    </Card>
                </TabsContent>
                <TabsContent value="signature">
                    <Card>
                        <CardHeader>
                            <CardTitle>signature</CardTitle>
                            <CardDescription>
                                Change your signature here. After saving, you&apos;ll be logged
                                out.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="tabs-demo-current">Current signature</Label>
                                <Input id="tabs-demo-current" type="signature" />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="tabs-demo-new">New signature</Label>
                                <Input id="tabs-demo-new" type="signature" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save signature</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
