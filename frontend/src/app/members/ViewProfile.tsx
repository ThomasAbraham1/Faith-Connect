import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const ViewProfile = ({ userName, profilePicUrl, phone, spiritualStatus, dateOfBirth }) => {
  return (
    <>
      {/* Profile Card */}
      <Card className="mt-6 w-full max-w-md mx-auto rounded-2xl shadow-lg print:shadow-none">
        <CardHeader className="flex flex-col items-center gap-2">
          {/* Profile Picture */}
          <Avatar className="h-28 w-28 border shadow-md">
            <AvatarImage
              src={`${import.meta.env.VITE_APP_API_URL}${profilePicUrl}`}
              alt="Profile picture"
            />
            <AvatarFallback className="text-lg font-semibold">NA</AvatarFallback>
          </Avatar>
          <CardTitle className="mt-2 text-xl font-semibold">{userName}</CardTitle>
          <p className="text-sm text-muted-foreground">User Profile</p>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium text-muted-foreground">Phone</span>
            <span className="font-semibold">{phone}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium text-muted-foreground">Birthdate</span>
            <span className="font-semibold">{dateOfBirth}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Spiritual Status</span>
            <span className="font-semibold">{spiritualStatus}</span>
          </div>
        </CardContent>
      </Card>

      {/* Print Button (not printed) */}
      <div className="mt-6 flex justify-center gap-4 print:hidden">
        <Button
          onClick={() => window.print()}
          className="w-36"
        >
          Print
        </Button>
      </div>
    </>
  )
}
