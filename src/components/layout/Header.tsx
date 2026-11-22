import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useTransactions } from "@/hooks/useTransactions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { transactions, createTransaction } = useTransactions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: "expense" as "income" | "expense",
    category: "",
    amount: "",
    description: "",
  });

  // Filtrar resultados de busca
  const searchResults = searchValue.length >= 2
    ? transactions.filter(
        (t) =>
          (t.description?.toLowerCase() || "").includes(searchValue.toLowerCase()) ||
          (t.category?.toLowerCase() || "").includes(searchValue.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchValue.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(searchValue)}`);
      setSearchOpen(false);
    }
  };

  const handleNewTransaction = () => {
    setDialogOpen(true);
  };

  const handleSubmitTransaction = async () => {
    if (!newTransaction.category || !newTransaction.amount || !newTransaction.description) {
      toast.error("Preencha todos os campos");
      return;
    }

    const { error } = await createTransaction({
      description: newTransaction.description,
      amount: newTransaction.type === "expense" 
        ? -parseFloat(newTransaction.amount) 
        : parseFloat(newTransaction.amount),
      date: new Date().toISOString().split("T")[0],
      category: newTransaction.category,
      type: newTransaction.type,
      account_id: null,
      subcategory: null,
      is_recurring: false,
      tags: null,
      notes: null,
      attachment_url: null,
      account: "Manual",
      method: "Manual",
      status: "completed",
    });

    if (error) {
      toast.error("Erro ao registrar transação");
    } else {
      toast.success("Transação registrada com sucesso!");
      setDialogOpen(false);
      setNewTransaction({
        type: "expense",
        category: "",
        amount: "",
        description: "",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    toast.success('Você foi desconectado');
  };

  const getInitials = (name: string | null) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-3 bg-background/70 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button onClick={onMenuClick} className="rounded-xl border border-border bg-card p-2 lg:hidden" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              className="h-10 w-full rounded-full border-border bg-card pl-10 shadow-none focus-visible:ring-1"
              value={searchValue}
              onChange={(e) => {
                const value = e.target.value;
                setSearchValue(value);
                setSearchOpen(value.length >= 2);
              }}
              onKeyDown={handleSearch}
              onFocus={() => searchValue.length >= 2 && setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
            />

            {searchOpen && (
              <div className="absolute mt-1 w-full rounded-xl border border-border bg-popover text-popover-foreground shadow-md z-50">
                <Command>
                  <CommandList>
                    {searchResults.length === 0 ? (
                      <CommandEmpty>
                        {searchValue.length < 2
                          ? "Digite pelo menos 2 caracteres"
                          : "Nenhum resultado encontrado"}
                      </CommandEmpty>
                    ) : (
                      <CommandGroup heading="Transações">
                        {searchResults.map((result) => (
                          <CommandItem
                            key={result.id}
                            onSelect={() => {
                              navigate(`/transactions?search=${encodeURIComponent(result.description)}`);
                              setSearchOpen(false);
                              setSearchValue("");
                            }}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <p className="font-medium">{result.description}</p>
                                <p className="text-xs text-muted-foreground">{result.category}</p>
                              </div>
                              <span className={result.type === "income" ? "text-success" : "text-foreground"}>
                                {result.type === "income" ? "+" : "-"}R$ {Math.abs(result.amount).toLocaleString("pt-BR")}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="glow" size="sm" className="h-10 gap-2 rounded-full px-4" onClick={handleNewTransaction}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo lançamento</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-full border border-border bg-card"
            onClick={() => navigate("/notifications")}
            aria-label="Notificações"
          >
            <Bell className="h-[18px] w-[18px]" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex cursor-pointer items-center gap-3">
                <div className="hidden text-right md:block">
                  <p className="text-sm font-semibold leading-tight">{displayName}</p>
                  <p className="text-xs text-muted-foreground">Conta pessoal</p>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getInitials(profile?.full_name || null)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/notifications")}>
                Notificações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/reports")}>
                Relatórios
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select 
                value={newTransaction.type}
                onValueChange={(v) => setNewTransaction({ ...newTransaction, type: v as "income" | "expense" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={newTransaction.category}
                onValueChange={(v) => setNewTransaction({ ...newTransaction, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alimentação">Alimentação</SelectItem>
                  <SelectItem value="Transporte">Transporte</SelectItem>
                  <SelectItem value="Moradia">Moradia</SelectItem>
                  <SelectItem value="Saúde">Saúde</SelectItem>
                  <SelectItem value="Entretenimento">Lazer</SelectItem>
                  <SelectItem value="Salário">Salário</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input 
                type="number" 
                placeholder="R$ 0,00"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea 
                placeholder="Descreva a transação..."
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              />
            </div>
            <Button onClick={handleSubmitTransaction} className="w-full">
              Registrar Transação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
