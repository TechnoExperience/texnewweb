// Configuración de pnpm para aprobar scripts de compilación
// Este archivo permite que pnpm ejecute scripts de build necesarios

function readPackage(pkg, context) {
  // Aprobar scripts para dependencias que necesitan compilarse
  const allowedScripts = [
    '@parcel/watcher',
    '@tailwindcss/oxide',
    'esbuild',
    'sharp'
  ]
  
  if (allowedScripts.includes(pkg.name)) {
    // Permitir que estas dependencias ejecuten sus scripts
    if (pkg.scripts) {
      context.log(`✅ Aprobando scripts para: ${pkg.name}`)
    }
  }
  
  return pkg
}

module.exports = {
  hooks: {
    readPackage
  }
}

