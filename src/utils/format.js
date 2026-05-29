export function formatQuetzales(value) {
  const num = Number(value) || 0
  return `Q ${num.toFixed(2)}`
}

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStockStatus(stockActual, stockMinimo) {
  const actual = Number(stockActual) || 0
  const minimo = Number(stockMinimo) || 0
  if (actual <= 0 || actual < minimo * 0.5) return 'critico'
  if (actual < minimo) return 'bajo'
  return 'ok'
}

export function stockBadgeClass(status) {
  const map = {
    ok: 'bg-emerald-100 text-emerald-800',
    bajo: 'bg-amber-100 text-amber-800',
    critico: 'bg-red-100 text-red-800',
  }
  return map[status] || map.ok
}

export function stockLabel(status) {
  const map = {
    ok: 'OK',
    bajo: 'Bajo',
    critico: 'Crítico',
  }
  return map[status] || 'OK'
}
