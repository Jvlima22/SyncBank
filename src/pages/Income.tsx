import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Search,
  Filter,
  Upload,
  TrendingUp,
  DollarSign,
  FileText,
  MoreHorizontal,
  ShoppingBag,
  Briefcase,
  Users,
  Gift,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useIncomes } from "@/hooks/useIncomes";
interface ManualIncome {
  id: string;
  type: string;
  amount: number;
  date: string;
  origin: string;
  category: string;
  description: string;
  status: "received" | "pending";
  hasAttachment: boolean;
}

const incomeTypes = [
  { value: "product_sale", label: "Venda de produto", icon: ShoppingBag },
  { value: "service", label: "Prestação de serviço", icon: Briefcase },
  { value: "commission", label: "Comissão", icon: Users },
  { value: "freelance", label: "Freelance", icon: Briefcase },
  { value: "refund", label: "Reembolso", icon: Gift },
  { value: "salary", label: "Salário", icon: DollarSign },
  { value: "investment", label: "Investimentos", icon: DollarSign },
  { value: "other", label: "Outros", icon: DollarSign },
];

const categories = [
  "E-commerce",
  "Consultoria",
  "Freelance",
  "Afiliado",
  "Reembolso",
  "Investimentos",
  "Outros",
];

export default function Income() {
  const { incomes: dbIncomes, loading, createIncome, updateIncome, deleteIncome } = useIncomes();

  const [incomes, setIncomes] = useState<ManualIncome[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<ManualIncome | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newIncome, setNewIncome] = useState({
    type: "product_sale",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    origin: "",
    category: "",
    description: "",
    status: "received" as "received" | "pending",
  });

  useEffect(() => {
    const mapped = dbIncomes.map((income: any): ManualIncome => {
      const typeLabel =
        incomeTypes.find((t) => t.value === income.income_type)?.label ||
        income.income_type ||
        "Outros";

      return {
        id: income.id,
        type: typeLabel,
        amount: income.amount,
        date: income.date,
        origin: income.client_source || "",
        category: income.category || "",
        description: income.description || "",
        status: income.status,
        hasAttachment: !!income.attachment_url,
      };
    });
    setIncomes(mapped);
  }, [dbIncomes]);

  const totalReceived = incomes
    .filter((i) => i.status === "received")
    .reduce((acc, i) => acc + i.amount, 0);

  const totalPending = incomes
    .filter((i) => i.status === "pending")
    .reduce((acc, i) => acc + i.amount, 0);

  const filteredIncomes = incomes.filter((income) => {
    const matchesSearch =
      income.origin.toLowerCase().includes(search.toLowerCase()) ||
      income.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || income.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateIncome = async () => {
    if (!newIncome.type || !newIncome.amount || !newIncome.origin || !newIncome.category) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const amountValue = parseFloat(newIncome.amount);

    const { error } = await createIncome({
      income_type: newIncome.type as any,
      amount: amountValue,
      date: newIncome.date,
      client_source: newIncome.origin,
      category: newIncome.category,
      description: newIncome.description,
      attachment_url: null,
      status: newIncome.status,
    });

    if (error) {
      toast.error("Erro ao registrar receita");
      return;
    }

    setNewIncome({
      type: "product_sale",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      origin: "",
      category: "",
      description: "",
      status: "received",
    });
    setIsDialogOpen(false);
    toast.success("Receita registrada com sucesso!");
  };

  const handleDeleteIncome = async (incomeId: string) => {
    const { error } = await deleteIncome(incomeId);
    if (error) {
      toast.error("Erro ao excluir receita");
      return;
    }
    toast.success("Receita removida com sucesso!");
  };

  const handleEditIncome = (income: ManualIncome) => {
    setSelectedIncome(income);
    setEditDialogOpen(true);
  };

  const handleViewIncome = (income: ManualIncome) => {
    setSelectedIncome(income);
    setViewDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedIncome) return;

    const incomeType =
      incomeTypes.find((t) => t.label === selectedIncome.type)?.value || "other";

    const { error } = await updateIncome(selectedIncome.id, {
      amount: selectedIncome.amount,
      date: selectedIncome.date,
      client_source: selectedIncome.origin,
      category: selectedIncome.category,
      description: selectedIncome.description,
      status: selectedIncome.status,
      income_type: incomeType as any,
    });

    if (error) {
      toast.error("Erro ao atualizar receita");
      return;
    }

    setEditDialogOpen(false);
    toast.success("Receita atualizada com sucesso!");
  };

  const handleMarkAsReceived = async (incomeId: string) => {
    const { error } = await updateIncome(incomeId, { status: "received" });
    if (error) {
      toast.error("Erro ao atualizar receita");
      return;
    }
    toast.success("Receita marcada como recebida!");
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
              Receitas Manuais
            </h1>
            <p className="text-muted-foreground">
              Registre vendas, serviços e recebimentos avulsos
            </p>
          </div>
          <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova Receita
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 [&>*:last-child:nth-child(odd)]:col-span-2 md:[&>*:last-child:nth-child(odd)]:col-span-1 max-sm:[&_.p-6]:p-4">
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Recebido</p>
                  <p className="tabular text-lg font-bold sm:text-3xl text-success">
                    R$ {totalReceived.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Este mês
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendente</p>
                  <p className="tabular text-lg font-bold sm:text-3xl text-warning">
                    R$ {totalPending.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Aguardando confirmação
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total de Registros
                  </p>
                  <p className="text-2xl font-bold text-foreground sm:text-3xl">
                    {incomes.length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receitas manuais
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                  <DollarSign className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente ou descrição..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="received">Recebidos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Income List */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Receitas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredIncomes.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleViewIncome(income)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                      <DollarSign className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {income.origin}
                        </p>
                        {income.hasAttachment && (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{income.type}</span>
                        <span>•</span>
                        <span>{income.category}</span>
                        <span>•</span>
                        <span>
                          {new Date(income.date).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      {income.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {income.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        income.status === "received"
                          ? "text-success border-success/30 bg-success/10"
                          : "text-warning border-warning/30 bg-warning/10"
                      )}
                    >
                      {income.status === "received" ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {income.status === "received" ? "Recebido" : "Pendente"}
                    </Badge>
                    <div className="text-right">
                      <p className="font-semibold text-success">
                        +R$ {income.amount.toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewIncome(income); }}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditIncome(income); }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        {income.status === "pending" && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMarkAsReceived(income.id); }}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar como recebido
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleDeleteIncome(income.id); }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Create Income Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar Nova Receita</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>Tipo de receita</Label>
                <Select value={newIncome.type} onValueChange={(v) => setNewIncome({ ...newIncome, type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {incomeTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0,00"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input 
                    id="date" 
                    type="date"
                    value={newIncome.date}
                    onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin">Cliente / Origem</Label>
                <Input 
                  id="origin" 
                  placeholder="Ex: Empresa ABC"
                  value={newIncome.origin}
                  onChange={(e) => setNewIncome({ ...newIncome, origin: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={newIncome.category} onValueChange={(v) => setNewIncome({ ...newIncome, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
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
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Detalhes sobre a receita..."
                  rows={3}
                  value={newIncome.description}
                  onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={newIncome.status} 
                  onValueChange={(v) => setNewIncome({ ...newIncome, status: v as "received" | "pending" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="received">Recebido</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Anexo (opcional)</Label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nota fiscal, recibo ou comprovante
                      </p>
                    </div>
                    <input type="file" className="hidden" />
                  </label>
                </div>
              </div>

              <Button className="w-full" onClick={handleCreateIncome}>
                Registrar Receita
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Income Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Receita</DialogTitle>
            </DialogHeader>
            {selectedIncome && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor (R$)</Label>
                    <Input 
                      type="number"
                      value={selectedIncome.amount}
                      onChange={(e) => setSelectedIncome({ ...selectedIncome, amount: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input 
                      type="date"
                      value={selectedIncome.date}
                      onChange={(e) => setSelectedIncome({ ...selectedIncome, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cliente / Origem</Label>
                  <Input 
                    value={selectedIncome.origin}
                    onChange={(e) => setSelectedIncome({ ...selectedIncome, origin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={selectedIncome.description}
                    onChange={(e) => setSelectedIncome({ ...selectedIncome, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={selectedIncome.status} 
                    onValueChange={(v) => setSelectedIncome({ ...selectedIncome, status: v as "received" | "pending" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="received">Recebido</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleSaveEdit}>
                  Salvar Alterações
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* View Income Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes da Receita</DialogTitle>
            </DialogHeader>
            {selectedIncome && (
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-xl bg-success/10 text-center">
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="tabular text-lg font-bold sm:text-3xl text-success">
                    R$ {selectedIncome.amount.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo</span>
                    <span className="font-medium">{selectedIncome.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cliente/Origem</span>
                    <span className="font-medium">{selectedIncome.origin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoria</span>
                    <span className="font-medium">{selectedIncome.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data</span>
                    <span className="font-medium">
                      {new Date(selectedIncome.date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        selectedIncome.status === "received"
                          ? "text-success border-success/30 bg-success/10"
                          : "text-warning border-warning/30 bg-warning/10"
                      )}
                    >
                      {selectedIncome.status === "received" ? "Recebido" : "Pendente"}
                    </Badge>
                  </div>
                  {selectedIncome.description && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-1">Descrição</p>
                      <p className="text-foreground">{selectedIncome.description}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleEditIncome(selectedIncome);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  {selectedIncome.status === "pending" && (
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        handleMarkAsReceived(selectedIncome.id);
                        setViewDialogOpen(false);
                      }}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Marcar Recebido
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
