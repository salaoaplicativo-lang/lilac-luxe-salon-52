import { useState, useEffect, useCallback } from 'react';
import { LocalStorageManager, STORAGE_EVENTS } from '@/lib/localStorage';
import { Servico } from '@/types/servico';
import { Cliente } from '@/types/cliente';
import { Agendamento } from '@/types/agendamento';
import { Cronograma } from '@/types/cronograma';
import { Lancamento } from '@/types/lancamento';

// Hook principal para gerenciar banco de dados local
export const useLocalDatabase = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [cronogramas, setCronogramas] = useState<Cronograma[]>([]);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);

  // Carregar dados iniciais
  useEffect(() => {
    setServicos(LocalStorageManager.get<Servico>('SERVICOS'));
    setClientes(LocalStorageManager.get<Cliente>('CLIENTES'));
    setAgendamentos(LocalStorageManager.get<Agendamento>('AGENDAMENTOS'));
    setCronogramas(LocalStorageManager.get<Cronograma>('CRONOGRAMAS'));
    setLancamentos(LocalStorageManager.get<Lancamento>('LANCAMENTOS'));

    // Configurar sincronização entre abas
    LocalStorageManager.setupCrossTabSync();
  }, []);

  // Listener para mudanças nos dados
  useEffect(() => {
    const handleDataUpdate = (event: CustomEvent) => {
      const { key } = event.detail;
      
      switch (key) {
        case 'servicos':
          setServicos(LocalStorageManager.get<Servico>('SERVICOS'));
          break;
        case 'clientes':
          setClientes(LocalStorageManager.get<Cliente>('CLIENTES'));
          break;
        case 'agendamentos':
          setAgendamentos(LocalStorageManager.get<Agendamento>('AGENDAMENTOS'));
          break;
        case 'cronogramas':
          setCronogramas(LocalStorageManager.get<Cronograma>('CRONOGRAMAS'));
          break;
        case 'lancamentos':
          setLancamentos(LocalStorageManager.get<Lancamento>('LANCAMENTOS'));
          break;
      }
    };

    window.addEventListener(STORAGE_EVENTS.DATA_UPDATED, handleDataUpdate as EventListener);
    
    return () => {
      window.removeEventListener(STORAGE_EVENTS.DATA_UPDATED, handleDataUpdate as EventListener);
    };
  }, []);

  // Métodos para gerenciar serviços
  const addServico = useCallback((servico: Servico) => {
    LocalStorageManager.add('SERVICOS', servico);
  }, []);

  const updateServico = useCallback((id: string, updates: Partial<Servico>) => {
    LocalStorageManager.update('SERVICOS', id, updates);
  }, []);

  const removeServico = useCallback((id: string) => {
    LocalStorageManager.remove<Servico>('SERVICOS', id);
  }, []);

  // Métodos para gerenciar clientes
  const addCliente = useCallback((cliente: Cliente) => {
    LocalStorageManager.add('CLIENTES', cliente);
  }, []);

  const updateCliente = useCallback((id: string, updates: Partial<Cliente>) => {
    LocalStorageManager.update('CLIENTES', id, updates);
  }, []);

  const removeCliente = useCallback((id: string) => {
    LocalStorageManager.remove<Cliente>('CLIENTES', id);
  }, []);

  // Métodos para gerenciar agendamentos
  const addAgendamento = useCallback((agendamento: Agendamento) => {
    LocalStorageManager.add('AGENDAMENTOS', agendamento);
  }, []);

  const updateAgendamento = useCallback((id: string, updates: Partial<Agendamento>) => {
    LocalStorageManager.update('AGENDAMENTOS', id, updates);
  }, []);

  const removeAgendamento = useCallback((id: string) => {
    LocalStorageManager.remove<Agendamento>('AGENDAMENTOS', id);
  }, []);

  // Métodos para gerenciar cronogramas
  const addCronograma = useCallback((cronograma: Cronograma) => {
    LocalStorageManager.add('CRONOGRAMAS', cronograma);
  }, []);

  const updateCronograma = useCallback((id: string, updates: Partial<Cronograma>) => {
    LocalStorageManager.update('CRONOGRAMAS', id, updates);
  }, []);

  const removeCronograma = useCallback((id: string) => {
    LocalStorageManager.remove('CRONOGRAMAS', id);
  }, []);

  // Métodos para gerenciar lançamentos
  const addLancamento = useCallback((lancamento: Lancamento) => {
    LocalStorageManager.add('LANCAMENTOS', lancamento);
  }, []);

  const updateLancamento = useCallback((id: string, updates: Partial<Lancamento>) => {
    LocalStorageManager.update('LANCAMENTOS', id, updates);
  }, []);

  const removeLancamento = useCallback((id: string) => {
    LocalStorageManager.remove<Lancamento>('LANCAMENTOS', id);
  }, []);

  // Método para buscar servico por ID
  const getServicoById = useCallback((id: string): Servico | undefined => {
    return servicos.find(s => s.id === id);
  }, [servicos]);

  // Método para buscar cliente por ID
  const getClienteById = useCallback((id: string): Cliente | undefined => {
    return clientes.find(c => c.id === id);
  }, [clientes]);

  return {
    // Estados
    servicos,
    clientes,
    agendamentos,
    cronogramas,
    lancamentos,
    
    // Métodos de serviços
    addServico,
    updateServico,
    removeServico,
    getServicoById,
    
    // Métodos de clientes
    addCliente,
    updateCliente,
    removeCliente,
    getClienteById,
    
    // Métodos de agendamentos
    addAgendamento,
    updateAgendamento,
    removeAgendamento,
    
    // Métodos de cronogramas
    addCronograma,
    updateCronograma,
    removeCronograma,
    
    // Métodos de lançamentos
    addLancamento,
    updateLancamento,
    removeLancamento,
  };
};