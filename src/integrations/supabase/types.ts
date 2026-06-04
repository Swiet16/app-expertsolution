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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activation_keys: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          key: string
          notes: string | null
          package_id: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          key: string
          notes?: string | null
          package_id: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          key?: string
          notes?: string | null
          package_id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activation_keys_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      earnings: {
        Row: {
          amount: number
          created_at: string
          id: string
          source: string
          status: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          source?: string
          status?: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          source?: string
          status?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fake_reviews: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_visible: boolean | null
          rating: number | null
          reviewer_avatar: string | null
          reviewer_location: string | null
          reviewer_name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_visible?: boolean | null
          rating?: number | null
          reviewer_avatar?: string | null
          reviewer_location?: string | null
          reviewer_name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_visible?: boolean | null
          rating?: number | null
          reviewer_avatar?: string | null
          reviewer_location?: string | null
          reviewer_name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fines: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          currency: string | null
          id: string
          proof_screenshot_url: string | null
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          proof_screenshot_url?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          proof_screenshot_url?: string | null
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      package_purchases: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          currency: string
          id: string
          notes: string | null
          package_id: string
          payer_email: string | null
          payer_name: string | null
          payer_phone: string | null
          payment_method: string
          reviewed_at: string | null
          reviewed_by: string | null
          screenshot_url: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          package_id: string
          payer_email?: string | null
          payer_name?: string | null
          payer_phone?: string | null
          payment_method?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          package_id?: string
          payer_email?: string | null
          payer_name?: string | null
          payer_phone?: string | null
          payment_method?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          is_featured: boolean
          name: string
          price: number
          sort_order: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          price: number
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          price?: number
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      plan_join_requests: {
        Row: {
          country: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          plan_selected: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          plan_selected?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          country?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          plan_selected?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          status: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          status?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          reaction_type?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_featured: boolean
          is_hidden: boolean
          is_locked: boolean
          is_pinned: boolean
          post_type: string
          status: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_hidden?: boolean
          is_locked?: boolean
          is_pinned?: boolean
          post_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_hidden?: boolean
          is_locked?: boolean
          is_pinned?: boolean
          post_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          cnic: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          details_locked_at: string | null
          full_name: string | null
          gender: string | null
          id: string
          phone: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          cnic?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          details_locked_at?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          phone?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          cnic?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          details_locked_at?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          admin_note: string | null
          content: string | null
          created_at: string
          id: string
          image_urls: Json
          rating: number
          reviewee_id: string
          reviewer_id: string
          status: string
          title: string | null
        }
        Insert: {
          admin_note?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_urls?: Json
          rating: number
          reviewee_id: string
          reviewer_id: string
          status?: string
          title?: string | null
        }
        Update: {
          admin_note?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_urls?: Json
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
          status?: string
          title?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      site_stats: {
        Row: {
          active_clients: number | null
          active_members: number | null
          id: boolean
          paid_out: number | null
          tasks_done: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active_clients?: number | null
          active_members?: number | null
          id?: boolean
          paid_out?: number | null
          tasks_done?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active_clients?: number | null
          active_members?: number | null
          id?: boolean
          paid_out?: number | null
          tasks_done?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      task_schedules: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          id: string
          reward: number
          scheduled_date: string
          status: string
          task_id: string | null
          template_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          reward?: number
          scheduled_date: string
          status?: string
          task_id?: string | null
          template_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          reward?: number
          scheduled_date?: string
          status?: string
          task_id?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_templates: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          id: string
          instructions: string | null
          is_active: boolean
          kind: string
          min_watch_seconds: number
          participants_target: number
          resource_url: string | null
          reward: number
          task_type: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_links: Json
          video_url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          kind?: string
          min_watch_seconds?: number
          participants_target?: number
          resource_url?: string | null
          reward?: number
          task_type?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_links?: Json
          video_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          kind?: string
          min_watch_seconds?: number
          participants_target?: number
          resource_url?: string | null
          reward?: number
          task_type?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_links?: Json
          video_url?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          auto_approve: boolean
          category: string | null
          created_at: string
          created_by: string | null
          currency: string
          daily_limit: number | null
          description: string
          due_at: string | null
          id: string
          instructions: string | null
          is_open: boolean
          is_paused: boolean
          is_public: boolean
          participants_target: number
          proof_files: Json
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reward: number
          status: Database["public"]["Enums"]["task_status"]
          submission_text: string | null
          submission_url: string | null
          submitted_at: string | null
          task_type: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_links: Json
        }
        Insert: {
          assigned_to?: string | null
          auto_approve?: boolean
          category?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          daily_limit?: number | null
          description: string
          due_at?: string | null
          id?: string
          instructions?: string | null
          is_open?: boolean
          is_paused?: boolean
          is_public?: boolean
          participants_target?: number
          proof_files?: Json
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reward: number
          status?: Database["public"]["Enums"]["task_status"]
          submission_text?: string | null
          submission_url?: string | null
          submitted_at?: string | null
          task_type?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_links?: Json
        }
        Update: {
          assigned_to?: string | null
          auto_approve?: boolean
          category?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          daily_limit?: number | null
          description?: string
          due_at?: string | null
          id?: string
          instructions?: string | null
          is_open?: boolean
          is_paused?: boolean
          is_public?: boolean
          participants_target?: number
          proof_files?: Json
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reward?: number
          status?: Database["public"]["Enums"]["task_status"]
          submission_text?: string | null
          submission_url?: string | null
          submitted_at?: string | null
          task_type?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_links?: Json
        }
        Relationships: []
      }
      template_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          template_id: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          template_id: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          template_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_bans: {
        Row: {
          admin_message: string | null
          ban_type: string
          banned_until: string | null
          contact_info: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          lifted_at: string | null
          lifted_by: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          admin_message?: string | null
          ban_type?: string
          banned_until?: string | null
          contact_info?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          lifted_at?: string | null
          lifted_by?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          admin_message?: string | null
          ban_type?: string
          banned_until?: string | null
          contact_info?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          lifted_at?: string | null
          lifted_by?: string | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
      video_watch_logs: {
        Row: {
          id: string
          task_id: string
          user_id: string
          video_url: string
          watched_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          video_url: string
          watched_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          video_url?: string
          watched_at?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          available_balance: number
          currency: string
          pending_balance: number
          total_earned: number
          total_withdrawn: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number
          currency?: string
          pending_balance?: number
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number
          currency?: string
          pending_balance?: number
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          details: Json
          id: string
          method: string
          paid_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          details?: Json
          id?: string
          method: string
          paid_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          details?: Json
          id?: string
          method?: string
          paid_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_review: {
        Args: { _approve: boolean; _note?: string; _review_id: string }
        Returns: Json
      }
      approve_review_submission: {
        Args: { _approve: boolean; _review_id: string }
        Returns: Json
      }
      ban_user: {
        Args: {
          _contact?: string
          _message?: string
          _reason?: string
          _type?: string
          _until?: string
          _user_id: string
        }
        Returns: Json
      }
      bulk_assign_task: {
        Args: {
          _auto_approve?: boolean
          _currency?: string
          _description?: string
          _instructions?: string
          _reward?: number
          _task_type?: string
          _thumbnail_url?: string
          _title: string
          _user_ids?: string[]
          _video_links?: string[]
        }
        Returns: Json
      }
      claim_open_task: { Args: { _task_id: string }; Returns: Json }
      clone_task: {
        Args: { _new_assigned_to?: string; _task_id: string }
        Returns: Json
      }
      create_client_task: {
        Args: {
          _currency?: string
          _description?: string
          _instructions?: string
          _participants_target?: number
          _reward?: number
          _task_type?: string
          _thumbnail_url?: string
          _title: string
          _video_links?: string[]
        }
        Returns: Json
      }
      create_fine: {
        Args: {
          _amount: number
          _currency?: string
          _reason?: string
          _user_id: string
        }
        Returns: Json
      }
      generate_activation_keys: {
        Args: { _count: number; _notes?: string; _package_id: string }
        Returns: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          key: string
          notes: string | null
          package_id: string
          used_at: string | null
          used_by: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "activation_keys"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_admin_stats: { Args: never; Returns: Json }
      get_admin_user_list: { Args: never; Returns: Json }
      get_live_task_stats: { Args: never; Returns: Json }
      get_my_ban_status: { Args: never; Returns: Json }
      get_my_roles: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      get_open_tasks: { Args: never; Returns: Json }
      get_public_stats: { Args: never; Returns: Json }
      get_review_queue: { Args: never; Returns: Json }
      get_superadmin_stats: { Args: never; Returns: Json }
      get_users_for_assignment: {
        Args: { _country?: string; _limit?: number; _role?: string }
        Returns: Json
      }
      get_video_watch_progress: { Args: { _task_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lift_ban: { Args: { _user_id: string }; Returns: Json }
      log_video_watch: {
        Args: { _task_id: string; _video_url: string }
        Returns: Json
      }
      moderate_comment: {
        Args: { _action: string; _comment_id: string }
        Returns: Json
      }
      moderate_post: {
        Args: { _action: string; _post_id: string; _value?: string }
        Returns: Json
      }
      process_withdrawal: {
        Args: { _approve: boolean; _note?: string; _withdrawal_id: string }
        Returns: Json
      }
      redeem_activation_key: { Args: { _key: string }; Returns: Json }
      request_withdrawal: {
        Args: { _amount: number; _details: Json; _method: string }
        Returns: Json
      }
      review_fine_payment: {
        Args: { _approve: boolean; _fine_id: string }
        Returns: Json
      }
      review_package_purchase: {
        Args: { _approve: boolean; _id: string; _note?: string }
        Returns: Json
      }
      review_task: {
        Args: { _approve: boolean; _reason?: string; _task_id: string }
        Returns: Json
      }
      set_user_role: {
        Args: {
          _enabled: boolean
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: Json
      }
      submit_fine_proof: {
        Args: { _fine_id: string; _screenshot_url: string }
        Returns: Json
      }
      submit_task: {
        Args: { _task_id: string; _text: string; _url: string }
        Returns: Json
      }
      submit_task_v2: {
        Args: {
          _proof_files?: string[]
          _task_id: string
          _text?: string
          _url?: string
        }
        Returns: Json
      }
      toggle_task_pause: {
        Args: { _paused: boolean; _task_id: string }
        Returns: Json
      }
      update_package_full: {
        Args: {
          _currency?: string
          _description?: string
          _features?: string[]
          _id: string
          _is_active?: boolean
          _is_featured?: boolean
          _name: string
          _price?: number
          _sort_order?: number
          _tagline?: string
        }
        Returns: Json
      }
      update_plan_join_request: {
        Args: { _request_id: string; _status: string }
        Returns: Json
      }
      update_site_setting: {
        Args: { _key: string; _value: string }
        Returns: Json
      }
      update_site_stats: {
        Args: {
          _active_clients: number
          _active_members: number
          _paid_out: number
          _tasks_done: number
        }
        Returns: Json
      }
      update_withdrawal_status: {
        Args: {
          _id: string
          _note?: string
          _status: Database["public"]["Enums"]["withdrawal_status"]
        }
        Returns: Json
      }
      upsert_fake_review: {
        Args: {
          _avatar?: string
          _content?: string
          _id?: string
          _location?: string
          _name?: string
          _order?: number
          _rating?: number
          _visible?: boolean
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "user" | "client" | "admin" | "super_admin"
      task_status:
        | "assigned"
        | "submitted"
        | "approved"
        | "rejected"
        | "cancelled"
      withdrawal_status: "pending" | "approved" | "rejected" | "paid"
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
      app_role: ["user", "client", "admin", "super_admin"],
      task_status: [
        "assigned",
        "submitted",
        "approved",
        "rejected",
        "cancelled",
      ],
      withdrawal_status: ["pending", "approved", "rejected", "paid"],
    },
  },
} as const
