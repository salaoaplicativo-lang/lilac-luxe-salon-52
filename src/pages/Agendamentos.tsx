import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus, Search, DollarSign } from "lucide-react";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import AgendamentosList from "@/components/agendamentos/AgendamentosList";
import AgendamentoForm from "@/components/agendamentos/AgendamentoForm";
import AgendamentoDetalhes from "@/components/agendamentos/AgendamentoDetalhes";
import { Agendamento } from "@/types/agendamento";

type VisualizacaoAtual = 'lista' | 'formulario' | 'detalhes';

export default function Agendamentos() {
  const {
    agendamentos,
    agendamentosFiltrados,
    filtros,
    setFiltros,
    paginaAtual,
    setPaginaAtual,
    totalPaginas,
    clientes,
    servicos,
    criarAgendamento,
    atualizarAgendamento,
    excluirAgendamento,
    cancelarAgendamento,
    verificarConflito,
  } = useAgendamentos();

  const [visualizacaoAtual, setVisualizacaoAtual] = useState<VisualizacaoAtual>('lista');
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null);

  // Estatísticas rápidas baseadas nos dados reais
  const hoje = new Date().toISOString().split('T')[0];
  const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(fimSemana.getDate() + 6);

  const agendamentosHoje = agendamentosFiltrados.filter(ag => 
    ag.data === hoje && ag.status !== 'cancelado'
  ).length;

  const agendamentosAmanha = agendamentosFiltrados.filter(ag => 
    ag.data === amanha && ag.status !== 'cancelado'
  ).length;

  const agendamentosEstaSemana = agendamentosFiltrados.filter(ag => {
    const dataAgendamento = new Date(ag.data);
    return dataAgendamento >= inicioSemana && 
           dataAgendamento <= fimSemana && 
           ag.status !== 'cancelado';
  }).length;

  const handleNovoAgendamento = () => {
    setAgendamentoSelecionado(null);
    setVisualizacaoAtual('formulario');
  };

  const handleEditarAgendamento = (agendamento: Agendamento) => {
    setAgendamentoSelecionado(agendamento);
    setVisualizacaoAtual('formulario');
  };

  const handleVerDetalhes = (agendamento: Agendamento) => {
    setAgendamentoSelecionado(agendamento);
    setVisualizacaoAtual('detalhes');
  };

  const handleSubmitFormulario = (data: any) => {
    const sucesso = agendamentoSelecionado
      ? atualizarAgendamento(agendamentoSelecionado.id, data)
      : criarAgendamento(data);

    if (sucesso) {
      setVisualizacaoAtual('lista');
      setAgendamentoSelecionado(null);
    }
  };

  const handleVoltarParaLista = () => {
    setVisualizacaoAtual('lista');
    setAgendamentoSelecionado(null);
  };

  const handleCancelarAgendamento = () => {
    if (agendamentoSelecionado) {
      cancelarAgendamento(agendamentoSelecionado.id);
      setVisualizacaoAtual('lista');
      setAgendamentoSelecionado(null);
    }
  };

  if (visualizacaoAtual === 'formulario') {
    return (
      <div className="space-y-8">
        <AgendamentoForm
          agendamento={agendamentoSelecionado || undefined}
          clientes={clientes.map(c => ({ id: c.id, nome: c.nomeCompleto, telefone: c.telefone, email: '' }))}
          servicos={servicos}
          onSubmit={handleSubmitFormulario}
          onCancel={handleVoltarParaLista}
          verificarConflito={verificarConflito}
        />
      </div>
    );
  }

  if (visualizacaoAtual === 'detalhes' && agendamentoSelecionado) {
    const cliente = clientes.find(c => c.id === agendamentoSelecionado.clienteId);
    const servico = servicos.find(s => s.id === agendamentoSelecionado.servicoId);

    return (
      <div className="space-y-8">
        <AgendamentoDetalhes
          agendamento={agendamentoSelecionado}
          cliente={cliente ? { nome: cliente.nomeCompleto, telefone: cliente.telefone, email: '' } : { nome: agendamentoSelecionado.clienteNome, telefone: '', email: '' }}
          servico={servico || { nome: agendamentoSelecionado.servicoNome }}
          onEdit={() => setVisualizacaoAtual('formulario')}
          onBack={handleVoltarParaLista}
          onCancel={handleCancelarAgendamento}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os agendamentos do seu salão
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setFiltros({ statusPagamento: 'em_aberto' })}
            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Contas a Receber
          </Button>
          <Button 
            variant="outline"
            onClick={() => setFiltros({ origem: 'cronograma' })}
            className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
          >
            💜 Cronogramas
          </Button>
          <Button 
            onClick={handleNovoAgendamento}
            className="bg-gradient-to-r from-primary to-lilac-primary shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-lilac-light">
              <Calendar className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{agendamentosHoje}</p>
              <p className="text-sm text-muted-foreground">Hoje</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-lilac-primary to-pink-accent">
              <Clock className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{agendamentosAmanha}</p>
              <p className="text-sm text-muted-foreground">Amanhã</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-accent to-lavender">
              <Calendar className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{agendamentosEstaSemana}</p>
              <p className="text-sm text-muted-foreground">Esta Semana</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Agendamentos */}
      <AgendamentosList
        agendamentos={agendamentos}
        filtros={filtros}
        onFiltrosChange={setFiltros}
        onEdit={handleEditarAgendamento}
        onDelete={excluirAgendamento}
        onCancel={cancelarAgendamento}
        onViewDetails={handleVerDetalhes}
        clientes={clientes.map(c => ({ id: c.id, nome: c.nomeCompleto }))}
        paginaAtual={paginaAtual}
        totalPaginas={totalPaginas}
        onPaginaChange={setPaginaAtual}
      />
    </div>
  );
}