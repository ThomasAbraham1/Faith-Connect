import { Eye, SquarePen, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import type { Row } from "@tanstack/react-table";

export function ActionsColumn<T>({ setEditingEvent, setIsSheetOpen, row }: { setEditingEvent: React.Dispatch<T | null>, setIsSheetOpen: React.Dispatch<boolean>, row: Row<T> }) {
    return (
        <div className="text-right font-medium">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                    setEditingEvent(row.original);
                    setIsSheetOpen(true);
                }}
            >
                <SquarePen className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
            </Button>
        </div>
    );
}