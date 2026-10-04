// Catalogo central de modulos de la barra lateral: icono, ruta y que
// roles lo ven. La Sidebar y las rutas de App.jsx se alimentan de aqui,
// asi que agregar/ocultar un modulo por rol se hace en un solo lugar.
//
// allowedRoles ausente = visible para cualquier usuario autenticado.
// disponible:false = el modulo todavia no tiene pantalla construida
// (se muestra en la barra lateral pero no es clickeable todavia).
import {
  IconGrid,
  IconShieldCheck,
  IconBriefcase,
  IconUsers,
  IconFileText,
  IconActivity,
  IconBookOpen,
} from '../components/icons/Icons';

export const MODULES = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: IconGrid },
  {
    id: 'administracion',
    label: 'Administración',
    path: '/usuarios',
    icon: IconShieldCheck,
    allowedRoles: ['administrador'],
  },
  {
    id: 'proyectos',
    label: 'Proyectos',
    path: '/proyectos',
    icon: IconBriefcase,
  },
  {
    id: 'participantes',
    label: 'Participantes',
    path: '/participantes',
    icon: IconUsers,
    allowedRoles: ['administrador', 'lider'],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    path: '/reportes',
    icon: IconFileText,
    allowedRoles: ['administrador', 'lider'],
  },
  {
    id: 'indicadores',
    label: 'Indicadores',
    path: '/indicadores',
    icon: IconActivity,
    allowedRoles: ['administrador', 'lider'],
  },
  {
    id: 'induccion',
    label: 'Inducción',
    path: '/induccion',
    icon: IconBookOpen,
  },
];

export function modulosVisiblesPara(rol) {
  return MODULES.filter((m) => !m.allowedRoles || m.allowedRoles.includes(rol));
}
