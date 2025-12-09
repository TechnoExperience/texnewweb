#!/bin/bash
# Script para verificar que las variables de entorno están configuradas en Vercel

echo "🔍 Verificando variables de entorno en Vercel..."
echo ""

# Verificar si vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado"
    echo "   Instala con: npm i -g vercel"
    exit 1
fi

# Listar variables de entorno
echo "📋 Variables configuradas:"
vercel env ls

echo ""
echo "✅ Variables requeridas:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo ""
echo "💡 Si faltan variables, agrega con:"
echo "   vercel env add VITE_SUPABASE_URL"
echo "   vercel env add VITE_SUPABASE_ANON_KEY"

