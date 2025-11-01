import { Eye, SquarePen, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import type { Row } from "@tanstack/react-table";

export function ActionsColumn({children }: { children?: React.ReactNode}) {
    return (
        <div className="text-right font-medium">
            {children}
        </div>
    );
}