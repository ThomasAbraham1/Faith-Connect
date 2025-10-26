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
import { format } from 'date-fns';
import { useUser } from "@/context/UserProvider";
import { Input } from "@/components/ui/input";


type tableDataShape = { id: string, churchId: string, userName: string, status: string }
type attendanceRecord = {
    memberId: string,
    status: 'PRESENT' | 'ABSENT',
    _id: string
}

type userQueryDataShape = { _id: string, churchId: string, userName: string, }

type attendanceRecordsType = {
    memberId: string;
    status: string
}

export type formDataType = {
    date: string;
    churchId: string;
    records?: attendanceRecordsType[]
}

type attendanceTableDataType = Record<'churchId' | 'id' | 'status' | 'userName', string>[]

export const Attendance = () => {
    const [tableDataState, setTableDataState] = useState<attendanceTableDataType>([])
    const userContext = useUser()
    // const [selectAllState, setSelectAllState] = useState<boolean | undefined>(undefined)
    const getLastSunday = React.useCallback(() => {
        const today = new Date()
        const dayOfWeek = today.getDay() // 0=Sunday, 1=Mon...
        const diff = dayOfWeek === 0 ? 0 : dayOfWeek // number of days since Sunday
        const lastSunday = new Date(today)
        lastSunday.setDate(today.getDate() - diff)
        // Reset time for consistency
        lastSunday.setHours(0, 0, 0, 0)
        return lastSunday
    }, [])
    const { register, handleSubmit, control, watch, setValue, getValues, formState: { errors } } = useForm<formDataType>({
        defaultValues: {
            date: format(getLastSunday(), 'yyyy-MM-dd'),
            churchId: userContext.church?._id
        }
    });

    // Get last sunday date function

    // Query on init
    const { isPending: isUserQueryPending, error: userQueryError, data: userQueryData, isFetching: isUserQueryFetching } = useQuery({
        queryKey: ["membersData"],
        queryFn: async () => {
            const response = await api.get("/members");
            // console.log(response)
            return response;
        },
    });

    // Fetch attendance data
    const { isPending: isAttendanceQueryPending, error: AttendanceQueryError, data: attendanceQueryData, isFetching: isAttendanceQueryFetching } = useQuery({
        queryKey: ["attendanceData"],
        queryFn: async () => {
            // console.log(`/attendance/${getValues().date}`)
            const response = await api.get(`/attendance/${getValues().date}`);
            // console.log(response)
            return response;
        },
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
                churchId: value.churchId,
                status: record?.status ? record?.status : '', // fallback to ABSENT
            };
        }) || [];
    }, [userQueryData?.data.data, attendanceQueryData?.data?.data?.records]);
    const queryClient = useQueryClient();
    useEffect(() => {
        // if table data is set - update state
        // if (tableData.length > 0) {
        setTableDataState(tableData)
        console.log(tableData)
        // }
        // console.log('Table data changed')
    }, [tableData])

    useEffect(() => {
        if (userContext.church)
            setValue('churchId', userContext.church._id)
    }, [userContext.church])

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['attendanceData'] })
    }, [watch('date')])

    useEffect(() => {
        console.log('Table Data State Variable: ', tableDataState)
        // Passing state values to react hook form values
        var recordsInFlightType: attendanceRecordsType[] = tableDataState.map((value, index) => {
            return { memberId: value.id, status: value.status }
        })
        var fileteredArray = recordsInFlightType.filter((value, index) => value.status != '')
        setValue('records', fileteredArray)
        console.log(fileteredArray)
    }, [tableDataState]);





    // console.log(tableData)
    const columns: ColumnDef<tableDataShape>[] = useMemo(() => [
        {
            accessorKey: "id",
            header: "Id",
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("id")}</div>
            ),
        },
        {
            accessorKey: "churchId",
            header: "Church Id",
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("churchId")}</div>
            ),
        },
        {
            accessorKey: "userName",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Username
                        <ArrowUpDown />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="lowercase">{row.getValue("userName")}</div>
            ),
        },
        {
            accessorKey: "status",
            header: ({ column }) => {
                return (
                    <div className="flex gap-1.5">
                        <p className="flex items-center">
                            Status
                        </p>
                        {/* <Button type="button" variant={'default'} onClick={(e) => setSelectAllState(true)}><CheckCheck></CheckCheck></Button>
                        <Button type="button" variant={'default'} onClick={(e) => setSelectAllState(false)}><X></X></Button> */}
                    </div>
                );
            },
            cell: ({ row }) => (
                <div className="lowercase">
                    <Controller control={control} name="records" render={({ field }) =>
                        <RadioGroupButton attendanceStatus={row.getValue('status')}
                            onChange={
                                // (value: string) => {
                                //     const records: attendanceRecordsType[] = field.value || [];
                                //     // field.onChange([{ memberId: row.getValue('id'), status: value }]);
                                //     let newRecord = {
                                //         memberId: row.getValue('id') as any as string, status: value as any as 'PRESENT' | 'ABSENT'
                                //     }
                                //     let existingRecordIndex = -1;
                                //     if (records) {
                                //         existingRecordIndex = records.findIndex((value) => value.memberId == row.getValue('id'));
                                //     }
                                //     console.log(existingRecordIndex)
                                //     let newRecords
                                //     if (existingRecordIndex >= 0) {
                                //         newRecords = [...records]
                                //         newRecords[existingRecordIndex] = newRecord
                                //     } else {
                                //         newRecords = [...records]
                                //         newRecords.push(newRecord)
                                //     }
                                //     console.log(newRecords)
                                //     // field.onChange(newRecords)
                                //     setValue('records', newRecords);
                                // }
                                (value: string) => {
                                    console.log('Current row status value: ', row.getValue('status'))
                                    console.log('State Table after changing status: ', tableDataState, " user id: ", row.getValue('id'))
                                    const attendanceArrayIndex = tableDataState.findIndex((attendanceRecord) => attendanceRecord.id == row.getValue('id'))
                                    console.log(attendanceArrayIndex)
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

    const onSubmit = (data) => {
        console.log(data)
        attendanceSubmitMutation.mutate(data);
    }
    return (
        <>
            {(isUserQueryFetching || isAttendanceQueryFetching || attendanceSubmitMutation.isPending) &&
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
                    <LoadingSpinner />
                </div>
            }
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-6 sm:grid-cols-2 grid-rows-auto items-end">
                    <div className="grid-row-1 gap-3">
                        <Controller control={control} name="date" render={({ field }) =>
                            <Calendar32 calendarLabel={'Attendance Date'} getLastSunday={getLastSunday} onChange={(value) => {
                                if (value) field.onChange(format(value, 'yyyy-MM-dd'))
                            }
                            }
                            />
                        } />
                    </div>
                    <Input {...register('churchId')} className="hidden"></Input>
                    <div className="grid grid-row gap-3 justify-items-end">
                        <div className="flex gap-3">
                            <Button type='button' size='lg' variant={'outline'} onClick={() => {
                                setTableDataState((prev) => {
                                    const allPresentArray = [...prev].map((attendanceRecord) => {
                                        var newAttendanceRecord = { ...attendanceRecord }
                                        newAttendanceRecord.status = 'PRESENT'
                                        return newAttendanceRecord
                                    })
                                    return allPresentArray
                                })
                            }}>Present</Button>
                            <Button type="button" size='lg' variant={'outline'} onClick={() => {
                                setTableDataState((prev) => {
                                    const allPresentArray = [...prev].map((attendanceRecord) => {
                                        var newAttendanceRecord = { ...attendanceRecord }
                                        newAttendanceRecord.status = 'ABSENT'
                                        return newAttendanceRecord
                                    })
                                    return allPresentArray
                                })
                            }}>Absent</Button>
                        </div>
                    </div>
                </div>
                <DataTableDemo data={tableDataState} columns={columns} />
                <Button variant={'default'} className="w-full">Submit</Button>
            </form>
        </>
    );
}