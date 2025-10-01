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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      building_footprints: {
        Row: {
          amenity: string | null
          area_sq_m: string | null
          bbox: number[] | null
          building_i: string | null
          building_n: string | null
          condition: string | null
          created_at: string | null
          fid: number | null
          floors: number | null
          geometry: Json | null
          id: number
          land_use: string | null
          last_updat: string | null
          lots: string | null
          parcel_id: string | null
          ptype: string | null
          section: string | null
          source: string | null
          uprn_2: string | null
          val: number | null
          year_built: number | null
          zone_id: number | null
        }
        Insert: {
          amenity?: string | null
          area_sq_m?: string | null
          bbox?: number[] | null
          building_i?: string | null
          building_n?: string | null
          condition?: string | null
          created_at?: string | null
          fid?: number | null
          floors?: number | null
          geometry?: Json | null
          id?: never
          land_use?: string | null
          last_updat?: string | null
          lots?: string | null
          parcel_id?: string | null
          ptype?: string | null
          section?: string | null
          source?: string | null
          uprn_2?: string | null
          val?: number | null
          year_built?: number | null
          zone_id?: number | null
        }
        Update: {
          amenity?: string | null
          area_sq_m?: string | null
          bbox?: number[] | null
          building_i?: string | null
          building_n?: string | null
          condition?: string | null
          created_at?: string | null
          fid?: number | null
          floors?: number | null
          geometry?: Json | null
          id?: never
          land_use?: string | null
          last_updat?: string | null
          lots?: string | null
          parcel_id?: string | null
          ptype?: string | null
          section?: string | null
          source?: string | null
          uprn_2?: string | null
          val?: number | null
          year_built?: number | null
          zone_id?: number | null
        }
        Relationships: []
      }
      customer_lots: {
        Row: {
          address: string | null
          contact_info: string | null
          customer_id: string
          customer_name: string | null
          date_created: string | null
          id: number
          last_updated: string | null
          lot_number: string | null
          owner_id: string | null
          section: string | null
          ward: string | null
        }
        Insert: {
          address?: string | null
          contact_info?: string | null
          customer_id: string
          customer_name?: string | null
          date_created?: string | null
          id?: number
          last_updated?: string | null
          lot_number?: string | null
          owner_id?: string | null
          section?: string | null
          ward?: string | null
        }
        Update: {
          address?: string | null
          contact_info?: string | null
          customer_id?: string
          customer_name?: string | null
          date_created?: string | null
          id?: number
          last_updated?: string | null
          lot_number?: string | null
          owner_id?: string | null
          section?: string | null
          ward?: string | null
        }
        Relationships: []
      }
      Lae_Cadatre_w2: {
        Row: {
          area_sq_m: string | null
          fid: number
          land_use: string | null
          "lot(s)": string | null
          owner_id: string | null
          parcel_id: string
          ptype: string | null
          rplan: string | null
          section: string | null
          uprn_2: string | null
          "val no.": number | null
          ward_no: string | null
          zone_id: number | null
        }
        Insert: {
          area_sq_m?: string | null
          fid?: number
          land_use?: string | null
          "lot(s)"?: string | null
          owner_id?: string | null
          parcel_id: string
          ptype?: string | null
          rplan?: string | null
          section?: string | null
          uprn_2?: string | null
          "val no."?: number | null
          ward_no?: string | null
          zone_id?: number | null
        }
        Update: {
          area_sq_m?: string | null
          fid?: number
          land_use?: string | null
          "lot(s)"?: string | null
          owner_id?: string | null
          parcel_id?: string
          ptype?: string | null
          rplan?: string | null
          section?: string | null
          uprn_2?: string | null
          "val no."?: number | null
          ward_no?: string | null
          zone_id?: number | null
        }
        Relationships: []
      }
      planning_data: {
        Row: {
          last_updated_at: string | null
          last_updated_by: string | null
          permit_status: string | null
          planning_id: number
          property_id: number
          zoning_code: string | null
        }
        Insert: {
          last_updated_at?: string | null
          last_updated_by?: string | null
          permit_status?: string | null
          planning_id?: number
          property_id: number
          zoning_code?: string | null
        }
        Update: {
          last_updated_at?: string | null
          last_updated_by?: string | null
          permit_status?: string | null
          planning_id?: number
          property_id?: number
          zoning_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planning_data_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["property_id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          owner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["owner_id"]
          },
        ]
      }
      properties: {
        Row: {
          property_id: number
          building_id: string
          parcel_id: string | null
          section: string | null
          lot: string | null
          val_no: string | null
          building_name: string | null
          address: string | null
          land_details: Json | null
          building_details: Json | null
          image_url: string | null
          geom: unknown | null
        }
        Insert: {
          property_id?: number
          building_id: string
          parcel_id?: string | null
          section?: string | null
          lot?: string | null
          val_no?: string | null
          building_name?: string | null
          address?: string | null
          land_details?: Json | null
          building_details?: Json | null
          image_url?: string | null
          geom?: unknown | null
        }
        Update: {
          property_id?: number
          building_id?: string
          parcel_id?: string | null
          section?: string | null
          lot?: string | null
          val_no?: string | null
          building_name?: string | null
          address?: string | null
          land_details?: Json | null
          building_details?: Json | null
          image_url?: string | null
          geom?: unknown | null
        }
        Relationships: []
      }
      tax_records: {
        Row: {
          amount_due: number | null
          val_no: string | null
          payment_status: string | null
          property_id: number
          record_date: string | null
          tax_record_id: number
          tax_year: number
        }
        Insert: {
          amount_due?: number | null
          val_no?: string | null
          payment_status?: string | null
          property_id: number
          record_date?: string | null
          tax_record_id?: number
          tax_year: number
        }
        Update: {
          amount_due?: number | null
          val_no?: string | null
          payment_status?: string | null
          property_id?: number
          record_date?: string | null
          tax_record_id?: number
          tax_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "tax_records_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["property_id"]
          },
        ]
      }
      user: {
        Row: {
          id: number
          password: string
          username: string
        }
        Insert: {
          id?: number
          password: string
          username: string
        }
        Update: {
          id?: number
          password?: string
          username?: string
        }
        Relationships: []
      }
      owners: {
        Row: {
          id: number
          owner_id: string
          owner_name: string | null
          section: string | null
          lot: string | null
          parcel_id: string | null
          contact_info: string | null
          title_reference: string | null
          term_of_lease: string | null
          date_of_grant: string | null
        }
        Insert: {
          id?: number
          owner_id: string
          owner_name?: string | null
          section?: string | null
          lot?: string | null
          parcel_id?: string | null
          contact_info?: string | null
          title_reference?: string | null
          term_of_lease?: string | null
          date_of_grant?: string | null
        }
        Update: {
          id?: number
          owner_id?: string
          owner_name?: string | null
          section?: string | null
          lot?: string | null
          parcel_id?: string | null
          contact_info?: string | null
          title_reference?: string | null
          term_of_lease?: string | null
          date_of_grant?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_properties_geojson: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_properties_with_details_geojson: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      user_role:
        | "admin"
        | "finance_editor"
        | "planning_editor"
        | "asset_editor"
        | "client_user"
        | "public_viewer"
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
    Enums: {
      user_role: [
        "admin",
        "finance_editor",
        "planning_editor",
        "asset_editor",
        "client_user",
        "public_viewer",
      ],
    },
  },
} as const
