# 🚀 Guía Rápida: Lighthouse Audit

## Comando para ejecutar Lighthouse desde terminal

### Requisitos previos
```bash
npm install -g @lhci/cli
```

### Ejecutar audit
```bash
lhci autorun --url=https://techno-experience-fbaaisrec-technoexperiences-projects.vercel.app
```

### O desde el navegador (Chrome)
1. Abre Chrome
2. F12 → Lighthouse tab
3. Selecciona "Performance"
4. Click "Generate report"
5. Revisa las métricas

## Métricas esperadas (después de optimizaciones)

| Métrica | Objetivo | Bueno |
|---------|----------|-------|
| Performance Score | > 80 | > 90 |
| FCP | < 1.8s | < 1.0s |
| LCP | < 2.5s | < 2.0s |
| TTI | < 3.8s | < 3.0s |
| CLS | < 0.1 | < 0.05 |
| TBT | < 200ms | < 150ms |

## Qué revisar en el reporte

1. **Performance**
   - First Contentful Paint
   - Largest Contentful Paint
   - Time to Interactive
   - Total Blocking Time
   - Cumulative Layout Shift

2. **Oportunidades**
   - Serve images in next-gen formats
   - Remove unused JavaScript
   - Reduce render-blocking resources
   - Preload key requests

3. **Diagnósticos**
   - Avoid large layout shifts
   - Minimize main-thread work
   - Reduce JavaScript execution time

## Interpretación

- 🟢 Verde (> 90): Excelente
- 🟡 Amarillo (50-90): Necesita mejoras
- 🔴 Rojo (< 50): Requiere atención urgente

