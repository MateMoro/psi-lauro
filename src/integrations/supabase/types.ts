export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      caps: {
        Row: {
          id: string
          municipio: string | null
          nome: string
          tipo: string | null
        }
        Insert: {
          id?: string
          municipio?: string | null
          nome: string
          tipo?: string | null
        }
        Update: {
          id?: string
          municipio?: string | null
          nome?: string
          tipo?: string | null
        }
        Relationships: []
      }
      familiares_contato: {
        Row: {
          id: string
          nome: string | null
          paciente_id: string | null
          parentesco: string | null
          telefone: string | null
        }
        Insert: {
          id?: string
          nome?: string | null
          paciente_id?: string | null
          parentesco?: string | null
          telefone?: string | null
        }
        Update: {
          id?: string
          nome?: string | null
          paciente_id?: string | null
          parentesco?: string | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "familiares_contato_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitais: {
        Row: {
          cnes: string | null
          id: string
          municipio: string | null
          nome: string
          tipo: string | null
        }
        Insert: {
          cnes?: string | null
          id?: string
          municipio?: string | null
          nome: string
          tipo?: string | null
        }
        Update: {
          cnes?: string | null
          id?: string
          municipio?: string | null
          nome?: string
          tipo?: string | null
        }
        Relationships: []
      }
      internacoes: {
        Row: {
          caps_referencia_id: string | null
          data_admissao: string | null
          data_alta: string | null
          diagnostico: string | null
          dias_internacao: number | null
          encaminhamento_alta: string | null
          enfermaria: string | null
          hospital_id: string | null
          id: string
          informacoes_relevantes: string | null
          leito: string | null
          paciente_id: string | null
          rede_transferencia: string | null
          tipo_alta: string | null
        }
        Insert: {
          caps_referencia_id?: string | null
          data_admissao?: string | null
          data_alta?: string | null
          diagnostico?: string | null
          dias_internacao?: number | null
          encaminhamento_alta?: string | null
          enfermaria?: string | null
          hospital_id?: string | null
          id?: string
          informacoes_relevantes?: string | null
          leito?: string | null
          paciente_id?: string | null
          rede_transferencia?: string | null
          tipo_alta?: string | null
        }
        Update: {
          caps_referencia_id?: string | null
          data_admissao?: string | null
          data_alta?: string | null
          diagnostico?: string | null
          dias_internacao?: number | null
          encaminhamento_alta?: string | null
          enfermaria?: string | null
          hospital_id?: string | null
          id?: string
          informacoes_relevantes?: string | null
          leito?: string | null
          paciente_id?: string | null
          rede_transferencia?: string | null
          tipo_alta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internacoes_caps_referencia_id_fkey"
            columns: ["caps_referencia_id"]
            isOneToOne: false
            referencedRelation: "caps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internacoes_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internacoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes: {
        Row: {
          cns: string | null
          cor_raca: string | null
          data_nascimento: string | null
          id: string
          nome: string
          sexo: string | null
          situacao_rua: string | null
          vinculo_familiar: boolean | null
        }
        Insert: {
          cns?: string | null
          cor_raca?: string | null
          data_nascimento?: string | null
          id?: string
          nome: string
          sexo?: string | null
          situacao_rua?: string | null
          vinculo_familiar?: boolean | null
        }
        Update: {
          cns?: string | null
          cor_raca?: string | null
          data_nascimento?: string | null
          id?: string
          nome?: string
          sexo?: string | null
          situacao_rua?: string | null
          vinculo_familiar?: boolean | null
        }
        Relationships: []
      }
      pacientes_planalto: {
        Row: {
          caps_referencia: string | null
          cid: string | null
          cid_grupo: string | null
          cid_grupo_detalhado: string | null
          cns: string | null
          comorbidade: string | null
          data_admissao: string | null
          data_alta: string | null
          data_nascimento: string | null
          data_update: string | null
          dia_semana_alta: number | null
          dia_semana_alta_nome: string | null
          dias_internacao: number | null
          encaminhamento: string | null
          genero: string | null
          id: number
          nome: string | null
          procedencia: string | null
          raca_cor: string | null
          tipo_alta: string | null
          transferencia_destino: string | null
          transtorno_categoria: Database["public"]["Enums"]["transtorno_tipo"]
        }
        Insert: {
          caps_referencia?: string | null
          cid?: string | null
          cid_grupo?: string | null
          cid_grupo_detalhado?: string | null
          cns?: string | null
          comorbidade?: string | null
          data_admissao?: string | null
          data_alta?: string | null
          data_nascimento?: string | null
          data_update?: string | null
          dia_semana_alta?: number | null
          dia_semana_alta_nome?: string | null
          dias_internacao?: number | null
          encaminhamento?: string | null
          genero?: string | null
          id?: number
          nome?: string | null
          procedencia?: string | null
          raca_cor?: string | null
          tipo_alta?: string | null
          transferencia_destino?: string | null
          transtorno_categoria?: Database["public"]["Enums"]["transtorno_tipo"]
        }
        Update: {
          caps_referencia?: string | null
          cid?: string | null
          cid_grupo?: string | null
          cid_grupo_detalhado?: string | null
          cns?: string | null
          comorbidade?: string | null
          data_admissao?: string | null
          data_alta?: string | null
          data_nascimento?: string | null
          data_update?: string | null
          dia_semana_alta?: number | null
          dia_semana_alta_nome?: string | null
          dias_internacao?: number | null
          encaminhamento?: string | null
          genero?: string | null
          id?: number
          nome?: string | null
          procedencia?: string | null
          raca_cor?: string | null
          tipo_alta?: string | null
          transferencia_destino?: string | null
          transtorno_categoria?: Database["public"]["Enums"]["transtorno_tipo"]
        }
        Relationships: []
      }
      pacientes_tiradentes: {
        Row: {
          caps_referencia: string | null
          cid: string | null
          cid_grupo: string | null
          cid_grupo_detalhado: string | null
          cns: string | null
          comorbidade: string | null
          data_admissao: string | null
          data_alta: string | null
          data_nascimento: string | null
          data_update: string | null
          dia_semana_alta: number | null
          dia_semana_alta_nome: string | null
          dias_internacao: number | null
          encaminhamento: string | null
          genero: string | null
          id: number
          nome: string | null
          procedencia: string | null
          raca_cor: string | null
          tipo_alta: string | null
          transferencia_destino: string | null
          transtorno_categoria: Database["public"]["Enums"]["transtorno_tipo"]
        }
        Insert: {
          caps_referencia?: string | null
          cid?: string | null
          cid_grupo?: string | null
          cid_grupo_detalhado?: string | null
          cns?: string | null
          comorbidade?: string | null
          data_admissao?: string | null
          data_alta?: string | null
          data_nascimento?: string | null
          data_update?: string | null
          dia_semana_alta?: number | null
          dia_semana_alta_nome?: string | null
          dias_internacao?: number | null
          encaminhamento?: string | null
          genero?: string | null
          id?: number
          nome?: string | null
          procedencia?: string | null
          raca_cor?: string | null
          tipo_alta?: string | null
          transferencia_destino?: string | null
          transtorno_categoria?: Database["public"]["Enums"]["transtorno_tipo"]
        }
        Update: {
          caps_referencia?: string | null
          cid?: string | null
          cid_grupo?: string | null
          cid_grupo_detalhado?: string | null
          cns?: string | null
          comorbidade?: string | null
          data_admissao?: string | null
          data_alta?: string | null
          data_nascimento?: string | null
          data_update?: string | null
          dia_semana_alta?: number | null
          dia_semana_alta_nome?: string | null
          dias_internacao?: number | null
          encaminhamento?: string | null
          genero?: string | null
          id?: number
          nome?: string | null
          procedencia?: string | null
          raca_cor?: string | null
          tipo_alta?: string | null
          transferencia_destino?: string | null
          transtorno_categoria?: Database["public"]["Enums"]["transtorno_tipo"]
        }
        Relationships: []
      }
      privacy_policy_acceptances: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          policy_version: string
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          policy_version: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          policy_version?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          ativo: boolean
          caps_id: string | null
          created_at: string
          email: string
          hospital_id: string | null
          id: string
          nome: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          caps_id?: string | null
          created_at?: string
          email: string
          hospital_id?: string | null
          id?: string
          nome: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          caps_id?: string | null
          created_at?: string
          email?: string
          hospital_id?: string | null
          id?: string
          nome?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_caps_id_fkey"
            columns: ["caps_id"]
            isOneToOne: false
            referencedRelation: "caps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          email: string
          hospital_id: string | null
          id: string
          nome: string
          papel: string | null
          senha_hash: string | null
        }
        Insert: {
          email: string
          hospital_id?: string | null
          id?: string
          nome: string
          papel?: string | null
          senha_hash?: string | null
        }
        Update: {
          email?: string
          hospital_id?: string | null
          id?: string
          nome?: string
          papel?: string | null
          senha_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitais"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          caps_id: string
          caps_nome: string
          email: string
          hospital_id: string
          hospital_nome: string
          id: string
          nome: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_coordinator_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mapear_grupo_cid_sql: {
        Args: { codigo: string }
        Returns: string
      }
      rpc_internacoes_enriched: {
        Args: { d1: string; d2: string }
        Returns: {
          caps_nome: string
          cid_principal: string
          data_admissao: string
          data_alta: string
          data_nascimento: string
          grupo_diagnostico: string
          hospital: string
          id_internacao: string
          id_paciente: string
          idade: number
          paciente_nome: string
          raca_cor: string
          sexo: string
          via_entrada: string
        }[]
      }
      rpc_internacoes_inconsistentes_count: {
        Args: { d1: string; d2: string }
        Returns: number
      }
      user_has_role: {
        Args: { _user_id: string; _role: string }
        Returns: boolean
      }
      weekday_pt: {
        Args: { d: string } | { ts: string }
        Returns: string
      }
    }
    Enums: {
      transtorno_tipo:
        | "esquizofrenia"
        | "transtorno_bipolar"
        | "substancias"
        | "depressivo_unipolar"
        | "personalidade"
        | "ansiedade"
        | "outros"
      user_role: "coordenador" | "gestor_caps"
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
    : keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]),
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
    : keyof DefaultSchema["Tables"],
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
    : keyof DefaultSchema["Tables"],
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
  PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"],
> = DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]

export const Constants = {
  public: {
    Enums: {
      transtorno_tipo: [
        "esquizofrenia",
        "transtorno_bipolar",
        "substancias",
        "depressivo_unipolar",
        "personalidade",
        "ansiedade",
        "outros",
      ],
      user_role: ["coordenador", "gestor_caps"],
    },
  },
} as const