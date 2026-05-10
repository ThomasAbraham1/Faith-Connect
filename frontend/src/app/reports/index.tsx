import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { handleExcelDownload } from "@/lib/utils";
import { ReportFieldSelector } from "./ReportFieldSelector";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, FileBarChart2, Table as TableIcon } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { DynamicTable1 } from "@/components/dynamic/DynamicTable1";

export function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get("type") || "users";
  const initialEventId = searchParams.get("eventId") || "";

  const [reportType, setReportType] = useState<string>(initialType);
  const [eventId, setEventId] = useState<string>(initialEventId);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  // We need to debounce the preview query to avoid spamming the backend
  const debouncedFields = useDebounce(selectedFields, 500);

  // Update URL when state changes so it's shareable
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("type", reportType);
    if (reportType === "registrations" && eventId) {
      params.set("eventId", eventId);
    }
    setSearchParams(params, { replace: true });
  }, [reportType, eventId, setSearchParams]);

  // Fetch events list if type is registrations
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ["eventsList"],
    queryFn: async () => {
      const res = await api.get("/events");
      return res.data?.data || [];
    },
    enabled: reportType === "registrations",
  });

  // Fetch available fields
  const { data: fieldsData, isLoading: fieldsLoading } = useQuery({
    queryKey: ["reportFields", reportType, eventId],
    queryFn: async () => {
      // If registrations and no eventId, return empty fields to wait for event selection
      if (reportType === "registrations" && !eventId) return [];
      
      const res = await api.get(`/report/fields/${reportType}${eventId ? `?eventId=${eventId}` : ''}`);
      console.log(res)
      return res.data.data || [];
    },
    enabled: reportType !== "registrations" || !!eventId,
  });

  // Auto-select all fields when fieldsData changes
  useEffect(() => {
    if (fieldsData && fieldsData.length > 0) {
      setSelectedFields(fieldsData.map((f: any) => f.key));
    } else {
      setSelectedFields([]);
    }
  }, [fieldsData]);

  // Fetch preview data
  const { data: previewData, isLoading: previewLoading } = useQuery({
    queryKey: ["reportPreview", reportType, eventId, debouncedFields.join(",")],
    queryFn: async () => {
      if (debouncedFields.length === 0) return [];
      
      let url = `/report/${reportType}/preview?fields=${debouncedFields.join(",")}`;
      if (reportType === "registrations" && eventId) {
        url += `&eventId=${eventId}`;
      }
      
      const res = await api.get(url);
      return res.data.data || [];
    },
    enabled: debouncedFields.length > 0 && (reportType !== "registrations" || !!eventId),
  });

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      let url = `/report/${reportType}?fields=${selectedFields.join(",")}`;
      if (reportType === "registrations" && eventId) {
        url += `&eventId=${eventId}`;
      }
      
      const response = await api.get(url, { responseType: "blob" });
      handleExcelDownload(response, `${reportType}_report.xlsx`);
    } catch (error) {
      console.error("Failed to download report", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground text-xs md:text-sm">
          Export custom data to Excel.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex justify-end flex-wrap gap-2">
            <Button 
              onClick={handleDownload} 
              disabled={selectedFields.length === 0 || isDownloading || (reportType === 'registrations' && !eventId)}
              className="gap-2"
            >
              {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span className="sm:hidden">Excel</span>
              <span className="hidden sm:inline">Download Excel</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Config */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Configuration</CardTitle>
              <CardDescription>Select the data you want to export.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Report Type</label>
                <Select value={reportType} onValueChange={(val) => {
                  setReportType(val);
                  if (val !== "registrations") setEventId("");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="users">Members</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="registrations">Registrations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reportType === "registrations" && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-semibold text-foreground">Select Event</label>
                  <Select value={eventId} onValueChange={setEventId}>
                    <SelectTrigger>
                      <SelectValue placeholder={eventsLoading ? "Loading events..." : "Select an event"} />
                    </SelectTrigger>
                    <SelectContent>
                      {eventsData?.map((ev: any) => (
                        <SelectItem key={ev._id} value={ev._id}>{ev.eventName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex justify-between items-center">
                Columns
                {fieldsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportType === 'registrations' && !eventId ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Select an event to view available fields.
                </p>
              ) : (
                <ReportFieldSelector 
                  fields={fieldsData || []} 
                  selected={selectedFields} 
                  onChange={setSelectedFields}
                  isLoading={fieldsLoading}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-8">
          <Card className="h-full overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Data Preview</span>
                {previewLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </CardTitle>
              <CardDescription>Live preview of the report data based on your selection.</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {selectedFields.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center p-8">
                  <div className="text-center space-y-2">
                    <TableIcon className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                    <p className="text-muted-foreground text-sm font-medium">Select at least one column to preview data.</p>
                  </div>
                </div>
              ) : previewData && previewData.length > 0 ? (
                <div className="custom-scrollbar">
                  <DynamicTable1<any>
                    data={previewData}
                    columnOptions={{ HideColumns: [] }}
                  />
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center bg-muted/10">
                  <p className="text-muted-foreground text-sm font-medium">No data found matching this configuration.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
  );
}
