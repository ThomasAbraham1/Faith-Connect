import api from "@/api/api"
import { Modal } from "@/components/dynamic/Modal"
import LoadingSpinner from "@/components/spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import React, { useEffect } from "react"

import { useState } from 'react';
import { SignatureMaker } from '@docuseal/signature-maker-react';
import { toast } from "sonner"
import type { AxiosResponse } from "axios"
import { SignatureCard } from "@/components/dynamic/DynamicSignatureCard"

export const ViewProfile = ({ userName, profilePicUrl, phone, churchName, spiritualStatus, dateOfBirth, address, fatherName, motherName, lastName, firstName }) => {
  // Split userName into firstName and lastName (assuming userName is "First Last")
  const [open, setOpen] = React.useState(false);
  const [userId, setUserId] = useState(undefined)


  // useEffect(() => {
  //   console.log(userId);

  // }, [userId])
  const { data, error, isPending, isError } = useQuery({
    queryKey: ['pastorSignature'],
    queryFn: async () => {
      const result = await api.get('/members/settings/signature')
      if (result) {
        setUserId(result.data.data._id)
      }
      console.log(result)
      return result
    },
    retry: false
  });

  const queryClient = useQueryClient()


  const signatureMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (userId)
        data.append('userId', userId);
      else
        throw 'User ID is not set'
      const result = await api.post('/members/settings/signature', data
      )
      return result
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: ['pastorSignature']
      })
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.response.data.data.message);
    },
  })

  console.log('data signature:', (`${import.meta.env.VITE_APP_API_URL}/signatures/${data?.data.data.signature?.signaturePicName}`))

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
      <div className="hidden print:block max-w-3xl mx-auto p-8 bg-white">
        <style>{`
    @media print {
      @page {
        size: A4;
        margin: 1cm;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
        -webkit-print-color-adjust: exact; /* Ensure colors render accurately */
      }
      body, html {
        margin: 0 !important;
        padding: 0 !important;
        font-family: 'Times New Roman', Times, serif;
        border: none !important;
      }
      .print-no-header-footer {
        margin: 0 !important;
        padding: 0 !important;
        width: 100%;
        box-sizing: border-box;
      }
      /* Explicitly suppress headers and footers */
      @page {
        @top-left { content: none !important; }
        @top-center { content: none !important; }
        @top-right { content: none !important; }
        @bottom-left { content: none !important; }
        @bottom-center { content: none !important; }
        @bottom-right { content: none !important; }
      }
      .signature-img {
        max-height: 50px; /* Limit height to prevent oversized signature */
        max-width: 200px; /* Limit width to fit within column */
        object-fit: contain; /* Maintain aspect ratio */
        display: block;
        margin: 0 auto; /* Center the image */
      }
      .no-signature {
        text-align: center;
        color: #666;
        font-style: italic;
      }
      .answer-field {
        border-color: #374151; /* Dark grey (gray-700) for borders */
        color: #111827; /* Darker text (gray-900) for answers */
      }
      .label-field {
        color: #1F2937; /* Dark grey (gray-800) for labels */
      }
    }
  `}</style>
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 uppercase tracking-wider">
            {churchName}
          </h1>
          <p className="text-lg text-gray-600 italic mt-2">
            Welcoming You to Our Family in Faith
          </p>
        </div>

        <div className="p-0">
          <h2 className="text-2xl font-semibold text-center mb-8">
            Church Membership Form
          </h2>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">
                {firstName || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">
                {lastName || "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Father's Name</label>
              <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">
                {fatherName || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
              <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">
                {motherName || "N/A"}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">
              {address || "N/A"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">
                {dateOfBirth || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">
                {phone || "N/A"}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Spiritual Status</label>
            <p className="mt-1 text-base font-semibold border-b border-gray-300 pb-1">
              {spiritualStatus || "N/A"}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8">
            <div>
              <div className="border-b border-gray-400 mt-4 mb-3 h-16"></div>
              <p className="text-center text-sm font-medium">Member's Signature</p>
              <p className="text-center text-sm mt-3">Date: ____________________</p>
            </div>
            <div>
              <div className="border-b border-gray-400 mt-4 mb-3 h-16 flex items-center justify-center">
                {data?.data?.data?.signature?.signaturePicName ? (
                  <img
                    src={`${import.meta.env.VITE_APP_API_URL}/signatures/${data.data.data.signature.signaturePicName}`}
                    alt="Member's Signature"
                    className="signature-img"
                    onError={() => console.error('Failed to load signature image')}
                  />
                ) : (
                  <p className="no-signature">No signature available</p>
                )}
              </div>
              <p className="text-center text-sm font-medium">Pastor's Signature</p>
              <p className="text-center text-sm mt-3">Date: ____________________</p>
            </div>
          </div>

          {/* <div className="mt-10 text-center text-sm text-gray-500">
            <p>Grace Community Church</p>
            <p>123 Faith Road, Springfield, USA</p>
            <p>Contact: (123) 456-7890 | info@gracechurch.org</p>
          </div> */}
        </div>
      </div>


      {/* Print Button (not printed) */}
      < div className="mt-6 flex justify-center gap-4 print:hidden" >
        {isPending &&
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
            <LoadingSpinner />
          </div>
        }

        {
          (data && data.data.data.signature) ? <Button variant={'default'}
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
            (<Modal triggerButtonContent={'Print'} modelTitle={'Signature not found!'} modelDescription={'Create the pastors signature here'} onOpenChange={() => console.log("hello")} > <SignatureCard postSignatureMutation={signatureMutation} /></Modal>)
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
      </div >
    </>
  )
}