// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://spyiwrexvoriwbdikjiw.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNweWl3cmV4dm9yaXdiZGlraml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NzY0NDEsImV4cCI6MjA1OTE1MjQ0MX0.8AvOWvqSKKkRf6ijTLlMPQLQmKGh_JC3P0womr-s3hQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);