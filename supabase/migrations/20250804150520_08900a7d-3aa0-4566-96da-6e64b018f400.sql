-- Create tables for the beauty salon management app

-- Create clientes table
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  primeiro_nome TEXT,
  segundo_nome TEXT,
  telefone TEXT,
  email TEXT,
  redes_sociais JSON DEFAULT '{}',
  data_cadastro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create servicos table
CREATE TABLE public.servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  nome TEXT,
  duracao_em_minutos INTEGER,
  preco NUMERIC,
  categoria TEXT
);

-- Create agendamentos table
CREATE TABLE public.agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  cliente_id UUID REFERENCES public.clientes(id),
  servico_id UUID REFERENCES public.servicos(id),
  data DATE,
  hora TIME,
  status TEXT DEFAULT 'agendado',
  foi_pago BOOLEAN DEFAULT false,
  valor_pago NUMERIC DEFAULT 0,
  valor_fiado NUMERIC DEFAULT 0,
  observacoes TEXT
);

-- Create cronogramas table
CREATE TABLE public.cronogramas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  dia DATE,
  hora_inicio TIME,
  hora_fim TIME,
  cliente_id UUID REFERENCES public.clientes(id),
  servico_id UUID REFERENCES public.servicos(id),
  reservado BOOLEAN DEFAULT true
);

-- Create financeiro table
CREATE TABLE public.financeiro (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  tipo TEXT,
  valor NUMERIC,
  categoria TEXT,
  descricao TEXT,
  data TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  agendamento_id UUID REFERENCES public.agendamentos(id),
  recorrente BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cronogramas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clientes
CREATE POLICY "Users can view their own clientes" 
ON public.clientes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clientes" 
ON public.clientes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clientes" 
ON public.clientes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clientes" 
ON public.clientes FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for servicos
CREATE POLICY "Users can view their own servicos" 
ON public.servicos FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own servicos" 
ON public.servicos FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own servicos" 
ON public.servicos FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own servicos" 
ON public.servicos FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for agendamentos
CREATE POLICY "Users can view their own agendamentos" 
ON public.agendamentos FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agendamentos" 
ON public.agendamentos FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agendamentos" 
ON public.agendamentos FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agendamentos" 
ON public.agendamentos FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for cronogramas
CREATE POLICY "Users can view their own cronogramas" 
ON public.cronogramas FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cronogramas" 
ON public.cronogramas FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cronogramas" 
ON public.cronogramas FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cronogramas" 
ON public.cronogramas FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for financeiro
CREATE POLICY "Users can view their own financeiro" 
ON public.financeiro FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own financeiro" 
ON public.financeiro FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financeiro" 
ON public.financeiro FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financeiro" 
ON public.financeiro FOR DELETE 
USING (auth.uid() = user_id);