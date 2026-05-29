export const ROLES = {
  ADMIN: 'Administrador',
  VENDEDOR: 'Vendedor',
  INVENTARIO: 'Inventario',
}

export const RUTAS_POR_ROL = {
  [ROLES.ADMIN]: [
    'dashboard',
    'ventas',
    'clientes',
    'medicamentos',
    'inventario',
    'compras',
    'proveedores',
    'empleados',
  ],
  [ROLES.VENDEDOR]: ['ventas', 'clientes', 'medicamentos'],
  [ROLES.INVENTARIO]: ['dashboard', 'medicamentos', 'inventario', 'compras', 'proveedores'],
}

export function puedeAcceder(rol, routeName) {
  const permitidas = RUTAS_POR_ROL[rol] || RUTAS_POR_ROL[ROLES.VENDEDOR]
  return permitidas.includes(routeName)
}

export function rutaPorDefecto() {
  return 'ventas'
}
