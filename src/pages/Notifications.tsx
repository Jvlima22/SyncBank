import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Target,
  Shield,
  Info,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const mockNotifications = [
  {
    id: 1,
    type: "transaction",
    title: "Nova transação detectada",
    message: "PIX recebido de R$ 2.500,00 de Maria Santos",
    time: "5 min atrás",
    read: false,
    icon: DollarSign,
    color: "text-success",
  },
  {
    id: 2,
    type: "alert",
    title: "Meta quase atingida!",
    message: "Você está a R$ 500 de atingir sua meta 'Viagem para Europa'",
    time: "1 hora atrás",
    read: false,
    icon: Target,
    color: "text-primary",
  },
  {
    id: 3,
    type: "card",
    title: "Fatura disponível",
    message: "A fatura do seu cartão Nubank está disponível. Vencimento: 10/01",
    time: "2 horas atrás",
    read: false,
    icon: CreditCard,
    color: "text-purple-500",
  },
  {
    id: 4,
    type: "security",
    title: "Acesso de novo dispositivo",
    message: "Um novo dispositivo acessou sua conta. Se não foi você, altere sua senha.",
    time: "5 horas atrás",
    read: true,
    icon: Shield,
    color: "text-warning",
  },
  {
    id: 5,
    type: "alert",
    title: "Despesa acima do normal",
    message: "Seus gastos com Alimentação estão 30% acima da média este mês",
    time: "1 dia atrás",
    read: true,
    icon: AlertTriangle,
    color: "text-destructive",
  },
  {
    id: 6,
    type: "transaction",
    title: "Pagamento confirmado",
    message: "Pagamento de R$ 150,00 para Netflix confirmado",
    time: "1 dia atrás",
    read: true,
    icon: Check,
    color: "text-success",
  },
  {
    id: 7,
    type: "info",
    title: "Relatório mensal disponível",
    message: "Seu relatório financeiro de novembro está pronto para visualização",
    time: "2 dias atrás",
    read: true,
    icon: TrendingUp,
    color: "text-blue-500",
  },
  {
    id: 8,
    type: "info",
    title: "Bem-vindo ao SyncBank!",
    message: "Sua conta foi criada com sucesso. Conecte seus bancos para começar.",
    time: "3 dias atrás",
    read: true,
    icon: Info,
    color: "text-muted-foreground",
  },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.read;
    return n.type === activeTab;
  });

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast.success("Notificação marcada como lida");
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("Todas notificações marcadas como lidas");
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notificação removida");
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success("Todas notificações removidas");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              Notificações
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} novas
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">Fique por dentro de todas as atualizações</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive"
              onClick={clearAll}
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border animate-slide-up">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "50ms" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Não lidas</p>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "100ms" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transações</p>
                  <p className="text-2xl font-bold">
                    {notifications.filter((n) => n.type === "transaction").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "150ms" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <Shield className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Segurança</p>
                  <p className="text-2xl font-bold">
                    {notifications.filter((n) => n.type === "security").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="pb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-secondary">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="unread">Não lidas</TabsTrigger>
                <TabsTrigger value="transaction">Transações</TabsTrigger>
                <TabsTrigger value="alert">Alertas</TabsTrigger>
                <TabsTrigger value="security">Segurança</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BellOff className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Nenhuma notificação</p>
                <p className="text-sm text-muted-foreground/70">
                  Você está em dia com todas as atualizações
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {filteredNotifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-xl transition-all duration-200 animate-slide-up",
                        notification.read
                          ? "bg-secondary/30"
                          : "bg-secondary/70 border border-primary/20"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          notification.read ? "bg-muted" : "bg-primary/10"
                        )}
                      >
                        <notification.icon className={cn("h-5 w-5", notification.color)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn("font-medium", !notification.read && "text-foreground")}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground/70 mt-2">{notification.time}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
