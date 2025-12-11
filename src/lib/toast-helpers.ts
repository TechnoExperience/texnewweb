/**
 * Helpers para mostrar toasts de forma consistente
 * Reemplaza alert() y confirm() con toasts modernos
 */

import { toast } from "sonner"

/**
 * Muestra un error con toast
 */
export function showError(message: string, description?: string) {
  toast.error(message, {
    description,
    duration: 5000,
  })
}

/**
 * Muestra un éxito con toast
 */
export function showSuccess(message: string, description?: string) {
  toast.success(message, {
    description,
    duration: 3000,
  })
}

/**
 * Muestra información con toast
 */
export function showInfo(message: string, description?: string) {
  toast.info(message, {
    description,
    duration: 4000,
  })
}

/**
 * Muestra una advertencia con toast
 */
export function showWarning(message: string, description?: string) {
  toast.warning(message, {
    description,
    duration: 4000,
  })
}

