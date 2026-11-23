import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Target,
  TrendingUp,
  Plane,
  Car,
  Home,
  GraduationCap,
  Gift,
  Wallet,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  PiggyBank,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useGoals } from "@/hooks/useGoals";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  plane: Plane,
  car: Car,
  home: Home,
  graduation: GraduationCap,
  gift: Gift,
  wallet: Wallet,
  target: Target,
};

const categories = [
  "Viagem",
  "Veículo",
  "Moradia",
  "Educação",
  "Segurança",
  "Presente",
  "Outros",
];

export default function Goals() {
  const { goals, loading, createGoal, updateGoal, deleteGoal, refetch } = useGoals();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<typeof goals[0] | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    monthlyContribution: "",
    category: "",
    deadline: "",
    icon: "target",
  });

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === "completed").length;
  const totalSaved = goals.reduce((acc, g) => acc + (g.current_amount || 0), 0);
  const totalTarget = goals.reduce((acc, g) => acc + (g.target_amount || 0), 0);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          label: "Concluída",
          color: "text-success border-success/30 bg-success/10",
          icon: CheckCircle,
        };
      case "on_track":
        return {
          label: "No prazo",
          color: "text-primary border-primary/30 bg-primary/10",
          icon: Clock,
        };
      case "behind":
        return {
          label: "Atrasada",
          color: "text-warning border-warning/30 bg-warning/10",
          icon: AlertTriangle,
        };
      default:
        return {
          label: "Em andamento",
          color: "text-primary border-primary/30 bg-primary/10",
          icon: Clock,
        };
    }
  };

  const handleCreateGoal = async () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.category || !newGoal.deadline) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const { error } = await createGoal({
      name: newGoal.name,
      icon: newGoal.icon,
      target_amount: parseFloat(newGoal.targetAmount),
      current_amount: 0,
      target_date: newGoal.deadline,
      category: newGoal.category,
      description: null,
      status: "active",
      color: "#10b981",
    });

    if (error) {
      toast.error("Erro ao criar meta");
    } else {
      setNewGoal({
        name: "",
        targetAmount: "",
        monthlyContribution: "",
        category: "",
        deadline: "",
        icon: "target",
      });
      setIsDialogOpen(false);
      toast.success("Meta criada com sucesso!");
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    const { error } = await deleteGoal(goalId);
    if (error) {
      toast.error("Erro ao remover meta");
    } else {
      toast.success(`Meta "${goal?.name}" removida!`);
    }
  };

  const handleEditGoal = (goal: typeof goals[0]) => {
    setSelectedGoal(goal);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (selectedGoal) {
      const { error } = await updateGoal(selectedGoal.id, {
        name: selectedGoal.name,
        target_amount: selectedGoal.target_amount,
        current_amount: selectedGoal.current_amount,
      });

      if (error) {
        toast.error("Erro ao atualizar meta");
      } else {
        setEditDialogOpen(false);
        toast.success("Meta atualizada com sucesso!");
      }
    }
  };

  const handleDeposit = (goal: typeof goals[0]) => {
    setSelectedGoal(goal);
    setDepositAmount("");
    setDepositDialogOpen(true);
  };

  const handleConfirmDeposit = async () => {
    if (!selectedGoal || !depositAmount) return;

    const amount = parseFloat(depositAmount);
    const newAmount = (selectedGoal.current_amount || 0) + amount;
    const isCompleted = newAmount >= (selectedGoal.target_amount || 0);

    const { error } = await updateGoal(selectedGoal.id, {
      current_amount: Math.min(newAmount, selectedGoal.target_amount || 0),
      status: isCompleted ? "completed" : selectedGoal.status,
    });

    if (error) {
      toast.error("Erro ao depositar");
    } else {
      setDepositDialogOpen(false);
      if (isCompleted) {
        toast.success(`🎉 Parabéns! Meta "${selectedGoal.name}" concluída!`);
      } else {
        toast.success(`R$ ${amount.toLocaleString("pt-BR")} depositado na meta!`);
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Metas Financeiras
            </h1>
            <p className="text-muted-foreground">
              Acompanhe e gerencie seus objetivos de economia
            </p>
          </div>
          <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova Meta
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 [&>*:last-child:nth-child(odd)]:col-span-2 md:[&>*:last-child:nth-child(odd)]:col-span-1 max-sm:[&_.p-6]:p-4">
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary">
                  <Target className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Metas</p>
                  <p className="text-2xl font-bold text-foreground">{totalGoals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Concluídas</p>
                  <p className="text-2xl font-bold text-success">{completedGoals}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Guardado</p>
                  <p className="text-xl font-bold text-foreground">
                    R$ {totalSaved.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progresso Geral</p>
                  <p className="text-xl font-bold text-foreground">
                    {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const Icon = iconMap[goal.icon || "target"] || Target;
            const statusConfig = getStatusConfig(goal.status || "on_track");
            const StatusIcon = statusConfig.icon;
            const progress = ((goal.current_amount || 0) / (goal.target_amount || 1)) * 100;
            const remaining = (goal.target_amount || 0) - (goal.current_amount || 0);
            const daysLeft = goal.target_date
              ? Math.ceil(
                  (new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )
              : 0;

            return (
              <Card
                key={goal.id}
                className={cn(
                  "glass overflow-hidden transition-all hover:shadow-lg",
                  goal.status === "completed" && "border-success/30"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl",
                          goal.status === "completed"
                            ? "bg-success/10"
                            : "gradient-primary"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            goal.status === "completed"
                              ? "text-success"
                              : "text-primary-foreground"
                          )}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-base">{goal.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {goal.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className={statusConfig.color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onClick={() => handleDeposit(goal)}>
                            <PiggyBank className="mr-2 h-4 w-4" />
                            Depositar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditGoal(goal)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress
                      value={Math.min(progress, 100)}
                      className={cn(
                        "h-3",
                        goal.status === "completed" && "[&>div]:bg-success",
                        goal.status === "paused" && "[&>div]:bg-warning"
                      )}
                    />
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">
                        R$ {(goal.current_amount || 0).toLocaleString("pt-BR")}
                      </span>
                      <span className="text-muted-foreground">
                        de R$ {(goal.target_amount || 0).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  {goal.status !== "completed" && (
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Faltam</p>
                        <p className="font-semibold text-foreground">
                          R$ {remaining.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Prazo</p>
                        <p className="font-semibold text-foreground">
                          {daysLeft > 0 ? `${daysLeft} dias` : "Vencido"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Meta: R$ {(goal.target_amount || 0).toLocaleString("pt-BR")}
                    </p>
                    {goal.status !== "completed" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeposit(goal)}
                      >
                        <PiggyBank className="mr-2 h-4 w-4" />
                        Depositar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Add Goal Card */}
          <Card 
            className="flex min-h-[320px] cursor-pointer items-center justify-center border-2 border-dashed border-border bg-transparent transition-all hover:border-primary hover:bg-muted/30"
            onClick={() => setIsDialogOpen(true)}
          >
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">Criar nova meta</p>
              <p className="text-sm text-muted-foreground">
                Defina seus objetivos financeiros
              </p>
            </div>
          </Card>
        </div>

        {/* Create Goal Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Nova Meta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da meta</Label>
                <Input 
                  id="name" 
                  placeholder="Ex: Viagem para Paris"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target">Valor alvo</Label>
                  <Input 
                    id="target" 
                    type="number" 
                    placeholder="0,00"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly">Aporte mensal</Label>
                  <Input 
                    id="monthly" 
                    type="number" 
                    placeholder="0,00"
                    value={newGoal.monthlyContribution}
                    onChange={(e) => setNewGoal({ ...newGoal, monthlyContribution: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select 
                    value={newGoal.category} 
                    onValueChange={(v) => setNewGoal({ ...newGoal, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo</Label>
                  <Input 
                    id="deadline" 
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleCreateGoal}>
                Criar Meta
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Goal Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Meta</DialogTitle>
            </DialogHeader>
            {selectedGoal && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome da meta</Label>
                  <Input 
                    value={selectedGoal.name}
                    onChange={(e) => setSelectedGoal({ ...selectedGoal, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor alvo</Label>
                    <Input 
                      type="number"
                      value={selectedGoal.target_amount}
                      onChange={(e) => setSelectedGoal({ ...selectedGoal, target_amount: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor atual</Label>
                    <Input 
                      type="number"
                      value={selectedGoal.current_amount}
                      onChange={(e) => setSelectedGoal({ ...selectedGoal, current_amount: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={handleSaveEdit}>
                  Salvar Alterações
                </Button>
                <Button className="w-full" onClick={handleSaveEdit}>
                  Salvar Alterações
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Deposit Dialog */}
        <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Depositar na Meta</DialogTitle>
            </DialogHeader>
            {selectedGoal && (
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-sm text-muted-foreground">Meta</p>
                  <p className="font-semibold">{selectedGoal.name}</p>
                  <div className="mt-2 flex justify-between text-sm">
                    <span>Progresso atual:</span>
                    <span className="font-medium">
                      R$ {(selectedGoal.current_amount || 0).toLocaleString("pt-BR")} / R$ {(selectedGoal.target_amount || 0).toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Valor do depósito</Label>
                  <Input 
                    type="number"
                    placeholder="R$ 0,00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleConfirmDeposit}>
                  <PiggyBank className="mr-2 h-4 w-4" />
                  Confirmar Depósito
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
