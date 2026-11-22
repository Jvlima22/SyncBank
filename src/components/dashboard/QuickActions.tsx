import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Send, QrCode, Receipt, ArrowRightLeft, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const actions = [
  { icon: Plus, label: "Receita", color: "bg-success/10 text-success hover:bg-success/20", action: "income" },
  { icon: Send, label: "Pagar", color: "bg-primary/10 text-primary hover:bg-primary/20", action: "pay" },
  { icon: QrCode, label: "PIX", color: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20", action: "pix" },
  { icon: Receipt, label: "Boleto", color: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20", action: "boleto" },
  { icon: ArrowRightLeft, label: "Transferir", color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20", action: "transfer" },
  { icon: Wallet, label: "Investir", color: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20", action: "invest" },
];

export function QuickActions() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("");

  const handleAction = (action: string) => {
    if (action === "income") {
      navigate("/income");
      return;
    }
    setDialogType(action);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const actionLabels: Record<string, string> = {
      pay: "Pagamento",
      pix: "PIX",
      boleto: "Boleto",
      transfer: "Transferência",
      invest: "Investimento",
    };
    toast.success(`${actionLabels[dialogType]} realizado com sucesso!`);
    setDialogOpen(false);
  };

  const getDialogTitle = () => {
    const titles: Record<string, string> = {
      pay: "Realizar Pagamento",
      pix: "Enviar PIX",
      boleto: "Pagar Boleto",
      transfer: "Nova Transferência",
      invest: "Novo Investimento",
    };
    return titles[dialogType] || "Ação";
  };

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {actions.map((action, index) => (
            <button
              key={action.label}
              onClick={() => handleAction(action.action)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 animate-scale-in",
                action.color
              )}
              style={{ animationDelay: `${150 + index * 50}ms` }}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {dialogType === "pix" && (
              <>
                <div className="space-y-2">
                  <Label>Chave PIX</Label>
                  <Input placeholder="CPF, Email, Telefone ou Chave Aleatória" />
                </div>
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input type="number" placeholder="R$ 0,00" />
                </div>
                <div className="space-y-2">
                  <Label>Descrição (opcional)</Label>
                  <Input placeholder="Ex: Pagamento de aluguel" />
                </div>
              </>
            )}

            {dialogType === "boleto" && (
              <>
                <div className="space-y-2">
                  <Label>Código de Barras</Label>
                  <Input placeholder="Digite ou cole o código" />
                </div>
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input type="number" placeholder="R$ 0,00" disabled />
                </div>
              </>
            )}

            {dialogType === "transfer" && (
              <>
                <div className="space-y-2">
                  <Label>Conta de origem</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nubank">Nubank - R$ 12.450,00</SelectItem>
                      <SelectItem value="inter">Inter - R$ 8.200,00</SelectItem>
                      <SelectItem value="c6">C6 Bank - R$ 5.100,00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Conta de destino</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nubank">Nubank - R$ 12.450,00</SelectItem>
                      <SelectItem value="inter">Inter - R$ 8.200,00</SelectItem>
                      <SelectItem value="c6">C6 Bank - R$ 5.100,00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input type="number" placeholder="R$ 0,00" />
                </div>
              </>
            )}

            {dialogType === "pay" && (
              <>
                <div className="space-y-2">
                  <Label>Tipo de pagamento</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Cartão de crédito</SelectItem>
                      <SelectItem value="debit">Débito automático</SelectItem>
                      <SelectItem value="balance">Saldo em conta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Destinatário</Label>
                  <Input placeholder="Nome ou empresa" />
                </div>
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input type="number" placeholder="R$ 0,00" />
                </div>
              </>
            )}

            {dialogType === "invest" && (
              <>
                <div className="space-y-2">
                  <Label>Tipo de investimento</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cdb">CDB</SelectItem>
                      <SelectItem value="lci">LCI/LCA</SelectItem>
                      <SelectItem value="tesouro">Tesouro Direto</SelectItem>
                      <SelectItem value="acoes">Ações</SelectItem>
                      <SelectItem value="fundos">Fundos de Investimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input type="number" placeholder="R$ 0,00" />
                </div>
              </>
            )}

            <Button onClick={handleSubmit} className="w-full">
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
