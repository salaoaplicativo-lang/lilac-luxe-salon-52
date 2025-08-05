import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, User, Scissors, DollarSign, Save, X, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Agendamento, Cliente, Servico } from '@/types/agendamento';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';

const agendamentoSchema = z.object({
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  servicoId: z.string().min(1, 'Serviço é obrigatório'),
  data: z.string().min(1, 'Data é obrigatória'),
  hora: z.string().min(1, 'Hora é obrigatória'),
  duracao: z.number().min(1, 'Duração deve ser maior que 0'),
  valor: z.number().min(0, 'Valor deve ser positivo'),
  valorPago: z.number().min(0, 'Valor pago deve ser positivo'),
  valorDevido: z.number().min(0, 'Valor devido deve ser positivo'),
  formaPagamento: z.enum(['dinheiro', 'cartao', 'pix', 'fiado']),
  statusPagamento: z.enum(['pago', 'parcial', 'em_aberto']),
  status: z.enum(['agendado', 'concluido', 'cancelado']),
  observacoes: z.string().optional(),
  dataPrevistaPagamento: z.string().optional(),
});

type AgendamentoFormData = z.infer<typeof agendamentoSchema>;

interface AgendamentoFormProps {
  agendamento?: Agendamento;
  clientes: Cliente[];
  servicos: Servico[];
  onSubmit: (data: AgendamentoFormData & { clienteNome: string; servicoNome: string }) => void;
  onCancel: () => void;
  verificarConflito: (agendamento: Partial<Agendamento>, excluirId?: string) => boolean;
}

