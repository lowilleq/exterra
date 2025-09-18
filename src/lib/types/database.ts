export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          price: number
          description: string | null
          image_url: string | null
          status: 'available' | 'sold'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          description?: string | null
          image_url?: string | null
          status?: 'available' | 'sold'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          description?: string | null
          image_url?: string | null
          status?: 'available' | 'sold'
          created_at?: string
        }
      }
      scans: {
        Row: {
          id: string
          email: string
          product_id: string
          scanned_at: string
          locale: string | null
        }
        Insert: {
          id?: string
          email: string
          product_id: string
          scanned_at?: string
          locale?: string | null
        }
        Update: {
          id?: string
          email?: string
          product_id?: string
          scanned_at?: string
          locale?: string | null
        }
      }
    }
  }
}

export type Product = Database['public']['Tables']['products']['Row']
export type Scan = Database['public']['Tables']['scans']['Row']