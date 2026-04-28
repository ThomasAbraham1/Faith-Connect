import api from "@/api/api";
import Calendar32 from "@/components/calendar-32";
import LoadingSpinner from "@/components/spinner";
import { Mutation, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { attendanceFormSubmitHandler } from "./service";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Check, CheckCheck, Church, Variable, X } from "lucide-react";
import { DataTableDemo } from "@/components/dynamic/DynamicTable";
import { RadioGroupButton } from "@/components/dynamic/RadioButton";
import React, { useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/context/UserProvider";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { TEventsData } from "../events/types/events.types";


type tableDataShape = { id: string, churchId: string, userName: string, name: string, status: string }
type attendanceRecord = {
    memberId: string,
    status: 'PRESENT' | 'ABSENT',
    _id: string
}

type userQueryDataShape = { _id: string, churchId: string, userName: string, firstName: string, lastName?: string }
type attendanceRecordsType = {
    memberId: string;
    status: string
}

export type formDataType = {
    date: string;
    churchId: string;
    records?: attendanceRecordsType[];
    eventId?: string; // Add eventId to form type
}

type attendanceTableDataType = Record<'churchId' | 'id' | 'status' | 'userName' | 'name', string>[]

export const Attendance = () => {
    const [tableDataState, setTableDataState] = useState<attendanceTableDataType>([])
    const [attendanceMode, setAttendanceMode] = useState<'SERVICE' | 'EVENT'>('SERVICE')
    const userContext = useUser()

    // Helper to get most recent occurrence of a specific day
    const getLastOccurrence = React.useCallback((dayName?: string) => {
        const today = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        let targetDayIndex = 0; // Default to Sunday
        if (dayName) {
            const index = days.indexOf(dayName);
            if (index !== -1) targetDayIndex = index;
        }

        const currentDayIndex = today.getDay();
        let diff = currentDayIndex - targetDayIndex;
        if (diff < 0) {
            diff += 7; // Go back to the previous week's occurrence
        }

        const lastDate = new Date(today);
        lastDate.setDate(today.getDate() - diff);
        lastDate.setHours(0, 0, 0, 0);
        return lastDate;
    }, []);

    const { register, handleSubmit, control, watch, setValue, getValues, resetField, formState: { errors } } = useForm<formDataType>({
        defaultValues: {
            date: format(getLastOccurrence(), 'yyyy-MM-dd'),
            churchId: userContext.church?._id,
            eventId: undefined
        }
    });

    const selectedEventId = watch('eventId');
    const selectedDate = watch('date');

    const { isPending: isUserQueryPending, error: userQueryError, data: userQueryData, isFetching: isUserQueryFetching } = useQuery({
        queryKey: ["membersData"],
        queryFn: async () => {
            const response = await api.get("/members");
            return response;
        },
    });

    // Fetch Events Data
    const { data: eventsData } = useQuery({
        queryKey: ["eventsData"],
        queryFn: async () => {
            const response = await api.get("/events");
            return response;
        },
        enabled: attendanceMode === 'EVENT', // Only fetch events if in EVENT mode
    });

    const eventsList = useMemo(() => {
        if (!eventsData?.data?.data) return [];
        return eventsData.data.data.map((event: any) => ({
            id: event._id,
            name: event.eventName,
            date: event.eventDate,
            isRecurring: event.isRecurring,
            recurrenceDay: event.recurrenceDay,
        }));
    }, [eventsData]);

    const selectedEvent = useMemo(() => {
        return eventsList.find((e: any) => e.id === selectedEventId);
    }, [eventsList, selectedEventId]);

    // Effect to auto-set date for Events (Single or Recurring)
    useEffect(() => {
        if (attendanceMode === 'EVENT' && selectedEvent) {
            if (!selectedEvent.isRecurring && selectedEvent.date) {
                // Single Event: Auto-set date
                setValue('date', format(new Date(selectedEvent.date), 'yyyy-MM-dd'));
            } else if (selectedEvent.isRecurring) {
                // Recurring Event: Auto-set to most recent occurrence
                const lastOccurrence = getLastOccurrence(selectedEvent.recurrenceDay);
                setValue('date', format(lastOccurrence, 'yyyy-MM-dd'));
            }
        }
    }, [selectedEvent, attendanceMode, setValue, getLastOccurrence]);


    // Fetch attendance data
    const { isPending: isAttendanceQueryPending, error: AttendanceQueryError, data: attendanceQueryData, isFetching: isAttendanceQueryFetching } = useQuery({
        queryKey: ["attendanceData", attendanceMode, selectedDate, selectedEventId], // Add dependencies
        queryFn: async () => {
            if (attendanceMode === 'SERVICE') {
                const response = await api.get(`/attendance/${getValues().date}`);
                return response;
            } else if (attendanceMode === 'EVENT' && selectedEventId) {
                const dateQuery = selectedEvent?.isRecurring && selectedDate ? `?date=${selectedDate}` : '';
                const response = await api.get(`/attendance/event/${selectedEventId}${dateQuery}`);
                return response;
            }
            return { data: { data: { records: [] } } }; // Default empty if no event selected
        },
        enabled: (attendanceMode === 'SERVICE' && !!selectedDate) || (attendanceMode === 'EVENT' && !!selectedEventId && (selectedEvent?.isRecurring ? !!selectedDate : true))
    });

    const tableData: tableDataShape[] = useMemo(() => {
        return userQueryData?.data.data.map((value: userQueryDataShape) => {
            const record: attendanceRecord | undefined =
                attendanceQueryData?.data.data.records?.find(
                    (r: attendanceRecord) => r.memberId === value._id
                );

            return {
                id: value._id,
                userName: value.userName,
                name: `${value.firstName} ${value.lastName || ''}`.trim(),
                churchId: value.churchId,
                status: record?.status ? record?.status : '', // fallback to ABSENT
            };
        }) || [];
    }, [userQueryData?.data.data, attendanceQueryData?.data?.data?.records]);

    const queryClient = useQueryClient();
    useEffect(() => {
        setTableDataState(tableData)
    }, [tableData])

    useEffect(() => {
        if (userContext.church)
            setValue('churchId', userContext.church._id)
    }, [userContext.church])

    useEffect(() => {
        var recordsInFlightType: attendanceRecordsType[] = tableDataState.map((value, index) => {
            return { memberId: value.id, status: value.status }
        })
        var fileteredArray = recordsInFlightType.filter((value, index) => value.status != '')
        setValue('records', fileteredArray)
    }, [tableDataState]);

    const columns: ColumnDef<tableDataShape>[] = useMemo(() => [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <div 
                        className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors py-2 font-bold text-xs tracking-wider"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Name
                        <ArrowUpDown className="size-3" />
                    </div>
                );
            },
            cell: ({ row }) => (
                <div className="py-2 text-sm font-medium">{row.getValue("name")}</div>
            ),
        },
        {
            accessorKey: "userName",
            header: ({ column }) => {
                return (
                    <div 
                        className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors py-2 font-bold text-xs tracking-wider"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Username
                        <ArrowUpDown className="size-3" />
                    </div>
                );
            },
            cell: ({ row }) => (
                <div className="py-2 text-sm text-muted-foreground">{row.getValue("userName")}</div>
            ),
        },
        {
            accessorKey: "status",
            header: ({ column }) => {
                return (
                    <div className="font-bold text-xs tracking-wider py-2">
                        Status
                    </div>
                );
            },
            cell: ({ row }) => (
                <div className="py-2 text-sm">
                    <Controller control={control} name="records" render={({ field }) =>
                        <RadioGroupButton attendanceStatus={row.getValue('status')} radioId={row.getValue('id')}
                            onChange={
                                (value: string) => {
                                    const attendanceArrayIndex = tableDataState.findIndex((attendanceRecord) => attendanceRecord.id == row.getValue('id'))
                                    setTableDataState((prev) => {
                                        const newTableDataState = [...prev]
                                        newTableDataState[attendanceArrayIndex].status = value
                                        return newTableDataState
                                    })
                                }
                            } radioOptions={['PRESENT', 'ABSENT']} />
                    } />
                </div>
            ),
        },
    ], [attendanceQueryData, tableDataState])


    const attendanceSubmitMutation = useMutation({
        mutationFn: (data) => api.post("/attendance", data), onSuccess: (data) => queryClient.invalidateQueries({
            queryKey: ["attendanceData"],
        })
    })

    const onSubmit = (data: any) => {
        if (attendanceMode === 'SERVICE') {
            delete data.eventId;
        } else {
            if (!data.eventId) {
                alert("Please select an event");
                return;
            }
        }
        console.log(data)
        attendanceSubmitMutation.mutate(data);
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
                <p className="text-muted-foreground text-sm">
                    Manage service and event attendance records.
                </p>
            </div>
            {(isUserQueryFetching || isAttendanceQueryFetching || attendanceSubmitMutation.isPending) &&
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
                    <LoadingSpinner />
                </div>
            }
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-6 mb-6">
                            {/* Interaction Mode Toggle */}
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant={attendanceMode === 'SERVICE' ? 'default' : 'outline'}
                                    onClick={() => {
                                        setAttendanceMode('SERVICE');
                                        resetField('eventId');
                                        setValue('date', format(getLastOccurrence(), 'yyyy-MM-dd')); // Reset to last Sunday
                                    }}
                                >
                                    Sunday Service
                                </Button>
                                <Button
                                    type="button"
                                    variant={attendanceMode === 'EVENT' ? 'default' : 'outline'}
                                    onClick={() => {
                                        setAttendanceMode('EVENT');
                                    }}
                                >
                                    Specific Event
                                </Button>
                            </div>

                            <div className="grid gap-6">
                                {/* Event Selector - Always visible if in EVENT mode */}
                                {attendanceMode === 'EVENT' && (
                                    <div className="space-y-2 max-w-md">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Select Event</label>
                                        <Controller
                                            control={control}
                                            name="eventId"
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select an event" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {eventsList.map((event: any) => (
                                                            <SelectItem key={event.id} value={event.id}>
                                                                {event.name} ({new Date(event.date).toLocaleDateString()}) - {event.isRecurring ? 'Recurring' : 'Single'}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                )}

                                {/* Date Picker + Buttons Row */}
                                <div className="flex flex-wrap items-end gap-4 justify-between">
                                    <div className="w-full sm:w-auto">
                                        {attendanceMode === 'SERVICE' ? (
                                            <Controller control={control} name="date" render={({ field }) =>
                                                <Calendar32
                                                    calendarLabel={'Attendance Date'}
                                                    getLastSunday={() => getLastOccurrence('Sunday')}
                                                    onChange={(value) => {
                                                        if (value) field.onChange(format(value, 'yyyy-MM-dd'))
                                                    }}
                                                />
                                            } />
                                        ) : (
                                            selectedEvent?.isRecurring && (
                                                <Controller control={control} name="date" render={({ field }) =>
                                                    <Calendar32
                                                        calendarLabel={'Occurrence Date'}
                                                        getLastSunday={() => getLastOccurrence(selectedEvent.recurrenceDay)}
                                                        filterDate={(date) => {
                                                            if (!selectedEvent.recurrenceDay) return true;
                                                            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                                            const dayIndex = days.indexOf(selectedEvent.recurrenceDay);
                                                            if (dayIndex === -1) return true;
                                                            return date.getDay() === dayIndex;
                                                        }}
                                                        onChange={(value) => {
                                                            if (value) field.onChange(format(value, 'yyyy-MM-dd'))
                                                        }}
                                                    />
                                                } />
                                            )
                                        )}
                                    </div>

                                    {/* Centered Action Buttons - Now aligned right/row */}
                                    <div className="flex gap-4">
                                        <Button type='button' size='default' variant={'outline'} onClick={() => {
                                            setTableDataState((prev) => {
                                                return [...prev].map((r) => ({ ...r, status: 'PRESENT' }))
                                            })
                                        }}>Mark All Present</Button>
                                        <Button type="button" size='default' variant={'outline'} onClick={() => {
                                            setTableDataState((prev) => {
                                                return [...prev].map((r) => ({ ...r, status: 'ABSENT' }))
                                            })
                                        }}>Mark All Absent</Button>
                                    </div>
                                </div>

                                <Input {...register('churchId')} className="hidden"></Input>
                            </div>

                        </div>
                        <DataTableDemo 
                            data={tableDataState} 
                            columns={columns} 
                            columnVisibilityObject={{
                                id: false, churchId: false
                            }}
                        />
                        <Button variant={'default'} className="w-full mt-6">Submit Attendance</Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}