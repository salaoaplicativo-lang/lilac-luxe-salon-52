import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications } from '@/hooks/useNotifications';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { Volume2, VolumeX, Bell, BellOff, Timer, Play, Clock, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function ConfiguracaoNotificacoes() {
  const { settings, updateSettings, requestNotificationPermission, playNotificationSound } = useNotifications();
  const { configuracoes, updateConfiguracoes, loading } = useConfiguracoes();

  if (loading || !configuracoes) {
    return <div>Carregando configurações...</div>;
  }

  const sons = [
    { value: 'notification1', label: 'Som 1 - Suave' },
    { value: 'notification2', label: 'Som 2 - Alegre' },
    { value: 'notification3', label: 'Som 3 - Profissional' },
  ];

  const handleSoundToggle = (enabled: boolean) => {
    updateSettings({ soundEnabled: enabled });
    toast({
      title: enabled ? "Som ativado" : "Som desativado",
      description: enabled ? 
        "Você ouvirá um som quando novos agendamentos chegarem." : 
        "O som de notificação foi desativado.",
    });
  };

  const handleVisualToggle = (enabled: boolean) => {
    updateSettings({ visualEnabled: enabled });
    toast({
      title: enabled ? "Notificações visuais ativadas" : "Notificações visuais desativadas",
      description: enabled ? 
        "Você verá notificações visuais na tela." : 
        "As notificações visuais foram desativadas.",
    });
  };

  const handleAutoHideToggle = (enabled: boolean) => {
    updateSettings({ autoHide: enabled });
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    toast({
      title: granted ? "Permissão concedida" : "Permissão negada",
      description: granted ? 
        "As notificações do navegador foram ativadas." : 
        "Você pode ativar as notificações nas configurações do navegador.",
      variant: granted ? "default" : "destructive",
    });
  };

  const testSound = () => {
    playNotificationSound();
    toast({
      title: "Testando som",
      description: "Se você não ouviu nada, verifique o volume ou as configurações do navegador.",
    });
  };

  const handleSomChange = (som: 'notification1' | 'notification2' | 'notification3') => {
    updateConfiguracoes({
      notificacoes: {
        ...configuracoes.notificacoes,
        novosAgendamentos: {
          ...configuracoes.notificacoes.novosAgendamentos,
          som,
        },
      },
    });
  };

  const handleRetornoCronogramaToggle = (enabled: boolean) => {
    updateConfiguracoes({
      notificacoes: {
        ...configuracoes.notificacoes,
        retornoCronograma: enabled,
      },
    });
  };

  const handleLembretesToggle = (enabled: boolean) => {
    updateConfiguracoes({
      notificacoes: {
        ...configuracoes.notificacoes,
        lembretesAntecipados: enabled,
      },
    });
  };

  const handleTempoAntecedenciaChange = (tempo: string) => {
    updateConfiguracoes({
      notificacoes: {
        ...configuracoes.notificacoes,
        tempoAntecedencia: parseInt(tempo),
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações de Notificação
          </CardTitle>
          <CardDescription>
            Configure como você deseja receber notificações de novos agendamentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notificações Visuais */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {settings.visualEnabled ? (
                  <Bell className="h-4 w-4 text-primary" />
                ) : (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                )}
                <Label htmlFor="visual-notifications">Notificações Visuais</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Exibir notificações na tela quando novos agendamentos chegarem
              </p>
            </div>
            <Switch
              id="visual-notifications"
              checked={settings.visualEnabled}
              onCheckedChange={handleVisualToggle}
            />
          </div>

          {/* Som de Notificação */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {settings.soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-primary" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
                <Label htmlFor="sound-notifications">Som de Notificação</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Reproduzir som quando novos agendamentos chegarem
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="sound-notifications"
                checked={settings.soundEnabled}
                onCheckedChange={handleSoundToggle}
              />
              {settings.soundEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testSound}
                  className="h-8"
                >
                  <Play className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Escolha do Som */}
          {settings.soundEnabled && (
            <div className="space-y-2">
              <Label>Tipo de Som</Label>
              <Select
                value={configuracoes.notificacoes.novosAgendamentos.som}
                onValueChange={handleSomChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o som" />
                </SelectTrigger>
                <SelectContent>
                  {sons.map((som) => (
                    <SelectItem key={som.value} value={som.value}>
                      {som.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Auto Hide */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" />
                <Label htmlFor="auto-hide">Ocultar Automaticamente</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                As notificações desaparecerão automaticamente após 10 segundos
              </p>
            </div>
            <Switch
              id="auto-hide"
              checked={settings.autoHide}
              onCheckedChange={handleAutoHideToggle}
            />
          </div>

          {/* Notificações de Retorno de Cronograma */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <Label htmlFor="retorno-cronograma">Retornos de Cronograma</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Notificar quando clientes tiverem retornos de cronograma agendados
              </p>
            </div>
            <Switch
              id="retorno-cronograma"
              checked={configuracoes.notificacoes.retornoCronograma}
              onCheckedChange={handleRetornoCronogramaToggle}
            />
          </div>

          {/* Lembretes Antecipados */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <Label htmlFor="lembretes-antecipados">Lembretes Antecipados</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receber lembrete antes dos agendamentos
                </p>
              </div>
              <Switch
                id="lembretes-antecipados"
                checked={configuracoes.notificacoes.lembretesAntecipados}
                onCheckedChange={handleLembretesToggle}
              />
            </div>

            {/* Tempo de antecedência */}
            {configuracoes.notificacoes.lembretesAntecipados && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="tempo-antecedencia">Tempo de Antecedência</Label>
                <Select
                  value={configuracoes.notificacoes.tempoAntecedencia.toString()}
                  onValueChange={handleTempoAntecedenciaChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos antes</SelectItem>
                    <SelectItem value="30">30 minutos antes</SelectItem>
                    <SelectItem value="60">1 hora antes</SelectItem>
                    <SelectItem value="120">2 horas antes</SelectItem>
                    <SelectItem value="240">4 horas antes</SelectItem>
                    <SelectItem value="1440">1 dia antes</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Você será notificado {configuracoes.notificacoes.tempoAntecedencia >= 1440 
                    ? `${configuracoes.notificacoes.tempoAntecedencia / 1440} dia(s)` 
                    : configuracoes.notificacoes.tempoAntecedencia >= 60 
                      ? `${configuracoes.notificacoes.tempoAntecedencia / 60} hora(s)` 
                      : `${configuracoes.notificacoes.tempoAntecedencia} minuto(s)`} antes dos agendamentos
                </p>
              </div>
            )}
          </div>

          {/* Permissão do Navegador */}
          <div className="border-t pt-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Permissões do Navegador</Label>
                <p className="text-sm text-muted-foreground">
                  Conceda permissão para receber notificações mesmo quando a aba não estiver ativa
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleRequestPermission}
                className="w-full"
              >
                Solicitar Permissão de Notificação
              </Button>
            </div>
          </div>

          {/* Status das Configurações */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Status Atual</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Notificações Visuais: {settings.visualEnabled ? '✅ Ativadas' : '❌ Desativadas'}</div>
              <div>Som: {settings.soundEnabled ? '✅ Ativado' : '❌ Desativado'}</div>
              <div>Ocultar Auto: {settings.autoHide ? '✅ Ativado' : '❌ Desativado'}</div>
              <div>Permissão: {
                typeof window !== 'undefined' && 'Notification' in window 
                  ? Notification.permission === 'granted' ? '✅ Concedida' : '❌ Negada'
                  : '❌ Não suportado'
              }</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}