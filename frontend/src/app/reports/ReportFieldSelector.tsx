import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square } from "lucide-react";

interface Field {
  key: string;
  label: string;
}

interface ReportFieldSelectorProps {
  fields: Field[];
  selected: string[];
  onChange: (selected: string[]) => void;
  isLoading?: boolean;
}

export function ReportFieldSelector({ fields, selected, onChange, isLoading }: ReportFieldSelectorProps) {
  const allSelected = fields.length > 0 && selected.length === fields.length;
  const someSelected = selected.length > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(fields.map(f => f.key));
    }
  };

  const toggleField = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted/50 rounded-md" />
        ))}
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No fields available for this report type.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Select All Toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-border/30">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {selected.length} of {fields.length} selected
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAll}
          className="h-7 px-3 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
        >
          {allSelected ? (
            <><Square className="h-3.5 w-3.5" /> Deselect All</>
          ) : (
            <><CheckSquare className="h-3.5 w-3.5" /> Select All</>
          )}
        </Button>
      </div>

      {/* Field Checkboxes — 2-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {fields.map((field) => {
          const isChecked = selected.includes(field.key);
          const isCustom = field.key.startsWith("custom_");

          return (
            <label
              key={field.key}
              className={`flex items-center gap-3 px-4 py-3 rounded-md border cursor-pointer transition-all duration-150 select-none
                ${isChecked
                  ? "bg-primary/10 border-primary/30 text-foreground"
                  : "bg-muted/20 border-border/30 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => toggleField(field.key)}
                className="pointer-events-none"
              />
              <span className="text-sm font-medium leading-tight flex-1">{field.label}</span>
              {isCustom && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded-md">
                  Custom
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
