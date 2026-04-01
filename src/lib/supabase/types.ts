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
          email: string
          full_name: string | null
          plan: 'free' | 'pro' | 'agency'
          audits_used_this_month: number
          audits_limit: number
          billing_provider: 'stripe' | 'razorpay' | null
          stripe_customer_id: string | null
          razorpay_customer_id: string | null
          subscription_id: string | null
          subscription_status: 'active' | 'canceled' | 'past_due' | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          plan?: 'free' | 'pro' | 'agency'
          audits_used_this_month?: number
          audits_limit?: number
          billing_provider?: 'stripe' | 'razorpay' | null
          stripe_customer_id?: string | null
          razorpay_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: 'active' | 'canceled' | 'past_due' | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          plan?: 'free' | 'pro' | 'agency'
          audits_used_this_month?: number
          audits_limit?: number
          billing_provider?: 'stripe' | 'razorpay' | null
          stripe_customer_id?: string | null
          razorpay_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: 'active' | 'canceled' | 'past_due' | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sites: {
        Row: {
          id: string
          user_id: string
          domain: string
          name: string | null
          avg_score: number | null
          page_count: number
          last_audited_at: string | null
          monitoring_enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          domain: string
          name?: string | null
          avg_score?: number | null
          page_count?: number
          last_audited_at?: string | null
          monitoring_enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          domain?: string
          name?: string | null
          avg_score?: number | null
          page_count?: number
          last_audited_at?: string | null
          monitoring_enabled?: boolean
          created_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          site_id: string
          url: string
          page_type: string
          classification_confidence: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          url: string
          page_type: string
          classification_confidence?: number | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          url?: string
          page_type?: string
          classification_confidence?: number | null
          is_active?: boolean
          created_at?: string
        }
      }
      audits: {
        Row: {
          id: string
          page_id: string
          user_id: string
          status: 'pending' | 'crawling' | 'auditing' | 'optimizing' | 'complete' | 'failed'
          score: number | null
          pass_count: number | null
          fail_count: number | null
          unable_count: number | null
          total_items: number | null
          performance_score: number | null
          accessibility_score: number | null
          mobile_friendly: boolean | null
          core_web_vitals: Json | null
          audit_results: Json | null
          quick_wins: Json | null
          suggestions: Json | null
          html_report: string | null
          model_used_audit: string | null
          model_used_optimize: string | null
          score_change: number | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          page_id: string
          user_id: string
          status?: 'pending' | 'crawling' | 'auditing' | 'optimizing' | 'complete' | 'failed'
          score?: number | null
          pass_count?: number | null
          fail_count?: number | null
          unable_count?: number | null
          total_items?: number | null
          performance_score?: number | null
          accessibility_score?: number | null
          mobile_friendly?: boolean | null
          core_web_vitals?: Json | null
          audit_results?: Json | null
          quick_wins?: Json | null
          suggestions?: Json | null
          html_report?: string | null
          model_used_audit?: string | null
          model_used_optimize?: string | null
          score_change?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          page_id?: string
          user_id?: string
          status?: 'pending' | 'crawling' | 'auditing' | 'optimizing' | 'complete' | 'failed'
          score?: number | null
          pass_count?: number | null
          fail_count?: number | null
          unable_count?: number | null
          total_items?: number | null
          performance_score?: number | null
          accessibility_score?: number | null
          mobile_friendly?: boolean | null
          core_web_vitals?: Json | null
          audit_results?: Json | null
          quick_wins?: Json | null
          suggestions?: Json | null
          html_report?: string | null
          model_used_audit?: string | null
          model_used_optimize?: string | null
          score_change?: number | null
          created_at?: string
          completed_at?: string | null
        }
      }
      crawl_results: {
        Row: {
          id: string
          site_id: string
          discovered_pages: Json
          status: 'pending' | 'crawling' | 'complete' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          discovered_pages: Json
          status?: 'pending' | 'crawling' | 'complete' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          discovered_pages?: Json
          status?: 'pending' | 'crawling' | 'complete' | 'failed'
          created_at?: string
        }
      }
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Site = Database['public']['Tables']['sites']['Row']
export type Page = Database['public']['Tables']['pages']['Row']
export type Audit = Database['public']['Tables']['audits']['Row']
export type CrawlResult = Database['public']['Tables']['crawl_results']['Row']
