import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CreditCard, 
  Plus, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Calendar,
  TrendingUp,
  Wallet,
  AlertTriangle,
  Trash2,
  Edit,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useCards } from "@/hooks/useCards";

interface Invoice {
  card: string;
  amount: number;
  dueDate: string;
  status: "open" | "pending" | "paid";
}

const Cards = () => {
  const { cards, loading, createCard, updateCard, deleteCard } = useCards();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showNumbers, setShowNumbers] = useState<{ [key: string]: boolean }>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [newCard, setNewCard] = useState({
    name: "",
    brand: "",
    limit: "",
    dueDate: "",
    lastDigits: "",
  });

  const totalLimit = cards.reduce((acc, card: any) => acc + (card.credit_limit || 0), 0);
  const totalUsed = cards.reduce((acc, card: any) => acc + (card.current_balance || 0), 0);
  const availableCredit = totalLimit - totalUsed;

  const toggleCardNumber = (id: string) => {
    setShowNumbers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBlockCard = async (cardId: string) => {
    const card = cards.find((c: any) => c.id === cardId);
    if (!card) return;

    const newIsActive = !card.is_active;
    const { error } = await updateCard(cardId, { is_active: newIsActive });

    if (error) {
      toast.error("Erro ao atualizar status do cartão");
      return;
    }

    const action = newIsActive ? "desbloqueado" : "bloqueado";
    toast.success(`Cartão ${card.name} ${action} com sucesso!`);
  };

  const handleDeleteCard = async (cardId: string) => {
    const card = cards.find((c: any) => c.id === cardId);
    const { error } = await deleteCard(cardId);

    if (error) {
      toast.error("Erro ao remover cartão");
      return;
    }

    setInvoices((prev) => prev.filter((i) => i.card !== card?.name));
    toast.success(`Cartão ${card?.name} removido com sucesso!`);
  };

  const handleAddCard = async () => {
    if (!newCard.name || !newCard.brand || !newCard.limit || !newCard.dueDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    const colorOptions = [
      "from-emerald-500 to-emerald-700",
      "from-blue-500 to-blue-700",
      "from-pink-500 to-pink-700",
      "from-indigo-500 to-indigo-700",
    ];
    
    const { error } = await createCard({
      name: newCard.name,
      brand: newCard.brand as any,
      last_four_digits: newCard.lastDigits || "0000",
      credit_limit: parseFloat(newCard.limit),
      current_balance: 0,
      due_day: parseInt(newCard.dueDate),
      closing_day: parseInt(newCard.dueDate) - 7,
      color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
      is_active: true,
      account_id: null,
    });
    
    if (error) {
      toast.error("Erro ao adicionar cartão");
      return;
    }

    setNewCard({ name: "", brand: "", limit: "", dueDate: "", lastDigits: "" });
    setDialogOpen(false);
    toast.success("Cartão adicionado com sucesso!");
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setInvoiceDialogOpen(true);
  };

  const handlePayInvoice = (invoice: Invoice) => {
    setInvoices((prev) =>
      prev.map((i) => (i.card === invoice.card ? { ...i, status: "paid" as const } : i))
    );
    setInvoiceDialogOpen(false);
    toast.success(`Fatura do ${invoice.card} paga com sucesso!`);
  };

  const handleEditCard = (card: any) => {
    setSelectedCard(card);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedCard) return;

    const { error } = await updateCard(selectedCard.id, {
      name: selectedCard.name,
      brand: selectedCard.brand,
      credit_limit: selectedCard.credit_limit,
      current_balance: selectedCard.current_balance,
      due_day: selectedCard.due_day,
      closing_day: selectedCard.closing_day,
      color: selectedCard.color,
      is_active: selectedCard.is_active,
    });

    if (error) {
      toast.error("Erro ao salvar alterações do cartão");
      return;
    }

    setEditDialogOpen(false);
    toast.success("Cartão atualizado com sucesso!");
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold">Cartões de Crédito</h1>
            <p className="text-muted-foreground">Gerencie seus cartões e faturas</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="glow" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Cartão
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cartão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome do Cartão</Label>
                  <Input 
                    placeholder="Ex: Nubank, Inter, C6..." 
                    value={newCard.name}
                    onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bandeira</Label>
                  <Select value={newCard.brand} onValueChange={(v) => setNewCard({ ...newCard, brand: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a bandeira" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visa">Visa</SelectItem>
                      <SelectItem value="mastercard">Mastercard</SelectItem>
                      <SelectItem value="elo">Elo</SelectItem>
                      <SelectItem value="amex">American Express</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Limite</Label>
                    <Input 
                      type="number" 
                      placeholder="R$ 0,00" 
                      value={newCard.limit}
                      onChange={(e) => setNewCard({ ...newCard, limit: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dia Vencimento</Label>
                    <Input 
                      type="number" 
                      placeholder="10" 
                      min={1} 
                      max={31}
                      value={newCard.dueDate}
                      onChange={(e) => setNewCard({ ...newCard, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Últimos 4 dígitos</Label>
                  <Input 
                    placeholder="0000" 
                    maxLength={4}
                    value={newCard.lastDigits}
                    onChange={(e) => setNewCard({ ...newCard, lastDigits: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddCard} className="w-full">
                  Adicionar Cartão
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 [&>*:last-child:nth-child(odd)]:col-span-2 md:[&>*:last-child:nth-child(odd)]:col-span-1 max-sm:[&_.p-6]:p-4">
          <Card className="bg-card border-border animate-slide-up">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Cartões</p>
                  <p className="text-2xl font-bold">{cards.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "50ms" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <Wallet className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Limite Total</p>
                  <p className="text-2xl font-bold">
                    {totalLimit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <TrendingUp className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Utilizado</p>
                  <p className="text-2xl font-bold">
                    {totalUsed.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "150ms" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Disponível</p>
                  <p className="text-2xl font-bold">
                    {availableCredit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card: any, index: number) => (
            <Card
              key={card.id}
              className="overflow-hidden animate-slide-up"
              style={{ animationDelay: `${200 + index * 50}ms` }}
            >
              {/* Card Visual */}
              <div className={`relative h-48 bg-gradient-to-br ${card.color} p-6 text-white`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm opacity-80">{card.name}</p>
                    <p className="text-lg font-mono mt-4">
                      {showNumbers[card.id] ?
                        `**** **** **** ${card.last_four_digits || "0000"}` :
                        "**** **** **** " + (card.last_four_digits || "0000")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/80 hover:text-white hover:bg-white/10"
                      onClick={() => toggleCardNumber(card.id)}
                    >
                      {showNumbers[card.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/80 hover:text-white hover:bg-white/10"
                      onClick={() => handleEditCard(card)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/80 hover:text-red-400 hover:bg-white/10"
                      onClick={() => handleDeleteCard(card.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div>
                    <p className="text-xs opacity-60">Vencimento</p>
                    <p className="text-sm font-medium">Dia {card.due_day}</p>
                  </div>
                  <Badge
                    variant={card.is_active ? "default" : "destructive"}
                    className="bg-white/20 text-white border-0"
                  >
                    {card.is_active ? "Ativo" : "Bloqueado"}
                  </Badge>
                </div>
              </div>

              {/* Card Info */}
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Limite utilizado</span>
                    <span className="font-medium">
                      {card.credit_limit
                        ? ((card.current_balance / card.credit_limit) * 100).toFixed(0)
                        : 0}
                      %
                    </span>
                  </div>
                  <Progress
                    value={card.credit_limit ? (card.current_balance / card.credit_limit) * 100 : 0}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs mt-2 text-muted-foreground">
                    <span>
                      {card.current_balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                    <span>
                      {card.credit_limit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => handleViewInvoice(invoices.find(i => i.card === card.name) || { card: card.name, amount: card.current_balance, dueDate: `${card.due_day}/01/2025`, status: "open" })}
                  >
                    <FileText className="h-4 w-4" />
                    Ver Fatura
                  </Button>
                  <Button
                    variant={!card.is_active ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    onClick={() => handleBlockCard(card.id)}
                  >
                    {!card.is_active ? (
                      <>
                        <Unlock className="h-4 w-4" />
                        Desbloquear
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Bloquear
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming Invoices */}
        <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "350ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Próximas Faturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.map((invoice, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer"
                  onClick={() => handleViewInvoice(invoice)}
                >
                  <div className="flex items-center gap-4">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{invoice.card}</p>
                      <p className="text-sm text-muted-foreground">Vence em {invoice.dueDate}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-bold">
                        {invoice.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                      <Badge
                        variant={invoice.status === "paid" ? "default" : invoice.status === "open" ? "outline" : "secondary"}
                        className="text-xs"
                      >
                        {invoice.status === "paid" ? "Paga" : invoice.status === "open" ? "Aberta" : "Pendente"}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewInvoice(invoice); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Dialog */}
        <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fatura - {selectedInvoice?.card}</DialogTitle>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-muted-foreground">Valor Total</span>
                    <span className="text-2xl font-bold">
                      {selectedInvoice.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vencimento</span>
                    <span>{selectedInvoice.dueDate}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={selectedInvoice.status === "paid" ? "default" : "outline"}>
                      {selectedInvoice.status === "paid" ? "Paga" : selectedInvoice.status === "open" ? "Aberta" : "Pendente"}
                    </Badge>
                  </div>
                </div>
                {selectedInvoice.status !== "paid" && (
                  <Button className="w-full" onClick={() => handlePayInvoice(selectedInvoice)}>
                    Pagar Fatura
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Card Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Cartão</DialogTitle>
            </DialogHeader>
            {selectedCard && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome do Cartão</Label>
                  <Input 
                    value={selectedCard.name}
                    onChange={(e) => setSelectedCard({ ...selectedCard, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Limite</Label>
                    <Input 
                      type="number"
                      value={selectedCard.limit}
                      onChange={(e) => setSelectedCard({ ...selectedCard, limit: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dia Vencimento</Label>
                    <Input 
                      type="number"
                      value={selectedCard.dueDate}
                      onChange={(e) => setSelectedCard({ ...selectedCard, dueDate: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveEdit} className="w-full">
                  Salvar Alterações
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Cards;
