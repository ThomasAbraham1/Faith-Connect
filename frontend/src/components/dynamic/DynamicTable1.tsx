"use client";

import * as React from "react";
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type Row,
    type SortingState,
    type Table,
    useReactTable,
    type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table as TableComponent,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import * as lodash from "lodash";

const FormattedCell = React.memo(({ value, columnKey }: { value: any, columnKey: string }) => {
    let displayValue: any = value;
    
    const isDateKey = columnKey.toLowerCase().includes('date') || columnKey.endsWith('At');
    if (isDateKey && typeof value === "string") {
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
            displayValue = parsed.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    } else if (typeof value === "string" && !["email", "userName", "household", "householdRole"].includes(columnKey)) {
        displayValue = lodash.startCase(value);
    }

    return (
        <div className="py-2 text-sm">{displayValue}</div>
    );
});

const MemoizedTableRow = React.memo(({ row }: { row: Row<any> }) => {
    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className={cell.column.id === "actions" ? "sticky right-0 bg-card group-hover:bg-muted/50 group-data-[state=selected]:bg-muted z-10" : ""}>
                    {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                    )}
                </TableCell>
            ))}
        </TableRow>
    );
}, (prevProps, nextProps) => {
    // Only re-render if selection state changes or underlying data reference changes
    return prevProps.row.getIsSelected() === nextProps.row.getIsSelected() && 
           prevProps.row.original === nextProps.row.original;
});

export function DynamicTable1<T>({
    ref,
    data,
    columnOptions = { HideColumns: [] },
    getSelectedRowsObject,
    initialRowSelection = {},
    children
}: {
    ref?: React.Ref<Table<T>>,
    data: any;
    columnOptions?: { HideColumns: string[] };
    getSelectedRowsObject?: (value: Record<string, Row<T>> | boolean) => void
    initialRowSelection?: Record<string, boolean>;
    children?: (row: Row<T>) => React.ReactNode
}) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    );
    const isMounted = React.useRef(false);
    let columnVisibilityObject = columnOptions.HideColumns.map((col: string) => ({ [col]: false })).reduce((acc: any, curr: any) => ({ ...acc, ...curr }), {});
    // console.log('columnVisibilityObject', columnVisibilityObject);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>(columnVisibilityObject);
    const [rowSelection, setRowSelection] = React.useState(initialRowSelection);
    const [globalFilter, setGlobalFilter] = React.useState("");

    const priorityKeys = ["firstName", "lastName", "userName", "email", "phone", "eventName", "eventDate", "eventLocation", "status"];

    const childrenRef = React.useRef(children);
    React.useEffect(() => {
        childrenRef.current = children;
    }, [children]);

    const hasChildren = !!children;

    const columns = React.useMemo(() => {
        let sortedKeys = data?.length > 0 ? Object.keys(data[0]).sort((a, b) => {
            const indexA = priorityKeys.indexOf(a);
            const indexB = priorityKeys.indexOf(b);

            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;

            return 0;
        }) : [];

        let cols: ColumnDef<T>[] = sortedKeys.map((key) => {
            return {
                accessorKey: key,
                header: ({ column }) => {
                    return (
                        <div 
                            className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors py-2 font-bold text-xs tracking-wider"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            {lodash.startCase(key)}
                            <ArrowUpDown className="size-3" />
                        </div>
                    );
                },
                cell: ({ row }) => {
                    return <FormattedCell value={row.getValue(key)} columnKey={key} />;
                },
            }
        });

        cols.unshift({
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        });

        if (hasChildren) {
            cols.push({
                accessorKey: "actions",
                header: () => (
                    <div className="font-bold text-xs tracking-wider py-2">
                        Actions
                    </div>
                ),
                cell: ({ row }) => {
                    if (childrenRef.current) {
                        return childrenRef.current(row);
                    }
                    return null;
                },
            });
        }

        return cols;
    }, [data, hasChildren]);
    // console.log(children, 'child found');
    //         }
    //         console.log('childrenArray', childrenArray)
    //     });
    // }



    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        autoResetPageIndex: false,
    });

    //  EXPOSE TABLE VIA REF
    React.useImperativeHandle(ref, () => (table), [table]);

    if (getSelectedRowsObject) {
        React.useEffect(() => {
            // Only runs when dependencies change (skips initial load)
            if (isMounted.current) {
                // console.log(rowSelection)
                return getSelectedRowsObject(table.getSelectedRowModel().rowsById ? table.getSelectedRowModel().rowsById : false)
            } else {
                isMounted.current = true
            }
        }, [
            getSelectedRowsObject, rowSelection
        ]);
    }
    // console.log(table.getAllColumns());
    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter fields"
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="overflow-hidden rounded-md border grid">
                <TableComponent className="">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className={`${header.column.id == "actions" ? "sticky right-0 bg-card group-hover:bg-muted/50 group-data-[state=selected]:bg-muted z-10" : ""} font-bold text-xs tracking-wider`}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <MemoizedTableRow key={row.id} row={row} />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </TableComponent>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
