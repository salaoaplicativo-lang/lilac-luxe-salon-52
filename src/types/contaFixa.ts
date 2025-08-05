export interface ContaFixa {
  id: string;
  nome: string;
  valor: number;
  dataVencimento: number; // dia do mês (1-31)
  categoria: string;
  status: 'pago' | 'em_aberto';
  observacoes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface NovaContaFixa {
  nome: string;
  valor: number;
  dataVencimento: number;
  categoria: string;
  observacoes?: string;
}

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa' | 'investimento';
  cor?: string;
  created_at: Date;
  updated_at: Date;
}

export interface NovaCategoriaFinanceira {
  nome: string;
  tipo: 'receita' | 'despesa' | 'investimento';
  cor?: string;
}