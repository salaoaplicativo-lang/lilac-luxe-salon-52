import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Cliente } from '@/types/cliente';
import { Servico } from '@/types/servico';
import { Agendamento } from '@/types/agendamento';
import { Cronograma, Retorno } from '@/types/cronograma';
import { Lancamento } from '@/types/lancamento';
import { toast } from '@/hooks/use-toast';

export const useDatabase = () => {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(false);

  // Estados para cache dos dados
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [cronogramas, setCronogramas] = useState<Cronograma[]>([]);
  const [retornos, setRetornos] = useState<Retorno[]>([]);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [contasFixas, setContasFixas] = useState<any[]>([]);
  const [categoriasFinanceiras, setCategoriasFinanceiras] = useState<any[]>([]);

  // Cache local para otimização
  const [clientesCache, setClientesCache] = useState<Cliente[]>([]);
  const [servicosCache, setServicosCache] = useState<Servico[]>([]);
  const [lastCacheUpdate, setLastCacheUpdate] = useState<number>(0);
  
  const userId = usuario?.id;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  // Carregar todos os dados do Supabase com otimizações
  const loadAllData = useCallback(async () => {
    if (!userId) return;

    const now = Date.now();
    setLoading(true);
    
    try {
      // Carregar clientes com cache e ordenação otimizada
      let clientesFormatados: Cliente[] = [];
      if (clientesCache.length > 0 && now - lastCacheUpdate < CACHE_DURATION) {
        clientesFormatados = clientesCache;
      } else {
        const { data: clientesData } = await supabase
          .from('clientes' as any)
          .select('*')
          .eq('user_id', userId)
          .order('primeiro_nome', { ascending: true });
          
        if (clientesData) {
          clientesFormatados = clientesData.map((c: any) => ({
            id: c.id,
            nomeCompleto: `${c.primeiro_nome} ${c.segundo_nome}`.trim(),
            email: c.email || '',
            telefone: c.telefone || '',
            servicoFrequente: '',
            ultimaVisita: new Date(),
            observacoes: '',
            historicoServicos: []
          }));
          setClientesCache(clientesFormatados);
          setLastCacheUpdate(now);
        }
      }
      setClientes(clientesFormatados);

      // Carregar serviços com cache e ordenação otimizada
      let servicosFormatados: Servico[] = [];
      if (servicosCache.length > 0 && now - lastCacheUpdate < CACHE_DURATION) {
        servicosFormatados = servicosCache;
      } else {
        const { data: servicosData } = await supabase
          .from('servicos' as any)
          .select('*')
          .eq('user_id', userId)
          .order('nome', { ascending: true });
          
        if (servicosData) {
          servicosFormatados = servicosData.map((s: any) => ({
            id: s.id,
            nome: s.nome,
            valor: s.preco,
            duracao: s.duracao_em_minutos,
            descricao: '',
            observacoes: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          setServicosCache(servicosFormatados);
          setLastCacheUpdate(now);
        }
      }
      setServicos(servicosFormatados);

      // Carregar agendamentos com joins otimizados
      const { data: agendamentosData } = await supabase
        .from('agendamentos' as any)
        .select(`
          *,
          clientes!inner(primeiro_nome, segundo_nome),
          servicos!inner(nome, duracao_em_minutos)
        `)
        .eq('user_id', userId)
        .order('data, hora', { ascending: true });
        
      if (agendamentosData) {
        const agendamentosFormatados = agendamentosData.map((a: any) => ({
          id: a.id,
          clienteId: a.cliente_id,
          clienteNome: `${a.clientes.primeiro_nome} ${a.clientes.segundo_nome}`.trim(),
          servicoId: a.servico_id,
          servicoNome: a.servicos.nome,
          data: a.data,
          hora: a.hora,
          duracao: a.servicos.duracao_em_minutos,
          valor: a.valor_pago + a.valor_fiado,
          valorPago: a.valor_pago,
          valorDevido: a.valor_fiado,
          formaPagamento: 'dinheiro' as const,
          statusPagamento: a.foi_pago ? 'pago' as const : 'em_aberto' as const,
          status: a.status as 'agendado' | 'concluido' | 'cancelado',
          observacoes: a.observacoes || '',
          origem: 'manual' as const,
          origem_cronograma: false,
          confirmado: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        setAgendamentos(agendamentosFormatados);
      }

      // Carregar cronogramas com ordenação otimizada
      const { data: cronogramasData } = await supabase
        .from('cronogramas' as any)
        .select('*')
        .eq('user_id', userId)
        .order('dia, hora_inicio', { ascending: true });
      if (cronogramasData) {
        setCronogramas([]); // TODO: Implementar mapeamento de cronogramas
      }

      // Carregar financeiro com ordenação otimizada
      const { data: financeiroData } = await supabase
        .from('financeiro' as any)
        .select('*')
        .eq('user_id', userId)
        .order('data', { ascending: false })
        .limit(100); // Limitar para melhor performance
      if (financeiroData) {
        setLancamentos([]); // TODO: Implementar mapeamento de lançamentos
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do servidor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, clientesCache, servicosCache, lastCacheUpdate]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // CLIENTES
  const createCliente = useCallback(async (clienteData: Omit<Cliente, 'id'>) => {
    if (!userId) return null;
    
    setLoading(true);
    try {
      const [primeiroNome, ...restoNome] = clienteData.nomeCompleto.split(' ');
      const segundoNome = restoNome.join(' ');

      const { data, error } = await supabase
        .from('clientes' as any)
        .insert({
          user_id: userId,
          primeiro_nome: primeiroNome,
          segundo_nome: segundoNome,
          telefone: clienteData.telefone,
          email: clienteData.email,
          redes_sociais: {}
        })
        .select()
        .single();

      if (error) throw error;

      const novoCliente: Cliente = {
        id: (data as any).id,
        nomeCompleto: clienteData.nomeCompleto,
        email: clienteData.email,
        telefone: clienteData.telefone,
        servicoFrequente: clienteData.servicoFrequente,
        ultimaVisita: clienteData.ultimaVisita,
        observacoes: clienteData.observacoes,
        historicoServicos: []
      };

      setClientes(prev => [...prev, novoCliente]);
      toast({
        title: "Cliente criado",
        description: "Cliente cadastrado com sucesso.",
      });
      return novoCliente;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar cliente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateCliente = useCallback(async (id: string, updates: Partial<Cliente>) => {
    if (!userId) return null;
    
    setLoading(true);
    try {
      const updateData: any = {};
      
      if (updates.nomeCompleto) {
        const [primeiroNome, ...restoNome] = updates.nomeCompleto.split(' ');
        updateData.primeiro_nome = primeiroNome;
        updateData.segundo_nome = restoNome.join(' ');
      }
      if (updates.telefone) updateData.telefone = updates.telefone;
      if (updates.email) updateData.email = updates.email;

      const { error } = await supabase
        .from('clientes' as any)
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      const clienteAtualizado = { ...clientes.find(c => c.id === id)!, ...updates };
      setClientes(prev => prev.map(c => c.id === id ? clienteAtualizado : c));
      
      toast({
        title: "Cliente atualizado",
        description: "Dados do cliente atualizados com sucesso.",
      });
      return clienteAtualizado;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar cliente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, clientes]);

  const deleteCliente = useCallback(async (id: string) => {
    if (!userId) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('clientes' as any)
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      setClientes(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Cliente removido",
        description: "Cliente removido com sucesso.",
      });
      return true;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover cliente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // SERVIÇOS
  const createServico = useCallback(async (servicoData: Omit<Servico, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('servicos' as any)
        .insert({
          user_id: userId,
          nome: servicoData.nome,
          duracao_em_minutos: servicoData.duracao,
          preco: servicoData.valor,
          categoria: 'Geral'
        })
        .select()
        .single();

      if (error) throw error;

      const novoServico: Servico = {
        id: (data as any).id,
        nome: servicoData.nome,
        valor: servicoData.valor,
        duracao: servicoData.duracao,
        descricao: servicoData.descricao,
        observacoes: servicoData.observacoes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setServicos(prev => [...prev, novoServico]);
      toast({
        title: "Serviço criado",
        description: "Serviço cadastrado com sucesso.",
      });
      return novoServico;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar serviço.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateServico = useCallback(async (id: string, updates: Partial<Servico>) => {
    if (!userId) return null;
    
    setLoading(true);
    try {
      const updateData: any = {};
      if (updates.nome) updateData.nome = updates.nome;
      if (updates.valor) updateData.preco = updates.valor;
      if (updates.duracao) updateData.duracao_em_minutos = updates.duracao;

      const { error } = await supabase
        .from('servicos' as any)
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      const servicoAtualizado = { 
        ...servicos.find(s => s.id === id)!, 
        ...updates,
        updatedAt: new Date().toISOString()
      };
      setServicos(prev => prev.map(s => s.id === id ? servicoAtualizado : s));
      
      toast({
        title: "Serviço atualizado",
        description: "Dados do serviço atualizados com sucesso.",
      });
      return servicoAtualizado;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar serviço.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, servicos]);

  // AGENDAMENTOS
  const createAgendamento = useCallback(async (agendamentoData: Omit<Agendamento, 'id' | 'createdAt' | 'updatedAt' | 'clienteNome' | 'servicoNome'>) => {
    if (!userId) return null;
    
    setLoading(true);
    try {
      // Verificar disponibilidade
      const { data: conflitos } = await supabase
        .from('agendamentos' as any)
        .select('*')
        .eq('user_id', userId)
        .eq('data', agendamentoData.data)
        .eq('hora', agendamentoData.hora)
        .eq('status', 'agendado');

      if (conflitos && conflitos.length > 0) {
        toast({
          title: "Horário indisponível",
          description: "Este horário já está ocupado.",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('agendamentos' as any)
        .insert({
          user_id: userId,
          cliente_id: agendamentoData.clienteId,
          servico_id: agendamentoData.servicoId,
          data: agendamentoData.data,
          hora: agendamentoData.hora,
          status: agendamentoData.status,
          foi_pago: agendamentoData.statusPagamento === 'pago',
          valor_pago: agendamentoData.valorPago,
          valor_fiado: agendamentoData.valorDevido,
          observacoes: agendamentoData.observacoes
        })
        .select(`
          *,
          clientes!inner(primeiro_nome, segundo_nome),
          servicos!inner(nome, duracao_em_minutos)
        `)
        .single();

      if (error) throw error;

      const novoAgendamento: Agendamento = {
        id: (data as any).id,
        clienteId: agendamentoData.clienteId,
        clienteNome: `${(data as any).clientes.primeiro_nome} ${(data as any).clientes.segundo_nome}`.trim(),
        servicoId: agendamentoData.servicoId,
        servicoNome: (data as any).servicos.nome,
        data: agendamentoData.data,
        hora: agendamentoData.hora,
        duracao: (data as any).servicos.duracao_em_minutos,
        valor: agendamentoData.valor,
        valorPago: agendamentoData.valorPago,
        valorDevido: agendamentoData.valorDevido,
        formaPagamento: agendamentoData.formaPagamento,
        statusPagamento: agendamentoData.statusPagamento,
        status: agendamentoData.status,
        observacoes: agendamentoData.observacoes,
        origem: agendamentoData.origem || 'manual',
        origem_cronograma: agendamentoData.origem_cronograma,
        cronogramaId: agendamentoData.cronogramaId,
        confirmado: agendamentoData.confirmado,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setAgendamentos(prev => [...prev, novoAgendamento]);
      
      toast({
        title: "Agendamento criado",
        description: "Agendamento cadastrado com sucesso.",
      });
      return novoAgendamento;
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar agendamento.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateAgendamento = useCallback(async (id: string, updates: Partial<Agendamento>) => {
    if (!userId) return null;
    
    setLoading(true);
    try {
      const updateData: any = {};
      if (updates.status) updateData.status = updates.status;
      if (updates.valorPago !== undefined) updateData.valor_pago = updates.valorPago;
      if (updates.valorDevido !== undefined) updateData.valor_fiado = updates.valorDevido;
      if (updates.statusPagamento) updateData.foi_pago = updates.statusPagamento === 'pago';
      if (updates.observacoes) updateData.observacoes = updates.observacoes;

      const { error } = await supabase
        .from('agendamentos' as any)
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      const agendamentoAtualizado = { 
        ...agendamentos.find(a => a.id === id)!, 
        ...updates,
        updatedAt: new Date().toISOString()
      };
      setAgendamentos(prev => prev.map(a => a.id === id ? agendamentoAtualizado : a));
      
      // Registrar lançamento financeiro se foi marcado como concluído
      if (updates.status === 'concluido') {
        await supabase
          .from('financeiro' as any)
          .insert({
            user_id: userId,
            tipo: 'entrada',
            valor: agendamentoAtualizado.valorPago,
            categoria: 'serviço',
            descricao: `${agendamentoAtualizado.servicoNome} - ${agendamentoAtualizado.clienteNome}`,
            agendamento_id: id
          });
      }

      toast({
        title: "Agendamento atualizado",
        description: "Agendamento atualizado com sucesso.",
      });
      return agendamentoAtualizado;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar agendamento.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, agendamentos]);

  // CRONOGRAMAS (placeholder)
  const createCronograma = useCallback(async (cronogramaData: Omit<Cronograma, 'id_cronograma' | 'created_at' | 'updated_at'>) => {
    return null; // TODO: Implementar
  }, [userId]);

  const updateCronograma = useCallback(async (id: string, updates: Partial<Cronograma>) => {
    return null; // TODO: Implementar
  }, [userId]);

  const deleteCronograma = useCallback(async (id: string) => {
    return false; // TODO: Implementar
  }, [userId]);

  // LANÇAMENTOS (placeholder)
  const createLancamento = useCallback(async (lancamentoData: Omit<Lancamento, 'id' | 'created_at' | 'updated_at'>) => {
    return null; // TODO: Implementar
  }, [userId]);

  // MÉTODOS AUXILIARES OTIMIZADOS
  const getClienteComEstatisticas = useCallback((clienteId: string) => {
    if (!userId) return null;

    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return null;

    // Usar filtro local otimizado por cliente_id
    const agendamentosCliente = agendamentos.filter(a => a.clienteId === clienteId);
    const totalAgendamentos = agendamentosCliente.length;
    const valorPago = agendamentosCliente.reduce((sum, a) => sum + a.valorPago, 0);
    const valorFiado = agendamentosCliente.reduce((sum, a) => sum + a.valorDevido, 0);
    const cronogramasAtivos = 0; // TODO: Implementar

    return {
      ...cliente,
      totalAgendamentos,
      valorPago,
      valorFiado,
      cronogramasAtivos,
    };
  }, [userId, clientes, agendamentos]);

  // Buscar agendamentos por cliente com query otimizada
  const getAgendamentosPorCliente = useCallback(async (clienteId: string) => {
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('agendamentos' as any)
      .select(`
        *,
        clientes!inner(primeiro_nome, segundo_nome),
        servicos!inner(nome, duracao_em_minutos)
      `)
      .eq('user_id', userId)
      .eq('cliente_id', clienteId)
      .order('data, hora', { ascending: false });

    if (error) {
      console.error('Error getting agendamentos por cliente:', error);
      return [];
    }

    return data || [];
  }, [userId]);

  // Buscar cronogramas por cliente com query otimizada
  const getCronogramasPorCliente = useCallback(async (clienteId: string) => {
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('cronogramas' as any)
      .select('*')
      .eq('user_id', userId)
      .eq('cliente_id', clienteId)
      .order('dia, hora_inicio', { ascending: true });

    if (error) {
      console.error('Error getting cronogramas por cliente:', error);
      return [];
    }

    return data || [];
  }, [userId]);

  const isHorarioDisponivel = useCallback(async (data: string, hora: string, duracao: number, excludeId?: string) => {
    if (!userId) return false;
    
    // Query otimizada com índices
    const { data: conflitos } = await supabase
      .from('agendamentos' as any)
      .select('id')
      .eq('user_id', userId)
      .eq('data', data)
      .eq('hora', hora)
      .eq('status', 'agendado')
      .neq('id', excludeId || '');

    return !conflitos || conflitos.length === 0;
  }, [userId]);

  return {
    loading,
    // Dados
    clientes,
    servicos,
    agendamentos,
    cronogramas,
    retornos,
    lancamentos,
    contasFixas,
    categoriasFinanceiras,
    // Métodos CRUD
    createCliente,
    updateCliente,
    deleteCliente,
    createServico,
    updateServico,
    createAgendamento,
    updateAgendamento,
    createCronograma,
    updateCronograma,
    deleteCronograma,
    createLancamento,
    createMultipleAgendamentos: async (agendamentos: any[]) => {
      return []; // TODO: Implementar
    },
    // Métodos auxiliares otimizados
    getClienteComEstatisticas,
    getAgendamentosPorCliente,
    getCronogramasPorCliente,
    isHorarioDisponivel,
    gerarProximosAgendamentosCronograma: async () => {}, // TODO: Implementar
    loadAllData,
  };
};