// The Supabase (Postgres) schema the app will use, typed in the shape `supabase gen types typescript`
// produces, so `createClient<SupabaseDatabase>()` types every query. It mirrors
// supabase/migrations/20260925000000_bicos_schema.sql — keep the two in sync (or regenerate this file
// from the real project once it exists).
//
// Tables map to the domain records in models.ts (see services/supabaseMappers.ts):
//   profiles      – one per auth user: side of the marketplace + its worker or company
//   companies     – Company (reviews live in `reviews`)
//   workers       – Worker (reviews live in `reviews`)
//   jobs          – Job; deleted_at replaces Database.deletedJobIds
//   applications  – Application
//   saved_jobs    – Database.savedJobIds (per worker)
//   reviews       – Company.reviews and Worker.reviews
//   worker_posts  – WorkerPost
//   notifications – services/notifications.ts
//   job_boosts    – a paid boost ("Impulsionar vaga"); today only the job's flags change
// The enums reuse the domain types, so the schema and the app can't drift apart silently.
import type { ApplicationStatus, BoostPlanId, DiasKey, NotificationKind, Role, WorkerPost } from './models';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type ReviewDirection = 'para_construtora' | 'para_trabalhador';

export interface SupabaseDatabase {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: Role;
          worker_id: string | null;
          company_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: Role;
          worker_id?: string | null;
          company_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: Role;
          worker_id?: string | null;
          company_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_worker_id_fkey';
            columns: ['worker_id'];
            isOneToOne: true;
            referencedRelation: 'workers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'profiles_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: true;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          }
        ];
      };
      companies: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          cnpj: string | null;
          tipo_obra: string | null;
          location: string;
          whatsapp: string;
          rating: number;
          review_count: number;
          verified: boolean;
          verified_since: string | null;
          since_label: string | null;
          respond_time: string | null;
          paid_count: number | null;
          logo_url: string | null;
          cover_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          name: string;
          cnpj?: string | null;
          tipo_obra?: string | null;
          location: string;
          whatsapp: string;
          rating?: number;
          review_count?: number;
          verified?: boolean;
          verified_since?: string | null;
          since_label?: string | null;
          respond_time?: string | null;
          paid_count?: number | null;
          logo_url?: string | null;
          cover_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string | null;
          name?: string;
          cnpj?: string | null;
          tipo_obra?: string | null;
          location?: string;
          whatsapp?: string;
          rating?: number;
          review_count?: number;
          verified?: boolean;
          verified_since?: string | null;
          since_label?: string | null;
          respond_time?: string | null;
          paid_count?: number | null;
          logo_url?: string | null;
          cover_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      workers: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          initials: string;
          role: string;
          region: string;
          distance: string;
          rating: number;
          jobs_done: number;
          novo: boolean;
          verified: boolean;
          specialties: string[];
          facts: string[];
          cpf: string | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          initials: string;
          role: string;
          region: string;
          distance?: string;
          rating?: number;
          jobs_done?: number;
          novo?: boolean;
          verified?: boolean;
          specialties?: string[];
          facts?: string[];
          cpf?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          initials?: string;
          role?: string;
          region?: string;
          distance?: string;
          rating?: number;
          jobs_done?: number;
          novo?: boolean;
          verified?: boolean;
          specialties?: string[];
          facts?: string[];
          cpf?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          company_id: string;
          role: string;
          pay: number | null;
          location: string;
          address: string;
          distance: string;
          date_label: string | null;
          hours: string | null;
          duration: string;
          dias: DiasKey | null;
          urgent: boolean;
          boosted: boolean;
          photos: string[] | null;
          slots: number;
          closed: boolean;
          sem_contratacao: boolean;
          city: string | null;
          description: string;
          requirements: string[];
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          role: string;
          pay?: number | null;
          location: string;
          address: string;
          distance?: string;
          date_label?: string | null;
          hours?: string | null;
          duration: string;
          dias?: DiasKey | null;
          urgent?: boolean;
          boosted?: boolean;
          photos?: string[] | null;
          slots?: number;
          closed?: boolean;
          sem_contratacao?: boolean;
          city?: string | null;
          description: string;
          requirements?: string[];
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          role?: string;
          pay?: number | null;
          location?: string;
          address?: string;
          distance?: string;
          date_label?: string | null;
          hours?: string | null;
          duration?: string;
          dias?: DiasKey | null;
          urgent?: boolean;
          boosted?: boolean;
          photos?: string[] | null;
          slots?: number;
          closed?: boolean;
          sem_contratacao?: boolean;
          city?: string | null;
          description?: string;
          requirements?: string[];
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'jobs_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          }
        ];
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          worker_id: string;
          status: ApplicationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          worker_id: string;
          status?: ApplicationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          worker_id?: string;
          status?: ApplicationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'applications_job_id_fkey';
            columns: ['job_id'];
            isOneToOne: false;
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'applications_worker_id_fkey';
            columns: ['worker_id'];
            isOneToOne: false;
            referencedRelation: 'workers';
            referencedColumns: ['id'];
          }
        ];
      };
      saved_jobs: {
        Row: {
          worker_id: string;
          job_id: string;
          saved_at: string;
        };
        Insert: {
          worker_id: string;
          job_id: string;
          saved_at?: string;
        };
        Update: {
          worker_id?: string;
          job_id?: string;
          saved_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_jobs_worker_id_fkey';
            columns: ['worker_id'];
            isOneToOne: false;
            referencedRelation: 'workers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'saved_jobs_job_id_fkey';
            columns: ['job_id'];
            isOneToOne: false;
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          }
        ];
      };
      reviews: {
        Row: {
          id: number;
          direction: ReviewDirection;
          company_id: string | null;
          worker_id: string | null;
          job_id: string | null;
          author_label: string;
          value: number;
          text: string;
          date_label: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          direction: ReviewDirection;
          company_id?: string | null;
          worker_id?: string | null;
          job_id?: string | null;
          author_label: string;
          value: number;
          text?: string;
          date_label: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          direction?: ReviewDirection;
          company_id?: string | null;
          worker_id?: string | null;
          job_id?: string | null;
          author_label?: string;
          value?: number;
          text?: string;
          date_label?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_worker_id_fkey';
            columns: ['worker_id'];
            isOneToOne: false;
            referencedRelation: 'workers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_job_id_fkey';
            columns: ['job_id'];
            isOneToOne: false;
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          }
        ];
      };
      worker_posts: {
        Row: {
          id: string;
          worker_id: string;
          media_url: string | null;
          media_type: WorkerPost['mediaType'];
          caption: string;
          posted_on: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          media_url?: string | null;
          media_type?: WorkerPost['mediaType'];
          caption?: string;
          posted_on: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          media_url?: string | null;
          media_type?: WorkerPost['mediaType'];
          caption?: string;
          posted_on?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'worker_posts_worker_id_fkey';
            columns: ['worker_id'];
            isOneToOne: false;
            referencedRelation: 'workers';
            referencedColumns: ['id'];
          }
        ];
      };
      notifications: {
        Row: {
          id: number;
          user_id: string;
          kind: NotificationKind;
          title: string;
          body: string;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          kind: NotificationKind;
          title: string;
          body: string;
          created_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          kind?: NotificationKind;
          title?: string;
          body?: string;
          created_at?: string;
          read_at?: string | null;
        };
        Relationships: [];
      };
      job_boosts: {
        Row: {
          id: number;
          job_id: string;
          plan: BoostPlanId;
          price_cents: number;
          created_at: string;
          ends_at: string;
        };
        Insert: {
          id?: number;
          job_id: string;
          plan: BoostPlanId;
          price_cents: number;
          created_at?: string;
          ends_at: string;
        };
        Update: {
          id?: number;
          job_id?: string;
          plan?: BoostPlanId;
          price_cents?: number;
          created_at?: string;
          ends_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'job_boosts_job_id_fkey';
            columns: ['job_id'];
            isOneToOne: false;
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      app_role: Role;
      dias_semana: DiasKey;
      application_status: ApplicationStatus;
      media_type: WorkerPost['mediaType'];
      review_direction: ReviewDirection;
      notification_kind: NotificationKind;
      boost_plan: BoostPlanId;
    };
    CompositeTypes: { [_ in never]: never };
  };
}

type PublicSchema = SupabaseDatabase['public'];

/** A table's row as a query returns it. */
export type TableRow<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
/** What an insert accepts (defaults and nullable columns may be left out). */
export type TableInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert'];
/** What an update accepts (any subset of columns). */
export type TableUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update'];
export type DbEnum<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];
