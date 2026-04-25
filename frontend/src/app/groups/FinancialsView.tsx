import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IndianRupee, Landmark, FileText, Download, Wallet, Loader2, Trash2 } from "lucide-react";
import { LogExpense } from "./LogExpense";
import { toast } from "sonner";
import type { Group, Expense } from "./types/groups.types";

interface FinancialsViewProps {
  group: Group;
}

export const FinancialsView: React.FC<FinancialsViewProps> = ({ group }) => {
  const queryClient = useQueryClient();
  const [isEditingBudget, setIsEditingBudget] = React.useState(false);
  const [budgetInput, setBudgetInput] = React.useState(group.allocatedBudget?.toString() || "0");

  const { data: expenses, isLoading: isLoadingExpenses } = useQuery<Expense[]>({
    queryKey: ["expenses", group._id],
    queryFn: async () => {
      const response = await api.get(`/expenses?groupId=${group._id}`);
      return response.data.data;
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: (amount: number) => api.patch(`/groups/${group._id}`, { allocatedBudget: amount }),
    onSuccess: () => {
      toast.success("Budget updated");
      queryClient.invalidateQueries({ queryKey: ["group", group._id] });
      queryClient.invalidateQueries({ queryKey: ["summary-stats"] });
      setIsEditingBudget(false);
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      toast.success("Expense deleted");
      queryClient.invalidateQueries({ queryKey: ["expenses", group._id] });
      queryClient.invalidateQueries({ queryKey: ["group", group._id] });
      queryClient.invalidateQueries({ queryKey: ["summary-stats"] });
    },
  });

  const totalSpent = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const budget = group.allocatedBudget || 0;
  const percentSpent = budget > 0 ? (totalSpent / budget) * 100 : 0;
  const remaining = budget - totalSpent;

  const getStatusColor = () => {
    if (percentSpent >= 100) return "bg-destructive";
    if (percentSpent >= 80) return "bg-amber-500";
    return "bg-primary";
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Budget Overview Card */}
        <Card className="md:col-span-2 bg-background/50 backdrop-blur-xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Budget Overview
            </CardTitle>
            <div className="flex items-center gap-2">
              {isEditingBudget ? (
                <div className="flex items-center gap-2">
                  <Input 
                    className="h-8 w-32" 
                    type="number" 
                    value={budgetInput} 
                    onChange={(e) => setBudgetInput(e.target.value)}
                    autoFocus
                  />
                  <Button size="sm" onClick={() => updateBudgetMutation.mutate(Number(budgetInput))}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingBudget(false)}>Cancel</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditingBudget(true)}>Set Budget</Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Spent so far</p>
                <div className="text-4xl font-black tracking-tighter flex items-center">
                  <IndianRupee className="h-8 w-8 mr-1 text-primary" />
                  {totalSpent.toLocaleString()}
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-xl font-bold">₹{budget.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>{percentSpent.toFixed(1)}% Consumed</span>
                <span className={remaining < 0 ? "text-destructive font-bold" : ""}>
                  {remaining < 0 ? "Over Budget by " : "Remaining: "}
                  ₹{Math.abs(remaining).toLocaleString()}
                </span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-border/50 p-[2px]">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${getStatusColor()}`}
                  style={{ width: `${Math.min(percentSpent, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20 overflow-hidden relative flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Wallet className="h-20 w-20" />
          </div>
          <CardContent className="pt-6 relative text-center">
            <div className="text-3xl font-black text-primary">{expenses?.length || 0}</div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">Total Expenses</div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Ledger */}
      <Card className="bg-background/50 backdrop-blur-xl border-border/50 overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between pt-4">
          <CardTitle className="text-lg">Expense Ledger</CardTitle>
          <LogExpense groupId={group._id} />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border/50">
                <tr>
                  <th className="text-left p-4 font-semibold">Date</th>
                  <th className="text-left p-4 font-semibold">Description</th>
                  <th className="text-left p-4 font-semibold">Logged By</th>
                  <th className="text-right p-4 font-semibold">Amount</th>
                  <th className="text-center p-4 font-semibold">Receipt</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoadingExpenses ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : expenses?.map((expense) => (
                  <tr key={expense._id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-muted-foreground whitespace-nowrap">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-medium">{expense.description}</td>
                    <td className="p-4 text-xs">
                      {expense.submittedBy?.firstName} {expense.submittedBy?.lastName}
                    </td>
                    <td className="p-4 text-right font-bold">₹{expense.amount.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      {expense.receiptUrl ? (
                        <a 
                          href={expense.receiptUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                        >
                          <FileText className="h-4 w-4" />
                          View
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">No receipt</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm("Delete this expense?")) deleteExpenseMutation.mutate(expense._id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {expenses?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground italic">
                      No expenses logged for this group yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
