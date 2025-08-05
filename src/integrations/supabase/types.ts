export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          cliente_id: string | null
          data: string | null
          foi_pago: boolean | null
          hora: string | null
          id: string
          observacoes: string | null
          servico_id: string | null
          status: string | null
          user_id: string
          valor_fiado: number | null
          valor_pago: number | null
        }
        Insert: {
          cliente_id?: string | null
          data?: string | null
          foi_pago?: boolean | null
          hora?: string | null
          id?: string
          observacoes?: string | null
          servico_id?: string | null
          status?: string | null
          user_id?: string
          valor_fiado?: number | null
          valor_pago?: number | null
        }
        Update: {
          cliente_id?: string | null
          data?: string | null
          foi_pago?: boolean | null
          hora?: string | null
          id?: string
          observacoes?: string | null
          servico_id?: string | null
          status?: string | null
          user_id?: string
          valor_fiado?: number | null
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          data_cadastro: string
          email: string | null
          id: string
          primeiro_nome: string | null
          redes_sociais: Json | null
          segundo_nome: string | null
          telefone: string | null
          user_id: string
        }
        Insert: {
          data_cadastro?: string
          email?: string | null
          id?: string
          primeiro_nome?: string | null
          redes_sociais?: Json | null
          segundo_nome?: string | null
          telefone?: string | null
          user_id?: string
        }
        Update: {
          data_cadastro?: string
          email?: string | null
          id?: string
          primeiro_nome?: string | null
          redes_sociais?: Json | null
          segundo_nome?: string | null
          telefone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cronogramas: {
        Row: {
          cliente_id: string | null
          dia: string | null
          hora_fim: string | null
          hora_inicio: string | null
          id: string
          reservado: boolean | null
          servico_id: string | null
          user_id: string
        }
        Insert: {
          cliente_id?: string | null
          dia?: string | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          reservado?: boolean | null
          servico_id?: string | null
          user_id?: string
        }
        Update: {
          cliente_id?: string | null
          dia?: string | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          reservado?: boolean | null
          servico_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cronogramas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cronogramas_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro: {
        Row: {
          agendamento_id: string | null
          categoria: string | null
          data: string
          descricao: string | null
          id: string
          recorrente: boolean | null
          tipo: string | null
          user_id: string
          valor: number | null
        }
        Insert: {
          agendamento_id?: string | null
          categoria?: string | null
          data?: string
          descricao?: string | null
          id?: string
          recorrente?: boolean | null
          tipo?: string | null
          user_id?: string
          valor?: number | null
        }
        Update: {
          agendamento_id?: string | null
          categoria?: string | null
          data?: string
          descricao?: string | null
          id?: string
          recorrente?: boolean | null
          tipo?: string | null
          user_id?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          categoria: string | null
          duracao_em_minutos: number | null
          id: string
          nome: string | null
          preco: number | null
          user_id: string
        }
        Insert: {
          categoria?: string | null
          duracao_em_minutos?: number | null
          id?: string
          nome?: string | null
          preco?: number | null
          user_id?: string
        }
        Update: {
          categoria?: string | null
          duracao_em_minutos?: number | null
          id?: string
          nome?: string | null
          preco?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
