import React, { useState, useEffect } from 'react';
import { useAgendamentoOnline } from '@/hooks/useAgendamentoOnline';
import { useShare } from '@/hooks/useShare';
import { AgendamentoOnlineForm as FormData } from '@/types/agendamentoOnline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, CheckCircle, Share2, MessageCircle, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function AgendamentoOnlineForm() {
  const {
    servicosPublicos,
    calcularHorariosDisponiveis,
    criarAgendamento,
    validarEmail,
    validarTelefone,
    formatarTelefone
  } = useAgendamentoOnline();
  
  const { canShare, isSharing, shareContent, copyToClipboard } = useShare();

  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: '',
    email: '',
    telefone: '',
    servicoId: '',
    data: '',
    horario: '',
    observacoes: ''
  });

  const [horariosDisponiveis, setHorariosDisponiveis] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [agendamentoDetalhes, setAgendamentoDetalhes] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formData.servicoId && formData.data) {
      const horariosCalculados = calcularHorariosDisponiveis(formData.servicoId, formData.data);
      setHorariosDisponiveis(horariosCalculados);
      
      if (formData.horario && !horariosCalculados.find(h => h.horario === formData.horario)?.disponivel) {
        setFormData(prev => ({ ...prev, horario: '' }));
      }
    }
  }, [formData.servicoId, formData.data, calcularHorariosDisponiveis]);

  const dataMinima = new Date().toISOString().split('T')[0];

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'nomeCompleto':
        if (!value.trim()) newErrors.nomeCompleto = 'Nome obrigatório';
        else delete newErrors.nomeCompleto;
        break;
      case 'email':
        if (!value) newErrors.email = 'E-mail obrigatório';
        else if (!validarEmail(value)) newErrors.email = 'E-mail inválido';
        else delete newErrors.email;
        break;
      case 'telefone':
        if (!value) newErrors.telefone = 'Telefone obrigatório';
        else if (!validarTelefone(value)) newErrors.telefone = 'Telefone inválido';
        else delete newErrors.telefone;
        break;
      case 'servicoId':
        if (!value) newErrors.servicoId = 'Selecione um serviço';
        else delete newErrors.servicoId;
        break;
      case 'data':
        if (!value) newErrors.data = 'Selecione uma data';
        else delete newErrors.data;
        break;
      case 'horario':
        if (!value) newErrors.horario = 'Selecione um horário';
        else delete newErrors.horario;
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'telefone') {
      value = formatarTelefone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    Object.keys(formData).forEach(field => {
      if (field !== 'observacoes') {
        validateField(field, formData[field as keyof FormData]);
      }
    });

    if (Object.keys(errors).length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos corretamente.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const sucesso = await criarAgendamento(formData);
      
      if (sucesso) {
        const servico = servicosPublicos.find(s => s.id === formData.servicoId);
        setAgendamentoDetalhes({
          servico: servico?.nome,
          data: new Date(formData.data).toLocaleDateString('pt-BR'),
          horario: formData.horario,
          nome: formData.nomeCompleto,
          telefone: formData.telefone,
          valor: servico?.valor
        });
        setIsSuccess(true);
        setFormData({
          nomeCompleto: '',
          email: '',
          telefone: '',
          servicoId: '',
          data: '',
          horario: '',
          observacoes: ''
        });
      }
    } catch (error) {
      console.error('Erro ao enviar agendamento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para compartilhar agendamento via WhatsApp
  const compartilharAgendamento = async () => {
    if (!agendamentoDetalhes) return;
    
    const mensagem = `✅ *Comprovante de Agendamento*\n\n` +
      `👤 *Cliente:* ${agendamentoDetalhes.nome}\n` +
      `💅 *Serviço:* ${agendamentoDetalhes.servico}\n` +
      `📅 *Data:* ${agendamentoDetalhes.data}\n` +
      `🕐 *Horário:* ${agendamentoDetalhes.horario}\n` +
      `💰 *Valor:* R$ ${agendamentoDetalhes.valor?.toFixed(2)}\n\n` +
      `Agendamento confirmado! Nos vemos lá! 😊`;
    
    await shareContent({
      title: "📋 Comprovante de Agendamento",
      text: mensagem
    });
  };

  // Função para compartilhar link do formulário
  const compartilharFormulario = async () => {
    const url = window.location.href;
    const mensagem = `📅 Agende seu horário!\n\nOlá! Use este link para agendar rapidinho:\n\nÉ super fácil e rápido! ✨`;
    
    await shareContent({
      title: "📅 Agende Seu Horário",
      text: mensagem,
      url: url
    });
  };

  // Função para copiar link
  const copiarLink = async () => {
    const url = window.location.href;
    await copyToClipboard(url);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[image:var(--gradient-soft)] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center rounded-3xl shadow-[var(--shadow-elegant)] border-0 bg-gradient-to-br from-card via-card/95 to-accent/10 backdrop-blur-sm overflow-hidden">
          <CardContent className="pt-8 pb-8 px-8">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-3">
              Agendamento Confirmado!
            </h2>
            <p className="text-xl mb-6">✨ Tudo certo! Nos vemos lá! ✨</p>
            
            {agendamentoDetalhes && (
              <div className="bg-gradient-to-r from-muted/30 to-accent/20 rounded-2xl p-6 mb-8 text-left border border-border/50">
                <h3 className="font-bold mb-4 text-center text-lg flex items-center justify-center gap-2">
                  <span className="text-2xl">📋</span>
                  Detalhes do Agendamento
                </h3>
                <div className="space-y-3 text-base">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💅</span>
                    <div>
                      <span className="font-medium text-muted-foreground">Serviço:</span>
                      <p className="font-semibold">{agendamentoDetalhes.servico}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📅</span>
                    <div>
                      <span className="font-medium text-muted-foreground">Data:</span>
                      <p className="font-semibold">{agendamentoDetalhes.data}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🕐</span>
                    <div>
                      <span className="font-medium text-muted-foreground">Horário:</span>
                      <p className="font-semibold">{agendamentoDetalhes.horario}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💰</span>
                    <div>
                      <span className="font-medium text-muted-foreground">Valor:</span>
                      <p className="font-semibold text-green-600">R$ {agendamentoDetalhes.valor?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <Button 
                onClick={compartilharAgendamento}
                className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                disabled={isSharing}
              >
                <MessageCircle className="w-6 h-6 mr-3" />
                {isSharing ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Compartilhando...
                  </span>
                ) : (
                  canShare ? '📲 Compartilhar Comprovante' : '📲 Compartilhar via WhatsApp'
                )}
              </Button>
              
              <div className="flex gap-3">
                <Button 
                  onClick={compartilharFormulario}
                  variant="outline" 
                  className="flex-1 h-12 rounded-2xl border-2 hover:bg-primary/5 transition-all"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {canShare ? 'Compartilhar Form' : 'WhatsApp Form'}
                </Button>
                <Button 
                  onClick={copiarLink}
                  variant="outline" 
                  className="flex-1 h-12 rounded-2xl border-2 hover:bg-secondary/5 transition-all"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link
                </Button>
              </div>
              
              <Button 
                onClick={() => setIsSuccess(false)} 
                variant="outline"
                className="w-full h-12 rounded-2xl border-2 hover:bg-accent/10 transition-all"
              >
                <span className="text-lg">🔄</span>
                <span className="ml-2">Fazer Novo Agendamento</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[image:var(--gradient-soft)] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-[var(--shadow-elegant)] border-0 rounded-3xl overflow-hidden bg-gradient-to-br from-card via-card/95 to-lilac-lighter/20 backdrop-blur-sm">
          <CardHeader className="text-center bg-[image:var(--gradient-primary)] rounded-t-3xl py-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5"></div>
            <div className="relative z-10">
              <div className="text-7xl mb-4 animate-pulse">💅</div>
              <CardTitle className="text-4xl font-bold text-white drop-shadow-lg mb-3">
                Agende Seu Horário
              </CardTitle>
              <CardDescription className="text-white/90 text-lg font-medium">
                Escolha o serviço, data e horário ideal pra você! ✨
              </CardDescription>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
            
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="w-5 h-5" />
                  </div>
                  Seus Dados
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nomeCompleto" className="text-sm font-medium text-muted-foreground">Nome Completo *</Label>
                    <Input
                      id="nomeCompleto"
                      value={formData.nomeCompleto}
                      onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                      placeholder="Seu nome completo"
                      className={`rounded-2xl border-2 h-12 px-4 transition-all ${errors.nomeCompleto ? 'border-destructive' : 'border-border hover:border-primary/30 focus:border-primary'}`}
                    />
                    {errors.nomeCompleto && <p className="text-sm text-destructive mt-1">{errors.nomeCompleto}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-sm font-medium text-muted-foreground">Telefone *</Label>
                    <Input
                      id="telefone"
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      className={`rounded-2xl border-2 h-12 px-4 transition-all ${errors.telefone ? 'border-destructive' : 'border-border hover:border-primary/30 focus:border-primary'}`}
                    />
                    {errors.telefone && <p className="text-sm text-destructive mt-1">{errors.telefone}</p>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                    className={`rounded-2xl border-2 h-12 px-4 transition-all ${errors.email ? 'border-destructive' : 'border-border hover:border-primary/30 focus:border-primary'}`}
                  />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                  <div className="p-2 bg-secondary/20 rounded-full">
                    <span className="text-lg">💅</span>
                  </div>
                  Serviço
                </h3>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Escolha o Serviço *</Label>
                  <Select value={formData.servicoId} onValueChange={(value) => handleInputChange('servicoId', value)}>
                    <SelectTrigger className={`rounded-2xl border-2 h-12 transition-all ${errors.servicoId ? 'border-destructive' : 'border-border hover:border-primary/30 focus:border-primary'}`}>
                      <SelectValue placeholder="✨ Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {servicosPublicos.map((servico) => (
                        <SelectItem key={servico.id} value={servico.id} className="rounded-xl">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">💅</span>
                            <span>{servico.nome} - R$ {servico.valor.toFixed(2)} ({servico.duracao}min)</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.servicoId && <p className="text-sm text-destructive mt-1">{errors.servicoId}</p>}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-3 text-primary">
                  <div className="p-2 bg-accent/20 rounded-full">
                    <Calendar className="w-5 h-5" />
                  </div>
                  Data e Horário
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <Label className="text-sm font-medium text-muted-foreground">Data *</Label>
                     <Input
                       type="date"
                       value={formData.data}
                       min={dataMinima}
                         onChange={(e) => handleInputChange('data', e.target.value)}
                       className={`rounded-2xl border-2 h-12 px-4 transition-all ${errors.data ? 'border-destructive' : 'border-border hover:border-primary/30 focus:border-primary'}`}
                     />
                     {errors.data && <p className="text-sm text-destructive mt-1">{errors.data}</p>}
                   </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Horário *</Label>
                    <Select 
                      value={formData.horario} 
                      onValueChange={(value) => handleInputChange('horario', value)}
                      disabled={!formData.servicoId || !formData.data}
                    >
                      <SelectTrigger className={`rounded-2xl border-2 h-12 transition-all ${errors.horario ? 'border-destructive' : 'border-border hover:border-primary/30 focus:border-primary'}`}>
                        <SelectValue placeholder="🕐 Selecione um horário" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {horariosDisponiveis.filter(h => h.disponivel).map((horario) => (
                          <SelectItem key={horario.horario} value={horario.horario} className="rounded-xl">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {horario.horario}
                            </div>
                          </SelectItem>
                        ))}
                        {horariosDisponiveis.length > 0 && horariosDisponiveis.every(h => !h.disponivel) && (
                          <SelectItem value="no-horarios-disponiveis" disabled>
                            Nenhum horário disponível
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.horario && <p className="text-sm text-destructive mt-1">{errors.horario}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Observações (Opcional)</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="💬 Informações adicionais..."
                  rows={3}
                  className="rounded-2xl border-2 px-4 py-3 transition-all border-border hover:border-primary/30 focus:border-primary resize-none"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold rounded-2xl bg-[image:var(--gradient-primary)] hover:scale-[1.02] shadow-[var(--shadow-elegant)] hover:shadow-2xl transition-all duration-300 border-0" 
                disabled={isSubmitting}
              >
                <span className="flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Agendando...
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">✨</span>
                      Confirmar Agendamento
                    </>
                  )}
                </span>
              </Button>
              
              <p className="text-sm text-muted-foreground text-center font-medium">* Campos obrigatórios</p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}