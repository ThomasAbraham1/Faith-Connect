import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const ViewProfile = ({ userName, profilePicUrl, phone, spiritualStatus, dateOfBirth, address, fatherName, motherName, lastName, firstName }) => {
  // Split userName into firstName and lastName (assuming userName is "First Last")

  return (
    <>
      {/* Screen Display: Profile Card */}
      <Card className="mt-6 w-full max-w-md mx-auto rounded-2xl shadow-lg print:hidden">
        <CardHeader className="flex flex-col items-center gap-2">
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

      {/* Print Display: Church Membership Form */}
      <div className="hidden print:block max-w-2xl mx-auto p-6 bg-white">
        <style>{`
          @media print {
            @page {
              margin: 0;
            }
            body {
              margin: 1cm;
            }
          }
        `}</style>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 uppercase tracking-wide">
            Grace Community Church
          </h1>
          <p className="text-lg text-gray-600 italic">
            Welcoming You to Our Family in Faith
          </p>
        </div>

        <div className="p-0">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Church Membership Form
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">{firstName || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">{lastName || "N/A"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Father's Name</label>
              <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">{fatherName || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
              <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">{motherName || "N/A"}</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">{address || "N/A"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">{dateOfBirth || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">{phone || "N/A"}</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Spiritual Status</label>
            <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">{spiritualStatus || "N/A"}</p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8">
            <div>
              <div className="border-b border-gray-400 mt-4 mb-2"></div>
              <p className="text-center text-sm font-medium">Member's Signature</p>
              <p className="text-center text-sm mt-4">Date: ____________________</p>
            </div>
            <div>
              <div className="border-b border-gray-400 mt-4 mb-2"></div>
              <p className="text-center text-sm font-medium">Pastor's Signature</p>
              <p className="text-center text-sm mt-4">Date: ____________________</p>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Grace Community Church</p>
            <p>123 Faith Road, Springfield, USA</p>
            <p>Contact: (123) 456-7890 | info@gracechurch.org</p>
          </div>
        </div>
      </div>

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