/**
 * Script de utilidad para reemplazar console.log con logger
 * 
 * USO:
 * Este script ayuda a identificar archivos con console.log que necesitan ser reemplazados.
 * 
 * Para reemplazar manualmente:
 * 1. Buscar: console.log( -> Reemplazar con: logger.debug( o logger.info(
 * 2. Buscar: console.error( -> Reemplazar con: logger.error(
 * 3. Buscar: console.warn( -> Reemplazar con: logger.warn(
 * 
 * IMPORTANTE: Siempre importar logger al inicio del archivo:
 * import { logger } from "@/lib/logger"
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

interface ConsoleUsage {
  file: string
  line: number
  type: 'log' | 'error' | 'warn' | 'info' | 'debug'
  content: string
}

function findConsoleUsage(dir: string, extensions: string[] = ['.ts', '.tsx']): ConsoleUsage[] {
  const results: ConsoleUsage[] = []
  
  function scanDirectory(currentDir: string) {
    const entries = readdirSync(currentDir)
    
    for (const entry of entries) {
      // Skip node_modules, .git, dist, etc.
      if (entry.startsWith('.') || entry === 'node_modules' || entry === 'dist' || entry === 'build') {
        continue
      }
      
      const fullPath = join(currentDir, entry)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath)
      } else if (stat.isFile()) {
        const ext = entry.substring(entry.lastIndexOf('.'))
        if (extensions.includes(ext)) {
          try {
            const content = readFileSync(fullPath, 'utf-8')
            const lines = content.split('\n')
            
            lines.forEach((line, index) => {
              const lineNum = index + 1
              
              // Match console.log, console.error, console.warn, console.info, console.debug
              const consoleMatch = line.match(/console\.(log|error|warn|info|debug)\(/)
              if (consoleMatch) {
                results.push({
                  file: fullPath,
                  line: lineNum,
                  type: consoleMatch[1] as ConsoleUsage['type'],
                  content: line.trim().substring(0, 100) // First 100 chars
                })
              }
            })
          } catch (err) {
            // Skip files that can't be read
          }
        }
      }
    }
  }
  
  scanDirectory(dir)
  return results
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const srcDir = join(process.cwd(), 'src')
  const results = findConsoleUsage(srcDir)
  
  console.log(`\n📊 Encontrados ${results.length} usos de console.* en el código\n`)
  
  // Agrupar por archivo
  const byFile = new Map<string, ConsoleUsage[]>()
  results.forEach(r => {
    if (!byFile.has(r.file)) {
      byFile.set(r.file, [])
    }
    byFile.get(r.file)!.push(r)
  })
  
  // Mostrar resumen
  console.log('Archivos con console.*:\n')
  byFile.forEach((usages, file) => {
    const relPath = file.replace(process.cwd(), '.')
    console.log(`  ${relPath} (${usages.length} usos)`)
    usages.slice(0, 3).forEach(u => {
      console.log(`    L${u.line}: console.${u.type}()`)
    })
    if (usages.length > 3) {
      console.log(`    ... y ${usages.length - 3} más`)
    }
    console.log()
  })
  
  // Estadísticas
  const byType = new Map<string, number>()
  results.forEach(r => {
    byType.set(r.type, (byType.get(r.type) || 0) + 1)
  })
  
  console.log('\n📈 Estadísticas por tipo:')
  byType.forEach((count, type) => {
    console.log(`  console.${type}: ${count}`)
  })
}

export { findConsoleUsage }

