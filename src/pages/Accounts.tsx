import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BankConnections } from "@/components/banking/BankConnections";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  RefreshCw,
  MoreHorizontal,
  Building2,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  ExternalLink,
  Shield,
  Lock,
  Info,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAccounts } from "@/hooks/useAccounts";

const accountTypeConfig = {
  checking: { label: "Conta Corrente", icon: Building2 },
  savings: { label: "Poupança", icon: PiggyBank },
  credit: { label: "Cartão de Crédito", icon: CreditCard },
  investment: { label: "Investimentos", icon: TrendingUp },
};

const availableBanks = [
  { name: "Nubank", logo: "🟣", color: "bg-purple-500" },
  { name: "Inter", logo: "🟠", color: "bg-orange-500" },
  { name: "C6 Bank", logo: "⬛", color: "bg-gray-800" },
  { name: "Bradesco", logo: "🔴", color: "bg-red-600" },
  { name: "Itaú", logo: "🟠", color: "bg-orange-500" },
  { name: "Banco do Brasil", logo: "🟡", color: "bg-yellow-500" },
  { name: "Santander", logo: "🔴", color: "bg-red-600" },
  { name: "XP Investimentos", logo: "🟡", color: "bg-yellow-500" },
];

export default function Accounts() {
  const navigate = useNavigate();
  const { accounts, loading, createAccount, updateAccount, deleteAccount, refetch } = useAccounts();
  const [showBalances, setShowBalances] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<typeof accounts[0] | null>(null);
  const [newAccount, setNewAccount] = useState({
    bank: "",
    type: "" as "checking" | "savings" | "credit" | "investment" | "",
    balance: "",
  });

  const totalBalance = accounts
    .filter((acc) => acc.account_type !== "credit")
    .reduce((acc, curr) => acc + (curr.balance || 0), 0);

  const totalCredit = accounts
    .filter((acc) => acc.account_type === "credit")
    .reduce((acc, curr) => acc + Math.abs(curr.balance || 0), 0);

  const handleSync = (accountId: string) => {
    setSyncing(accountId);
    setTimeout(() => {
      setSyncing(null);
      toast.success("Conta sincronizada com sucesso!");
    }, 2000);
  };

  const handleSyncAll = () => {
    setSyncing("all");
    setTimeout(() => {
      setSyncing(null);
      toast.success("Todas as contas sincronizadas!");
    }, 3000);
  };

  const handleDeleteAccount = async (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    const { error } = await deleteAccount(accountId);
    if (error) {
      toast.error("Erro ao desconectar conta");
    } else {
      toast.success(`Conta ${account?.name} desconectada com sucesso!`);
    }
  };

  const handleEditAccount = (account: typeof accounts[0]) => {
    setSelectedAccount(account);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (selectedAccount) {
      const { error } = await updateAccount(selectedAccount.id, {
        name: selectedAccount.name,
        balance: selectedAccount.balance,
      });
      if (error) {
        toast.error("Erro ao atualizar conta");
      } else {
        setEditDialogOpen(false);
        toast.success("Conta atualizada com sucesso!");
      }
    }
  };

  const handleConnectBank = async () => {
    if (!newAccount.bank || !newAccount.type) {
      toast.error("Selecione o banco e tipo de conta");
      return;
    }

    const bank = availableBanks.find((b) => b.name === newAccount.bank);
    const { error } = await createAccount({
      name: newAccount.bank,
      bank_name: newAccount.bank,
      account_type: newAccount.type as "checking" | "savings" | "credit" | "investment",
      balance: parseFloat(newAccount.balance) || 0,
      currency: "BRL",
      color: bank?.color || "bg-gray-500",
      icon: bank?.logo || "🏦",
      is_active: true,
      last_sync_at: null,
    });

    if (error) {
      toast.error("Erro ao conectar banco");
    } else {
      setNewAccount({ bank: "", type: "", balance: "" });
      setConnectDialogOpen(false);
      toast.success(`${newAccount.bank} conectado com sucesso!`);
    }
  };

  const formatBalance = (balance: number) => {
    if (!showBalances) return "••••••";
    return `R$ ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
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
            <h1 className="text-3xl font-bold text-foreground">
              Contas Bancárias
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas contas conectadas via Open Finance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowBalances(!showBalances)}>
              {showBalances ? (
                <EyeOff className="mr-2 h-4 w-4" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              {showBalances ? "Ocultar" : "Mostrar"}
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setConnectDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Conta manual
            </Button>
          </div>
        </div>

        <BankConnections onSynced={() => refetch()} />

        {/* Open Finance Info */}
        <Alert className="bg-primary/5 border-primary/20">
          <Shield className="h-5 w-5 text-primary" />
          <AlertTitle className="text-primary font-semibold">Conexão Segura via Open Finance Brasil</AlertTitle>
          <AlertDescription className="text-muted-foreground mt-2 space-y-2">
            <p>
              O Open Finance é um sistema regulamentado pelo Banco Central do Brasil que permite o compartilhamento seguro 
              de dados financeiros entre instituições autorizadas.
            </p>
            <div className="grid gap-3 md:grid-cols-3 mt-4">
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-success mt-1" />
                <div>
                  <p className="font-medium text-foreground text-sm">Criptografia de Ponta</p>
                  <p className="text-xs">Seus dados são protegidos com criptografia bancária de última geração.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-1" />
                <div>
                  <p className="font-medium text-foreground text-sm">Você no Controle</p>
                  <p className="text-xs">Autorize apenas os dados que deseja compartilhar e revogue a qualquer momento.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-success mt-1" />
                <div>
                  <p className="font-medium text-foreground text-sm">Regulado pelo BCB</p>
                  <p className="text-xs">Sistema supervisionado pelo Banco Central com rígidos padrões de segurança.</p>
                </div>
              </div>
            </div>
            <p className="text-xs mt-3 pt-3 border-t border-border">
              <strong>Como funciona:</strong> Ao conectar uma conta, você será redirecionado para o aplicativo do seu banco 
              para autorizar o compartilhamento de dados. Nunca solicitamos sua senha bancária. A conexão pode ser revogada 
              a qualquer momento diretamente no aplicativo do seu banco ou aqui na plataforma.
            </p>
          </AlertDescription>
        </Alert>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Patrimônio Total
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {formatBalance(totalBalance)}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                  <Wallet className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Fatura Cartões
                  </p>
                  <p className="text-3xl font-bold text-destructive">
                    {formatBalance(totalCredit)}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                  <CreditCard className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Contas Conectadas
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {accounts.length}
                  </p>
                  <p className="text-sm text-success">
                    {accounts.length} ativas
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accounts Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const config = accountTypeConfig[account.account_type as keyof typeof accountTypeConfig] || accountTypeConfig.checking;
            const Icon = config.icon;

            return (
              <Card
                key={account.id}
                className="glass overflow-hidden transition-all hover:shadow-lg"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{account.icon || "🏦"}</span>
                      <div>
                        <CardTitle className="text-base">
                          {account.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {config.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className="text-success border-success/30 bg-success/10"
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Conectado
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo</p>
                    <p
                      className={cn(
                        "text-2xl font-bold",
                        (account.balance || 0) < 0 ? "text-destructive" : "text-foreground"
                      )}
                    >
                      {formatBalance(account.balance || 0)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Última sync: agora
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleSync(account.id)}
                      >
                        <RefreshCw
                          className={cn(
                            "h-4 w-4",
                            syncing === account.id && "animate-spin"
                          )}
                        />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onClick={() => handleEditAccount(account)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate("/transactions")}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver Transações
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteAccount(account.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Desconectar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Add Account Card */}
          <Card 
            className="flex min-h-[280px] cursor-pointer items-center justify-center border-2 border-dashed border-border bg-transparent transition-all hover:border-primary hover:bg-muted/30"
            onClick={() => setConnectDialogOpen(true)}
          >
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">Conectar nova conta</p>
              <p className="text-sm text-muted-foreground">
                Via Open Finance Brasil
              </p>
            </div>
          </Card>
        </div>

        {/* Connect Bank Dialog */}
        <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Conectar Banco</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Selecione o banco</Label>
                <Select value={newAccount.bank} onValueChange={(v) => setNewAccount({ ...newAccount, bank: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um banco" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {availableBanks.map((bank) => (
                      <SelectItem key={bank.name} value={bank.name}>
                        <span className="flex items-center gap-2">
                          <span>{bank.logo}</span>
                          {bank.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de conta</Label>
                <Select value={newAccount.type} onValueChange={(v) => setNewAccount({ ...newAccount, type: v as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="checking">Conta Corrente</SelectItem>
                    <SelectItem value="savings">Poupança</SelectItem>
                    <SelectItem value="credit">Cartão de Crédito</SelectItem>
                    <SelectItem value="investment">Investimentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Saldo inicial (opcional)</Label>
                <Input 
                  type="number" 
                  placeholder="R$ 0,00"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleConnectBank}>
                <Shield className="mr-2 h-4 w-4" />
                Conectar com Open Finance
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Account Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Conta</DialogTitle>
            </DialogHeader>
            {selectedAccount && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome da conta</Label>
                  <Input 
                    value={selectedAccount.name}
                    onChange={(e) => setSelectedAccount({ ...selectedAccount, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Saldo</Label>
                  <Input 
                    type="number"
                    value={selectedAccount.balance}
                    onChange={(e) => setSelectedAccount({ ...selectedAccount, balance: parseFloat(e.target.value) })}
                  />
                </div>
                <Button className="w-full" onClick={handleSaveEdit}>
                  Salvar Alterações
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
