import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zdjjgorcmikhfyxcdmyo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkampnb3JjbWlraGZ5eGNkbXlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDEzMjEsImV4cCI6MjA3OTQ3NzMyMX0.B2XwYttP6Xh3R9MiSpug-UIH0RhKpWLYEupJmro7Low";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
