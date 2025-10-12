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
      anime: {
        Row: {
          banner_image: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          id: string
          rating: number | null
          release_year: number | null
          status: string | null
          title: string
          title_arabic: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          banner_image?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          rating?: number | null
          release_year?: number | null
          status?: string | null
          title: string
          title_arabic?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          banner_image?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          rating?: number | null
          release_year?: number | null
          status?: string | null
          title?: string
          title_arabic?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      anime_genres: {
        Row: {
          anime_id: string
          genre_id: string
        }
        Insert: {
          anime_id: string
          genre_id: string
        }
        Update: {
          anime_id?: string
          genre_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anime_genres_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "anime"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anime_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          created_at: string
          duration: number | null
          episode_number: number
          id: string
          season_id: string
          thumbnail: string | null
          title: string
          title_arabic: string | null
        }
        Insert: {
          created_at?: string
          duration?: number | null
          episode_number: number
          id?: string
          season_id: string
          thumbnail?: string | null
          title: string
          title_arabic?: string | null
        }
        Update: {
          created_at?: string
          duration?: number | null
          episode_number?: number
          id?: string
          season_id?: string
          thumbnail?: string | null
          title?: string
          title_arabic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      genres: {
        Row: {
          created_at: string
          id: string
          name: string
          name_arabic: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          name_arabic?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          name_arabic?: string | null
        }
        Relationships: []
      }
      manga: {
        Row: {
          artist: string | null
          author: string | null
          banner_image: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          id: string
          rating: number | null
          release_year: number | null
          status: string | null
          title: string
          title_arabic: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          artist?: string | null
          author?: string | null
          banner_image?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          rating?: number | null
          release_year?: number | null
          status?: string | null
          title: string
          title_arabic?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          artist?: string | null
          author?: string | null
          banner_image?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          rating?: number | null
          release_year?: number | null
          status?: string | null
          title?: string
          title_arabic?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      manga_chapters: {
        Row: {
          chapter_number: number
          created_at: string
          id: string
          manga_id: string
          release_date: string | null
          thumbnail: string | null
          title: string
          title_arabic: string | null
        }
        Insert: {
          chapter_number: number
          created_at?: string
          id?: string
          manga_id: string
          release_date?: string | null
          thumbnail?: string | null
          title: string
          title_arabic?: string | null
        }
        Update: {
          chapter_number?: number
          created_at?: string
          id?: string
          manga_id?: string
          release_date?: string | null
          thumbnail?: string | null
          title?: string
          title_arabic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manga_chapters_manga_id_fkey"
            columns: ["manga_id"]
            isOneToOne: false
            referencedRelation: "manga"
            referencedColumns: ["id"]
          },
        ]
      }
      manga_genres: {
        Row: {
          genre_id: string
          manga_id: string
        }
        Insert: {
          genre_id: string
          manga_id: string
        }
        Update: {
          genre_id?: string
          manga_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manga_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manga_genres_manga_id_fkey"
            columns: ["manga_id"]
            isOneToOne: false
            referencedRelation: "manga"
            referencedColumns: ["id"]
          },
        ]
      }
      manga_pages: {
        Row: {
          chapter_id: string
          created_at: string
          id: string
          image_url: string
          page_number: number
        }
        Insert: {
          chapter_id: string
          created_at?: string
          id?: string
          image_url: string
          page_number: number
        }
        Update: {
          chapter_id?: string
          created_at?: string
          id?: string
          image_url?: string
          page_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "manga_pages_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "manga_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      scraper_sources: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          selectors: Json | null
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          selectors?: Json | null
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          selectors?: Json | null
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          anime_id: string
          created_at: string
          id: string
          season_number: number
          title: string
          title_arabic: string | null
        }
        Insert: {
          anime_id: string
          created_at?: string
          id?: string
          season_number: number
          title: string
          title_arabic?: string | null
        }
        Update: {
          anime_id?: string
          created_at?: string
          id?: string
          season_number?: number
          title?: string
          title_arabic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seasons_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "anime"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_servers: {
        Row: {
          created_at: string
          episode_id: string
          id: string
          quality: string | null
          server_name: string
          video_url: string
        }
        Insert: {
          created_at?: string
          episode_id: string
          id?: string
          quality?: string | null
          server_name: string
          video_url: string
        }
        Update: {
          created_at?: string
          episode_id?: string
          id?: string
          quality?: string | null
          server_name?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_servers_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
