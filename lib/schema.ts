export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          biography: string | null;
          display_name: string;
          email: string;
          id: string;
        };
        Insert: {
          biography?: string | null;
          display_name: string;
          email: string;
          id: string;
        };
        Update: {
          biography?: string | null;
          display_name?: string;
          email?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      species: {
        Row: {
          author: string;
          common_name: string | null;
          description: string | null;
          id: number;
          image: string | null;
          kingdom: Database["public"]["Enums"]["kingdom"];
          scientific_name: string;
          total_population: number | null;
        };
        Insert: {
          author: string;
          common_name?: string | null;
          description?: string | null;
          id?: number;
          image?: string | null;
          kingdom: Database["public"]["Enums"]["kingdom"];
          scientific_name: string;
          total_population?: number | null;
        };
        Update: {
          author?: string;
          common_name?: string | null;
          description?: string | null;
          id?: number;
          image?: string | null;
          kingdom?: Database["public"]["Enums"]["kingdom"];
          scientific_name?: string;
          total_population?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "species_author_fkey";
            columns: ["author"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          id: number; // Primary key
          species_id: number; // Foreign key referencing the species table
          user_id: string; // Foreign key referencing the profiles table
          comment: string; // The text of the comment
          created_at: string; // Timestamp when the comment was created
        };
        Insert: {
          species_id: number; // Required to relate the comment to a species
          user_id: string; // Required to associate the comment with a user
          comment: string; // The text of the comment
          created_at?: string; // Optional, defaults to NOW() in Supabase
        };
        Update: {
          id?: number; // Optional for updates, as it is immutable
          species_id?: number; 
          user_id?: string; 
          comment?: string; 
          created_at?: string; 
        };
        Relationships: [
          {
            foreignKeyName: "comments_species_id_fkey";
            columns: ["species_id"];
            referencedRelation: "species";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      kingdom:
        | "Animalia"
        | "Plantae"
        | "Fungi"
        | "Protista"
        | "Archaea"
        | "Bacteria";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
