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
      projects: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          style_config: StyleConfig | null;
          settings: ProjectSettings | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          style_config?: StyleConfig | null;
          settings?: ProjectSettings | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          style_config?: StyleConfig | null;
          settings?: ProjectSettings | null;
          created_at?: string;
        };
      };
      uploads: {
        Row: {
          id: string;
          project_id: string;
          upload_type: UploadType;
          storage_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          upload_type: UploadType;
          storage_path: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          upload_type?: UploadType;
          storage_path?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          role: string;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: string;
          is_approved?: boolean;
          created_at?: string;
        };
      };
      generated_images: {
        Row: {
          id: string;
          project_id: string;
          image_url: string;
          prompt_used: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          image_url: string;
          prompt_used?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          image_url?: string;
          prompt_used?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

export type UploadType = "product_1" | "product_2" | "reference" | "logo";

export interface StyleConfig {
  selectedStyle: string | null;
  preset: string | null;
  gender: string | null;
  age: string | null;
  generateTab: string | null;
  activePresetTab: string | null;
}

export interface PosterDetails {
  headline: string;
  tagline: string;
  feature1: string;
  feature2: string;
  feature3: string;
  cod: boolean;
  instant: boolean;
  sameday: boolean;
}

export interface ProjectSettings {
  count: number;
  ratio: string;
  density: string;
  posterDetails: boolean;
  details: PosterDetails | null;
  logo: boolean;
  logoPlacement: string | null;
  visualDensity: string;
  additionalIdeas: string;
}