export default function AgendamentoForm({
  agendamento,
  clientes,
  servicos,
  onSubmit,
  onCancel,
  verificarConflito,
}: AgendamentoFormProps) {
  const { configuracoes, getHorariosDisponiveis, isHorarioDisponivel } = useConfiguracoes();
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [conflito, setConflito] = useState(false);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);

  const form = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: {
      clienteId: agendamento?.clienteId || '',
      servicoId: agendamento?.servicoId || '',
      data: agendamento?.data || '',
      hora: agendamento?.hora || '',
      duracao: agendamento?.duracao || 0,
      valor: agendamento?.valor || 0,
      valorPago: agendamento?.valorPago || 0,
      valorDevido: agendamento?.valorDevido || 0,
      formaPagamento: agendamento?.formaPagamento || 'dinheiro',
      statusPagamento: agendamento?.statusPagamento || 'em_aberto',
      status: agendamento?.status || 'agendado',
      observacoes: agendamento?.observacoes || '',
      dataPrevistaPagamento: agendamento?.dataPrevistaPagamento || '',
    },
  });

  const watchedValues = form.watch(['data', 'hora', 'duracao']);

  // Verificar conflito quando data, hora ou duração mudarem
  useEffect(() => {
    const [data, hora, duracao] = watchedValues;
    if (data && hora && duracao) {
      const temConflito = verificarConflito(
        { data, hora, duracao },
        agendamento?.id
      );
      setConflito(temConflito);
    }
  }, [watchedValues, verificarConflito, agendamento?.id]);

  // Atualizar serviço selecionado
  useEffect(() => {
    const servicoId = form.watch('servicoId');
    if (servicoId) {
      const servico = servicos.find(s => s.id === servicoId);
      setServicoSelecionado(servico || null);
      if (servico) {
        form.setValue('duracao', servico.duracao);
        form.setValue('valor', servico.valor);
      }
    }
  }, [form.watch('servicoId'), servicos, form]);

  // Atualizar cliente selecionado
  useEffect(() => {
    const clienteId = form.watch('clienteId');
    if (clienteId) {
      const cliente = clientes.find(c => c.id === clienteId);
      setClienteSelecionado(cliente || null);
    }
  }, [form.watch('clienteId'), clientes]);

  // Atualizar horários disponíveis quando data muda
  useEffect(() => {
    const data = form.watch('data');
    if (data) {
      if (configuracoes) {
        const dataObj = new Date(data + 'T12:00:00');
        const diaSemana = dataObj.getDay();
        const duracaoServico = servicoSelecionado?.duracao || 60;
        const horarios = getHorariosDisponiveis(diaSemana, duracaoServico);
        setHorariosDisponiveis(horarios);
      } else {
        // Horários padrão quando configurações não estão carregadas
        const horariosDefault = [
          '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
          '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
          '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
        ];
        setHorariosDisponiveis(horariosDefault);
      }
      
      // Limpar horário se não estiver mais disponível
      const horarioAtual = form.watch('hora');
      const horariosAtuais = horariosDisponiveis;
      if (horarioAtual && horariosAtuais.length > 0 && !horariosAtuais.includes(horarioAtual)) {
        form.setValue('hora', '');
      }
    } else {
      setHorariosDisponiveis([]);
    }
  }, [form.watch('data'), configuracoes, servicoSelecionado, getHorariosDisponiveis, horariosDisponiveis]);

  const handleSubmit = (data: AgendamentoFormData) => {
    if (conflito) {
      return;
    }

    const clienteNome = clientes.find(c => c.id === data.clienteId)?.nome || '';
    const servicoNome = servicos.find(s => s.id === data.servicoId)?.nome || '';

    onSubmit({
      ...data,
      clienteNome,
      servicoNome,
    });
  };

  const formatarDuracao = (duracao: number) => {
    const horas = Math.floor(duracao / 60);
    const minutos = duracao % 60;
    
    if (horas > 0 && minutos > 0) {
      return `${horas}h ${minutos}min`;
    } else if (horas > 0) {
      return `${horas}h`;
    } else {
      return `${minutos}min`;
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          {agendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Cliente */}
              <FormField
                control={form.control}
                name="clienteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Cliente
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            <div>
                              <div className="font-medium">{cliente.nome}</div>
                              <div className="text-sm text-muted-foreground">{cliente.telefone}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Serviço */}
              <FormField
                control={form.control}
                name="servicoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Scissors className="h-4 w-4" />
                      Serviço
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {servicos.map((servico) => (
                          <SelectItem key={servico.id} value={servico.id}>
                            <div>
                              <div className="font-medium">{servico.nome}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatarDuracao(servico.duracao)} - R$ {servico.valor.toFixed(2)}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Data */}
              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Data
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hora */}
              <FormField
                control={form.control}
                name="hora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Hora
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um horário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {horariosDisponiveis.length > 0 ? (
                          horariosDisponiveis.map((horario) => (
                            <SelectItem key={horario} value={horario}>
                              {horario}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-horarios-disponiveis" disabled>
                            {form.watch('data') ? 'Nenhum horário disponível' : 'Selecione uma data primeiro'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {conflito && (
                      <p className="text-sm text-destructive font-medium">
                        ⚠️ Já existe um agendamento neste horário
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* Duração */}
              <FormField
                control={form.control}
                name="duracao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração (minutos)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                    {servicoSelecionado && (
                      <p className="text-sm text-muted-foreground">
                        Duração padrão: {formatarDuracao(servicoSelecionado.duracao)}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* Valor */}
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Valor Total (R$)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                    {servicoSelecionado && (
                      <p className="text-sm text-muted-foreground">
                        Valor padrão: R$ {servicoSelecionado.valor.toFixed(2)}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* Forma de Pagamento */}
              <FormField
                control={form.control}
                name="formaPagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Forma de Pagamento
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a forma de pagamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dinheiro">💵 Dinheiro</SelectItem>
                        <SelectItem value="cartao">💳 Cartão</SelectItem>
                        <SelectItem value="pix">📱 PIX</SelectItem>
                        <SelectItem value="fiado">📝 Fiado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valor Pago */}
              <FormField
                control={form.control}
                name="valorPago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Valor Pago (R$)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) => {
                          const valorPago = parseFloat(e.target.value) || 0;
                          const valorTotal = form.getValues('valor');
                          field.onChange(valorPago);
                          form.setValue('valorDevido', Math.max(0, valorTotal - valorPago));
                          
                          // Atualizar status do pagamento automaticamente
                          if (valorPago === 0) {
                            form.setValue('statusPagamento', 'em_aberto');
                          } else if (valorPago >= valorTotal) {
                            form.setValue('statusPagamento', 'pago');
                          } else {
                            form.setValue('statusPagamento', 'parcial');
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valor Devido */}
              <FormField
                control={form.control}
                name="valorDevido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Valor Devido (R$)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        readOnly
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data Prevista de Pagamento - Condicional */}
            {(form.watch('formaPagamento') === 'fiado' || 
              form.watch('statusPagamento') === 'parcial' ||
              form.watch('statusPagamento') === 'em_aberto') && (
              <FormField
                control={form.control}
                name="dataPrevistaPagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Data Prevista de Pagamento
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">
                      {form.watch('formaPagamento') === 'fiado' 
                        ? 'Quando o cliente disse que vai pagar'
                        : 'Data prevista para pagamento do valor restante'
                      }
                    </p>
                  </FormItem>
                )}
              />
            )}

            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre o agendamento..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={conflito}
                className="bg-gradient-to-r from-primary to-lilac-primary shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Save className="h-4 w-4 mr-2" />
                {agendamento ? 'Atualizar' : 'Criar'} Agendamento
              </Button>
              
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}