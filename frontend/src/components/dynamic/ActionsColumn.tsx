export function ActionsColumn({ children }: { children?: React.ReactNode }) {
    return (
        <div className="text-right font-medium flex gap-2 justify-center">
            {children}
        </div>
    );
}