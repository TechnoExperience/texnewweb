import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import sourceIdentifierPlugin from 'vite-plugin-source-identifier'

export default defineConfig({
  plugins: [
    react(), 
    sourceIdentifierPlugin({
      enabled: false, // Desactivado para evitar atributos en el HTML
      attributePrefix: 'data-matrix',
      includeProps: false,
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

