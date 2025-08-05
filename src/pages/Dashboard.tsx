import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, DollarSign, Plus, Users, UserPlus, TrendingUp, Sparkles, PiggyBank, Settings } from "lucide-react";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { useLancamentos } from "@/hooks/useLancamentos";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { ConfiguracaoNotificacoes } from "@/components/configuracoes/ConfiguracaoNotificacoes";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function Dashboard() {
  const navigate = useNavigate();
  const { agendamentosFiltrados } = useAgendamentos();
  const { lancamentos } = useLancamentos();
  const { usuario } = useAuth();

  // Data atual
  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const dataHoje = hoje.toISOString().split('T')[0];

  // Agendamentos hoje
  const agendamentosHoje = useMemo(() => {
    return agendamentosFiltrados.filter(ag => 
      ag.data === dataHoje && ag.status !== 'cancelado'
    );
  }, [agendamentosFiltrados, dataHoje]);

  // Total recebido hoje
  const totalRecebidoHoje = useMemo(() => {
    const agendamentosConcluidos = agendamentosFiltrados.filter(ag => 
      ag.data === dataHoje && ag.status === 'concluido'
    );
    return agendamentosConcluidos.reduce((total, ag) => total + ag.valor, 0);
  }, [agendamentosFiltrados, dataHoje]);

  // Próximo atendimento
  const proximoAtendimento = useMemo(() => {
    const agora = new Date();
    const horaAtual = agora.toTimeString().slice(0, 5);
    
    const proximosAgendamentos = agendamentosHoje
      .filter(ag => ag.hora > horaAtual && ag.status === 'agendado')
      .sort((a, b) => a.hora.localeCompare(b.hora));
    
    return proximosAgendamentos[0] || null;
  }, [agendamentosHoje]);

  // Dados para gráfico semanal
  const dadosSemanais = useMemo(() => {
    const ultimosSete = [];
    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      const dataStr = data.toISOString().split('T')[0];
      
      // Soma das entradas do dia
      const totalDia = lancamentos
        .filter(l => l.data.toISOString().split('T')[0] === dataStr && l.tipo === 'entrada')
        .reduce((total, l) => total + l.valor, 0);
      
      ultimosSete.push({
        dia: data.toLocaleDateString('pt-BR', { weekday: 'short' }),
        valor: totalDia
      });
    }
    return ultimosSete;
  }, [lancamentos]);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="space-responsive-lg">
      <InstallPrompt variant="card" />
      
      {/* Configurações de Notificação */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed bottom-4 left-4 z-40 gap-2"
          >
            <Settings className="h-4 w-4" />
            Notificações
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <ConfiguracaoNotificacoes />
        </DialogContent>
      </Dialog>
      {/* Cabeçalho de boas-vindas */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary to-lilac-light p-responsive text-primary-foreground">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-responsive-2xl sm:text-responsive-3xl font-bold">
                Olá, {usuario?.nome_completo?.split(' ')[0] || 'Profissional'}!
              </h1>
              <p className="text-responsive-sm sm:text-responsive-lg opacity-90 capitalize">
                {dataFormatada}
              </p>
            </div>
          </div>
          <p className="text-responsive-sm opacity-80">
            Tenha um dia produtivo e cheio de sucesso!
          </p>
        </div>
        <div className="absolute -right-4 sm:-right-8 -top-4 sm:-top-8 h-16 w-16 sm:h-32 sm:w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 sm:-bottom-12 -left-6 sm:-left-12 h-20 w-20 sm:h-40 sm:w-40 rounded-full bg-white/5" />
      </div>

      {/* Cards de Resumo */}
      <div className="grid-responsive-3">
        <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-responsive-sm">
            <CardTitle className="text-responsive-xs font-medium text-muted-foreground">
              Agendamentos Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-responsive-sm pt-0">
            <div className="text-responsive-xl font-bold text-foreground">{agendamentosHoje.length}</div>
            <p className="text-responsive-xs text-muted-foreground">
              {agendamentosHoje.length === 0 ? 'Nenhum agendamento hoje' : 'clientes agendados'}
            </p>
          </CardContent>
          <div className="absolute -right-2 -top-2 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-primary/10 to-transparent" />
        </Card>

        <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-responsive-sm">
            <CardTitle className="text-responsive-xs font-medium text-muted-foreground">
              Total Recebido Hoje
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-responsive-sm pt-0">
            <div className="text-responsive-xl font-bold text-green-600">{formatarMoeda(totalRecebidoHoje)}</div>
            <p className="text-responsive-xs text-muted-foreground">
              Serviços concluídos
            </p>
          </CardContent>
          <div className="absolute -right-2 -top-2 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-green-500/10 to-transparent" />
        </Card>

        <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm sm:col-span-1 col-span-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-responsive-sm">
            <CardTitle className="text-responsive-xs font-medium text-muted-foreground">
              Próximo Atendimento
            </CardTitle>
            <Clock className="h-4 w-4 text-lilac-primary flex-shrink-0" />
          </CardHeader>
          <CardContent className="p-responsive-sm pt-0">
            {proximoAtendimento ? (
              <div>
                <div className="text-responsive-lg font-bold text-foreground truncate">
                  {proximoAtendimento.clienteNome}
                </div>
                <p className="text-responsive-xs text-muted-foreground">
                  {proximoAtendimento.hora} - {proximoAtendimento.servicoNome}
                </p>
              </div>
            ) : (
              <div>
                <div className="text-responsive-lg font-bold text-foreground">Sem atendimentos</div>
                <p className="text-responsive-xs text-muted-foreground">Restantes hoje</p>
              </div>
            )}
          </CardContent>
          <div className="absolute -right-2 -top-2 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-lilac-primary/10 to-transparent" />
        </Card>
      </div>

      {/* Atalhos Rápidos */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="p-responsive">
          <CardTitle className="flex items-center gap-2 text-responsive-lg">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            Ações Rápidas
          </CardTitle>
          <CardDescription className="text-responsive-sm">
            Acesse rapidamente as funcionalidades mais usadas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-responsive pt-0">
          <div className="grid-responsive-3">
            <Button 
              onClick={() => navigate('/agendamentos')}
              className="btn-touch h-16 sm:h-20 flex-col gap-2 bg-gradient-to-br from-primary to-lilac-primary text-white text-responsive-xs sm:text-responsive-sm"
              size="lg"
            >
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>Novo Agendamento</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/clientes')}
              className="btn-touch h-16 sm:h-20 flex-col gap-2 bg-gradient-to-br from-lilac-primary to-pink-accent text-white text-responsive-xs sm:text-responsive-sm"
              size="lg"
            >
              <UserPlus className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>Novo Cliente</span>
            </Button>
            
            <Button 
              onClick={() => navigate('/financeiro')}
              className="btn-touch h-16 sm:h-20 flex-col gap-2 bg-gradient-to-br from-pink-accent to-lavender text-white text-responsive-xs sm:text-responsive-sm"
              size="lg"
            >
              <PiggyBank className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>Nova Entrada/Saída</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico Semanal */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="p-responsive">
          <CardTitle className="flex items-center gap-2 text-responsive-lg">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            Faturamento dos Últimos 7 Dias
          </CardTitle>
          <CardDescription className="text-responsive-sm">
            Acompanhe seu desempenho semanal
          </CardDescription>
        </CardHeader>
        <CardContent className="p-responsive pt-0">
          <div className="h-48 sm:h-64 overflow-responsive">
            <ResponsiveContainer width="100%" height="100%" minWidth={300}>
              <BarChart data={dadosSemanais}>
                <XAxis 
                  dataKey="dia" 
                  axisLine={false}
                  tickLine={false}
                  className="text-muted-foreground text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-muted-foreground text-xs"
                  tickFormatter={(value) => `R$ ${value}`}
                  tick={{ fontSize: 12 }}
                  width={60}
                />
                <Tooltip 
                  formatter={(value) => [formatarMoeda(value as number), 'Faturamento']}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="valor" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Motivação */}
      {agendamentosHoje.length > 0 && (
        <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-lilac-light/5">
          <CardContent className="p-responsive">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-lilac-primary flex-shrink-0">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-responsive-sm">
                  Você já atendeu {agendamentosFiltrados.filter(ag => ag.data === dataHoje && ag.status === 'concluido').length} de {agendamentosHoje.length} clientes hoje!
                </p>
                <p className="text-responsive-xs text-muted-foreground">
                  Continue assim, você está indo muito bem! 💪
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}