import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfiguracaoHorarios } from '@/components/configuracoes/ConfiguracaoHorarios';
import { ConfiguracaoNotificacoes } from '@/components/configuracoes/ConfiguracaoNotificacoes';
import { ConfiguracaoBackup } from '@/components/configuracoes/ConfiguracaoBackup';
import { Clock, Bell, Download, Settings } from 'lucide-react';

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState('horarios');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Configurações
        </h1>
        <p className="text-muted-foreground">
          Configure os horários de atendimento, notificações e backup do sistema
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto">
          <TabsTrigger value="horarios" className="flex items-center gap-2 py-3">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Horários e Dias</span>
            <span className="sm:hidden">Horários</span>
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center gap-2 py-3">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
            <span className="sm:hidden">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2 py-3">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Sistema de Backup</span>
            <span className="sm:hidden">Backup</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="horarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horários e Dias de Trabalho
              </CardTitle>
              <CardDescription>
                Configure os dias da semana e horários em que você atenderá clientes. 
                Estas configurações serão respeitadas nos formulários de agendamento.
              </CardDescription>
            </CardHeader>
          </Card>
          <ConfiguracaoHorarios />
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Sistema de Notificações
              </CardTitle>
              <CardDescription>
                Configure como você deseja receber notificações sobre novos agendamentos, 
                retornos de cronograma e lembretes antecipados.
              </CardDescription>
            </CardHeader>
          </Card>
          <ConfiguracaoNotificacoes />
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Sistema de Backup
              </CardTitle>
              <CardDescription>
                Mantenha seus dados seguros com backups manuais e automáticos. 
                Exporte seus dados ou configure envios automáticos por e-mail.
              </CardDescription>
            </CardHeader>
          </Card>
          <ConfiguracaoBackup />
        </TabsContent>
      </Tabs>

      {/* Informações Importantes */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              📋 Integração com Agendamentos
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Os horários configurados aqui serão automaticamente aplicados aos formulários 
              de agendamento interno e externo, bloqueando horários indisponíveis.
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
              💡 Dicas de Uso
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Configure intervalos personalizados para pausas específicas e 
              ative notificações para não perder nenhum agendamento importante.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}