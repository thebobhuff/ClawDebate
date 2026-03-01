export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_type: "agent" | "human" | "admin";
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          agent_api_key: string | null;
          agent_capabilities: Json | null;
          is_claimed: boolean;
          claim_code: string;
          owner_id: string | null;
          verification_status: "pending" | "verified" | "flagged";
          is_banned: boolean;
          ban_reason: string | null;
          banned_at: string | null;
          banned_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_type: "agent" | "human" | "admin";
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          agent_api_key?: string | null;
          agent_capabilities?: Json | null;
          is_claimed?: boolean;
          claim_code?: string;
          owner_id?: string | null;
          verification_status?: "pending" | "verified" | "flagged";
          is_banned?: boolean;
          ban_reason?: string | null;
          banned_at?: string | null;
          banned_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_type?: "agent" | "human" | "admin";
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          agent_api_key?: string | null;
          agent_capabilities?: Json | null;
          is_claimed?: boolean;
          claim_code?: string;
          owner_id?: string | null;
          verification_status?: "pending" | "verified" | "flagged";
          is_banned?: boolean;
          ban_reason?: string | null;
          banned_at?: string | null;
          banned_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      prompts: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          tags: string[];
          status: "draft" | "active" | "archived";
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: string;
          tags?: string[];
          status?: "draft" | "active" | "archived";
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          tags?: string[];
          status?: "draft" | "active" | "archived";
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      debates: {
        Row: {
          id: string;
          prompt_id: string;
          title: string;
          description: string;
          status: "pending" | "active" | "voting" | "completed";
          max_arguments_per_side: number;
          argument_submission_deadline: string | null;
          voting_deadline: string | null;
          winner_side: "for" | "against" | null;
          winner_agent_id: string | null;
          total_votes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          prompt_id: string;
          title: string;
          description: string;
          status?: "pending" | "active" | "voting" | "completed";
          max_arguments_per_side?: number;
          argument_submission_deadline?: string | null;
          voting_deadline?: string | null;
          winner_side?: "for" | "against" | null;
          winner_agent_id?: string | null;
          total_votes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          prompt_id?: string;
          title?: string;
          description?: string;
          status?: "pending" | "active" | "voting" | "completed";
          max_arguments_per_side?: number;
          argument_submission_deadline?: string | null;
          voting_deadline?: string | null;
          winner_side?: "for" | "against" | null;
          winner_agent_id?: string | null;
          total_votes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      debate_participants: {
        Row: {
          id: string;
          debate_id: string;
          agent_id: string;
          side: "for" | "against";
          joined_at: string;
        };
        Insert: {
          id?: string;
          debate_id: string;
          agent_id: string;
          side: "for" | "against";
          joined_at?: string;
        };
        Update: {
          id?: string;
          debate_id?: string;
          agent_id?: string;
          side?: "for" | "against";
          joined_at?: string;
        };
        Relationships: [];
      };
      debate_stages: {
        Row: {
          id: string;
          debate_id: string;
          name: string;
          description: string | null;
          stage_order: number;
          start_at: string | null;
          end_at: string | null;
          status: "pending" | "active" | "completed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          debate_id: string;
          name: string;
          description?: string | null;
          stage_order: number;
          start_at?: string | null;
          end_at?: string | null;
          status?: "pending" | "active" | "completed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          debate_id?: string;
          name?: string;
          description?: string | null;
          stage_order?: number;
          start_at?: string | null;
          end_at?: string | null;
          status?: "pending" | "active" | "completed";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      arguments: {
        Row: {
          id: string;
          debate_id: string;
          agent_id: string;
          side: "for" | "against";
          content: string;
          model: string;
          argument_order: number;
          word_count: number | null;
          stage_id: string | null;
          updated_at: string;
          is_edited: boolean;
          edited_by_admin: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          debate_id: string;
          agent_id: string;
          side: "for" | "against";
          content: string;
          model: string;
          argument_order: number;
          word_count?: number | null;
          stage_id?: string | null;
          updated_at?: string;
          is_edited?: boolean;
          edited_by_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          debate_id?: string;
          agent_id?: string;
          side?: "for" | "against";
          content?: string;
          model?: string;
          argument_order?: number;
          word_count?: number | null;
          stage_id?: string | null;
          updated_at?: string;
          is_edited?: boolean;
          edited_by_admin?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      votes: {
        Row: {
          id: string;
          debate_id: string;
          user_id: string | null;
          session_id: string | null;
          side: "for" | "against";
          voted_at: string;
          ip_address: string | null;
        };
        Insert: {
          id?: string;
          debate_id: string;
          user_id?: string | null;
          session_id?: string | null;
          side: "for" | "against";
          voted_at?: string;
          ip_address?: string | null;
        };
        Update: {
          id?: string;
          debate_id?: string;
          user_id?: string | null;
          session_id?: string | null;
          side?: "for" | "against";
          voted_at?: string;
          ip_address?: string | null;
        };
        Relationships: [];
      };
      debate_stats: {
        Row: {
          id: string;
          debate_id: string;
          for_votes: number;
          against_votes: number;
          total_arguments: number;
          for_arguments: number;
          against_arguments: number;
          unique_viewers: number;
          avg_reading_time_seconds: number | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          debate_id: string;
          for_votes?: number;
          against_votes?: number;
          total_arguments?: number;
          for_arguments?: number;
          against_arguments?: number;
          unique_viewers?: number;
          avg_reading_time_seconds?: number | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          debate_id?: string;
          for_votes?: number;
          against_votes?: number;
          total_arguments?: number;
          for_arguments?: number;
          against_arguments?: number;
          unique_viewers?: number;
          avg_reading_time_seconds?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      agent_performance: {
        Row: {
          id: string;
          agent_id: string;
          total_debates: number;
          wins: number;
          losses: number;
          total_arguments_submitted: number;
          avg_word_count: number | null;
          win_rate: number | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          total_debates?: number;
          wins?: number;
          losses?: number;
          total_arguments_submitted?: number;
          avg_word_count?: number | null;
          win_rate?: number | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          total_debates?: number;
          wins?: number;
          losses?: number;
          total_arguments_submitted?: number;
          avg_word_count?: number | null;
          win_rate?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      verification_challenges: {
        Row: {
          id: string;
          content_type: string;
          content_id: string | null;
          payload: Json | null;
          verification_code: string;
          challenge_text: string;
          answer: string;
          status: "pending" | "verified" | "failed" | "expired";
          expires_at: string;
          created_at: string;
          agent_id: string | null;
        };
        Insert: {
          id?: string;
          content_type: string;
          content_id?: string | null;
          payload?: Json | null;
          verification_code?: string;
          challenge_text: string;
          answer: string;
          status?: "pending" | "verified" | "failed" | "expired";
          expires_at: string;
          created_at?: string;
          agent_id?: string | null;
        };
        Update: {
          id?: string;
          content_type?: string;
          content_id?: string | null;
          payload?: Json | null;
          verification_code?: string;
          challenge_text?: string;
          answer?: string;
          status?: "pending" | "verified" | "failed" | "expired";
          expires_at?: string;
          created_at?: string;
          agent_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
