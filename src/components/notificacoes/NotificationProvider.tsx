import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useDatabase } from '@/hooks/useDatabase';
import { NotificacaoAgendamento } from './NotificacaoAgendamento';

interface NotificationContextType {
  checkForNewAgendamentos: (agendamentos: any[]) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext deve ser usado dentro de NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const { checkForNewAgendamentos } = useNotifications();
  const { agendamentos } = useDatabase();

  // Monitorar mudanças nos agendamentos
  useEffect(() => {
    if (agendamentos.length > 0) {
      checkForNewAgendamentos(agendamentos);
    }
  }, [agendamentos, checkForNewAgendamentos]);

  // Simular verificação periódica de novos agendamentos
  useEffect(() => {
    const interval = setInterval(() => {
      // Em produção, isso seria substituído por real-time subscriptions do Supabase
      if (agendamentos.length > 0) {
        checkForNewAgendamentos(agendamentos);
      }
    }, 30000); // Verificar a cada 30 segundos

    return () => clearInterval(interval);
  }, [agendamentos, checkForNewAgendamentos]);

  const contextValue: NotificationContextType = {
    checkForNewAgendamentos,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificacaoAgendamento />
    </NotificationContext.Provider>
  );
};