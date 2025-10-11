import api from "@/api/api"
import { Modal } from "@/components/dynamic/Modal"
import LoadingSpinner from "@/components/spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useMutation, useQuery } from "@tanstack/react-query"
import React from "react"

import { useState } from 'react';
import { SignatureMaker } from '@docuseal/signature-maker-react';
import { toast } from "sonner"

export const ViewProfile = ({ userName, profilePicUrl, phone, spiritualStatus, dateOfBirth, address, fatherName, motherName, lastName, firstName }) => {
  // Split userName into firstName and lastName (assuming userName is "First Last")
  const [open, setOpen] = React.useState(false);
  const { data, error, isPending, isError } = useQuery({
    queryKey: ['pastorSignature'],
    queryFn: async () => {
      const result = await api.get('/members/settings/signature')
      console.log(result)
      return result
    },
    retry: false
  });


  interface SignatureCardProps {
    onSignatureSave?: (base64: string) => void; // Optional callback for saving the signature
  }

  function SignatureCard({ onSignatureSave }: SignatureCardProps) {
    const [signatureBase64, setSignatureBase64] = useState<string | null>(null);

    const handleSignatureChange = (event: any) => {
      setSignatureBase64(event.base64);
    };

    function base64ToBlob(base64String, contentType) {
      // Extract the actual base64 data if it includes the data URI prefix
      const base64Data = base64String;

      // Decode the Base64 string into a binary string
      const binaryString = atob(base64Data);

      // Create a Uint8Array from the binary string
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create a Blob from the Uint8Array
      return new Blob([bytes], { type: contentType });
    }


    const signatureMutation = useMutation({
      mutationFn: async (data: any) => {

        const result = await api.post('/members/settings/signature', {
          data
        })
        return result
      },
      onSuccess: (data) => {
        console.log(data)
      }
    })

    const handleSave = async () => {
      if (!signatureBase64) return alert("Please sign first!");

      // Convert base64 to Blob (simpler way using fetch)
      const blob = await (await fetch(signatureBase64)).blob();
      console.log(blob)

      const formData = new FormData();
      formData.append("signature", blob, "signature.png");
      signatureMutation.mutate(formData)
      // Upload to server
      // await api.post("/members/settings/signature", formData);

      // alert("Signature saved/uploaded!");
    };

    return (
      <Card className="w-full max-w-md mx-auto shadow-sm border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Sign Here</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Draw, type, or upload your signature below.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="space-y-2">
            <SignatureMaker
              withSubmit={false} // Hide built-in save button; use external if needed
              onChange={handleSignatureChange}
              onSave={handleSave}
              // downloadOnSave={true} // Auto-download on save (optional)
              // Shadcn/Tailwind-friendly customizations
              canvasClass="w-full h-32 bg-secondary border border-input bg-background  rounded-md p-2"
              textInputClass="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent"
              typeButtonsContainerClass="flex justify-center gap-2 mb-3"
              drawTypeButtonClass="px-3 py-1.5 text-xs font-medium rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              drawTypeButtonActiveClass="bg-primary text-primary-foreground"
              textTypeButtonClass="px-3 py-1.5 text-xs font-medium rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              textTypeButtonActiveClass="bg-primary text-primary-foreground"
              uploadTypeButtonClass="px-3 py-1.5 text-xs font-medium rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              uploadTypeButtonActiveClass="bg-primary text-primary-foreground"
              undoButtonClass="h-8 px-3 text-xs rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              clearButtonClass="h-8 px-3 text-xs rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              textInputPlaceholder="Type your signature..."
            />
          </div>
          {signatureBase64 && (
            <div className="text-xs text-center text-muted-foreground">
              Signature captured! Preview: {signatureBase64.length > 50 ? `${signatureBase64.slice(0, 50)}...` : signatureBase64}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="flex gap-2">

            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }


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
        {isPending &&
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
            <LoadingSpinner />
          </div>}

        {(data && data.data.signature) ? <Button variant={'default'}
          onClick={() => {
            window.print()
          }}
          className="w-36"
        >
          Print
        </Button> : (error ? <Button variant={'default'}
          onClick={() => {
            toast.error(error?.response?.data.message)
          }}
          className="w-36"
        >
          Print
        </Button> :
          (<Modal triggerButtonContent={'Print'} modelTitle={'Signature not found!'} modelDescription={'Create the pastors signature here'} onOpenChange={() => console.log("hello")} > <SignatureCard /></Modal>)
        )
        }
        {/* {(data && !error) ? (<Button variant={'default'}
          onClick={() => {
            window.print()
          }}
          className="w-36"
        >
          Print
        </Button>)
          // If pastor isn't in system - asking to create a pastor
          :
          ((data && !data.data.signature) ?
            (<Modal triggerButtonContent={'Print'} modelTitle={'Signature not found!'} modelDescription={'Create the pastors signature here'} onOpenChange={() => console.log("hello")} > <SignatureCard /></Modal>) :
            (<Button variant={'default'}
              onClick={() => {
                toast.error(error?.response?.data.message)
              }}
              className="w-36"
            >
              Print
            </Button>)

          )
        } */}
      </div>
    </>
  )
}