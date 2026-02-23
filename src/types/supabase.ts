export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_type: 'agent' | 'human' | 'admin'
          display_name: string
          avatar_url: string | null
          bio: string | null
          agent_api_key: string | null
          agent_capabilities: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_type: 'agent' | 'human' | 'admin'
          display_name: string
          avatar_url?: string | null
          bio?: string | null
          agent_api_key?: string | null
          agent_capabilities?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_type?: 'agent' | 'human' | 'admin'
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          agent_api_key?: string | null
          agent_capabilities?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      prompts: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          tags: string[]
          status: 'draft' | 'active' | 'archived'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          tags?: string[]
          status?: 'draft' | 'active' | 'archived'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          tags?: string[]
          status?: 'draft' | 'active' | 'archived'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      debates: {
        Row: {
          id: string
          prompt_id: string
          title: string
          description: string
          status: 'pending' | 'active' | 'voting' | 'completed'
          max_arguments_per_side: number
          argument_submission_deadline: string | null
          voting_deadline: string | null
          winner_side: 'for' | 'against' | null
          winner_agent_id: string | null
          total_votes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          title: string
          description: string
          status?: 'pending' | 'active' | 'voting' | 'completed'
          max_arguments_per_side?: number
          argument_submission_deadline?: string | null
          voting_deadline?: string | null
          winner_side?: 'for' | 'against' | null
          winner_agent_id?: string | null
          total_votes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          title?: string
          description?: string
          status?: 'pending' | 'active' | 'voting' | 'completed'
          max_arguments_per_side?: number
          argument_submission_deadline?: string | null
          voting_deadline?: string | null
          winner_side?: 'for' | 'against' | null
          winner_agent_id?: string | null
          total_votes?: number
          created_at?: string
          updated_at?: string
        }
      }
      debate_participants: {
        Row: {
          id: string
          debate_id: string
          agent_id: string
          side: 'for' | 'against'
          joined_at: string
        }
        Insert: {
          id?: string
          debate_id: string
          agent_id: string
          side: 'for' | 'against'
          joined_at?: string
        }
        Update: {
          id?: string
          debate_id?: string
          agent_id?: string
          side?: 'for' | 'against'
          joined_at?: string
        }
      }
      arguments: {
        Row: {
          id: string
          debate_id: string
          agent_id: string
          side: 'for' | 'against'
          content: string
          argument_order: number
          word_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          debate_id: string
          agent_id: string
          side: 'for' | 'against'
          content: string
          argument_order: number
          word_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          debate_id?: string
          agent_id?: string
          side?: 'for' | 'against'
          content?: string
          argument_order?: number
          word_count?: number | null
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          debate_id: string
          user_id: string | null
          session_id: string | null
          side: 'for' | 'against'
          voted_at: string
          ip_address: string | null
        }
        Insert: {
          id?: string
          debate_id: string
          user_id?: string | null
          session_id?: string | null
          side: 'for' | 'against'
          voted_at?: string
          ip_address?: string | null
        }
        Update: {
          id?: string
          debate_id?: string
          user_id?: string | null
          session_id?: string | null
          side?: 'for' | 'against'
          voted_at?: string
          ip_address?: string | null
        }
      }
      debate_stats: {
        Row: {
          id: string
          debate_id: string
          for_votes: number
          against_votes: number
          total_arguments: number
          for_arguments: number
          against_arguments: number
          unique_viewers: number
          avg_reading_time_seconds: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          debate_id: string
          for_votes?: number
          against_votes?: number
          total_arguments?: number
          for_arguments?: number
          against_arguments?: number
          unique_viewers?: number
          avg_reading_time_seconds?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          debate_id?: string
          for_votes?: number
          against_votes?: number
          total_arguments?: number
          for_arguments?: number
          against_arguments?: number
          unique_viewers?: number
          avg_reading_time_seconds?: number | null
          updated_at?: string
        }
      }
      agent_performance: {
        Row: {
          id: string
          agent_id: string
          total_debates: number
          wins: number
          losses: number
          total_arguments_submitted: number
          avg_word_count: number | null
          win_rate: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          total_debates?: number
          wins?: number
          losses?: number
          total_arguments_submitted?: number
          avg_word_count?: number | null
          win_rate?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          total_debates?: number
          wins?: number
          losses?: number
          total_arguments_submitted?: number
          avg_word_count?: number | null
          win_rate?: number | null
          updated_at?: string
        }
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
  }
}
