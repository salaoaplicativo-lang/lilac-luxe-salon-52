import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface NotificationSettings {
  soundEnabled: boolean;
  visualEnabled: boolean;
  autoHide: boolean;
  hideDelay: number;
}

interface AgendamentoNotification {
  id: string;
  clienteNome: string;
  servicoNome: string;
  data: string;
  horario: string;
  origem: 'manual' | 'cronograma' | 'online';
  criadoEm: string;
  shown: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  soundEnabled: true,
  visualEnabled: true,
  autoHide: true,
  hideDelay: 10000, // 10 segundos
};

export const useNotifications = () => {
  const { usuario } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('notification-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  
  const [notifications, setNotifications] = useState<AgendamentoNotification[]>([]);
  const [lastChecked, setLastChecked] = useState<string>(new Date().toISOString());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shownNotificationsRef = useRef<Set<string>>(new Set());

  // Inicializar áudio
  useEffect(() => {
    if (settings.soundEnabled) {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = 0.5;
      audioRef.current.preload = 'auto';
    }

    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, [settings.soundEnabled]);

  // Salvar configurações
  useEffect(() => {
    localStorage.setItem('notification-settings', JSON.stringify(settings));
  }, [settings]);

  // Função para tocar som de notificação
  const playNotificationSound = useCallback(async () => {
    if (!settings.soundEnabled || !audioRef.current) return;

    try {
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch (error) {
      // Falha silenciosa - alguns navegadores bloqueiam autoplay
      console.log('Não foi possível reproduzir som de notificação:', error);
    }
  }, [settings.soundEnabled]);

  // Função para adicionar nova notificação
  const addNotification = useCallback((agendamento: Omit<AgendamentoNotification, 'shown'>) => {
    if (!usuario || !settings.visualEnabled) return;

    // Verificar se já foi mostrada
    if (shownNotificationsRef.current.has(agendamento.id)) return;

    const newNotification = { ...agendamento, shown: false };
    setNotifications(prev => [newNotification, ...prev.slice(0, 2)]); // Máximo 3 notificações
    shownNotificationsRef.current.add(agendamento.id);

    // Tocar som
    playNotificationSound();

    // Mostrar toast também
    toast({
      title: "Novo Agendamento!",
      description: `${agendamento.clienteNome} - ${agendamento.servicoNome}`,
      duration: 5000,
    });

    // Auto-hide se habilitado
    if (settings.autoHide) {
      setTimeout(() => {
        removeNotification(agendamento.id);
      }, settings.hideDelay);
    }
  }, [usuario, settings, playNotificationSound]);

  // Função para remover notificação
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Função para limpar todas as notificações
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Função para atualizar configurações
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Função para verificar novos agendamentos (simula real-time)
  const checkForNewAgendamentos = useCallback((agendamentos: any[]) => {
    if (!usuario) return;

    const newAgendamentos = agendamentos.filter(agendamento => {
      // Filtrar apenas agendamentos do usuário logado
      if (agendamento.userId !== usuario.id) return false;
      
      // Verificar se foi criado após última verificação
      const criadoEm = new Date(agendamento.createdAt);
      const ultimaVerificacao = new Date(lastChecked);
      
      return criadoEm > ultimaVerificacao && !shownNotificationsRef.current.has(agendamento.id);
    });

    if (newAgendamentos.length > 0) {
      newAgendamentos.forEach(agendamento => {
        const origem = agendamento.origem || 'manual';
        const origemText = origem === 'online' ? 'Agendamento Online' : 
                          origem === 'cronograma' ? 'Agendamento Automático' : 
                          'Agendamento Manual';

        addNotification({
          id: agendamento.id,
          clienteNome: agendamento.clienteNome,
          servicoNome: agendamento.servicoNome,
          data: agendamento.data,
          horario: agendamento.hora,
          origem: origem,
          criadoEm: agendamento.createdAt,
        });
      });

      setLastChecked(new Date().toISOString());
    }
  }, [usuario, lastChecked, addNotification]);

  // Função para solicitar permissão de notificação
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  return {
    notifications,
    settings,
    addNotification,
    removeNotification,
    clearAllNotifications,
    updateSettings,
    checkForNewAgendamentos,
    requestNotificationPermission,
    playNotificationSound,
  };
};