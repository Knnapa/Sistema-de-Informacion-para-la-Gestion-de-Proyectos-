// Iconos propios en SVG (formas simples, sin depender de ninguna libreria
// de iconos). Cada uno recibe className/size como cualquier componente.

function IconBase({ children, className = 'icon', size = 20 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function IconGrid(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </IconBase>
  );
}

export function IconShieldCheck(props) {
  return (
    <IconBase {...props}>
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
      <polyline points="9 12 11 14 15 10" />
    </IconBase>
  );
}

export function IconBriefcase(props) {
  return (
    <IconBase {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </IconBase>
  );
}

export function IconUsers(props) {
  return (
    <IconBase {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
      <circle cx="17.5" cy="9.5" r="2.6" />
      <path d="M15.5 14.3c2.6.4 4.5 2.6 4.5 5.7" />
    </IconBase>
  );
}

export function IconFileText(props) {
  return (
    <IconBase {...props}>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </IconBase>
  );
}

export function IconActivity(props) {
  return (
    <IconBase {...props}>
      <polyline points="3 12 7 12 9 6 13 18 15 12 21 12" />
    </IconBase>
  );
}

export function IconBookOpen(props) {
  return (
    <IconBase {...props}>
      <path d="M3 5a2 2 0 0 1 2-2h5v18H5a2 2 0 0 1-2-2V5z" />
      <path d="M21 5a2 2 0 0 0-2-2h-5v18h5a2 2 0 0 0 2-2V5z" />
    </IconBase>
  );
}

export function IconLogOut(props) {
  return (
    <IconBase {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </IconBase>
  );
}

export function IconPanelLeft(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="9.5" y1="4" x2="9.5" y2="20" />
    </IconBase>
  );
}

export function IconPlus(props) {
  return (
    <IconBase {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </IconBase>
  );
}

export function IconEdit(props) {
  return (
    <IconBase {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4.5 1.2L4.7 14.5 16.5 3.5z" />
    </IconBase>
  );
}

export function IconKey(props) {
  return (
    <IconBase {...props}>
      <circle cx="7.5" cy="15.5" r="4" />
      <path d="M10.8 12.2 20 3" />
      <path d="M16 7l2.5 2.5" />
    </IconBase>
  );
}

export function IconUserX(props) {
  return (
    <IconBase {...props}>
      <path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="17" y1="8" x2="22" y2="13" />
      <line x1="22" y1="8" x2="17" y2="13" />
    </IconBase>
  );
}

export function IconUserCheck(props) {
  return (
    <IconBase {...props}>
      <path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="16 11.5 18 13.5 22 9.5" />
    </IconBase>
  );
}

export function IconX(props) {
  return (
    <IconBase {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </IconBase>
  );
}

export function IconTrash(props) {
  return (
    <IconBase {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </IconBase>
  );
}

export function IconUpload(props) {
  return (
    <IconBase {...props}>
      <path d="M12 16V4" />
      <path d="M6 10l6-6 6 6" />
      <path d="M4 18v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </IconBase>
  );
}

export function IconDownload(props) {
  return (
    <IconBase {...props}>
      <path d="M12 4v12" />
      <path d="M6 10l6 6 6-6" />
      <path d="M4 18v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </IconBase>
  );
}

export function IconListDropdown(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="7" width="18" height="10" rx="2.5" />
      <polyline points="8.2 10.5 10.7 13 13.2 10.5" />
    </IconBase>
  );
}

export function IconCheckSquare(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="6" height="6" rx="1.3" />
      <polyline points="4.3 7 5.3 8 7.7 5.6" />
      <rect x="3" y="14" width="6" height="6" rx="1.3" />
      <polyline points="4.3 17 5.3 18 7.7 15.6" />
      <line x1="12" y1="7" x2="21" y2="7" />
      <line x1="12" y1="17" x2="21" y2="17" />
    </IconBase>
  );
}

export function IconArrowLeft(props) {
  return (
    <IconBase {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </IconBase>
  );
}

export function IconSearch(props) {
  return (
    <IconBase {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="20" y1="20" x2="15.3" y2="15.3" />
    </IconBase>
  );
}

export function IconLink(props) {
  return (
    <IconBase {...props}>
      <path d="M9 15l6-6" />
      <path d="M8.5 11.5 6.4 13.6a3.5 3.5 0 0 0 5 5l2.1-2.1" />
      <path d="M15.5 12.5l2.1-2.1a3.5 3.5 0 0 0-5-5l-2.1 2.1" />
    </IconBase>
  );
}

export function IconEye(props) {
  return (
    <IconBase {...props}>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </IconBase>
  );
}

export function IconGraduationCap(props) {
  return (
    <IconBase {...props}>
      <path d="M2 9l10-5 10 5-10 5-10-5z" />
      <path d="M6 11.5V17c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" />
      <path d="M22 9v6" />
    </IconBase>
  );
}

export function IconPresentation(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
      <path d="M6.5 13l3-3.5 2 2 4.5-4.5" />
    </IconBase>
  );
}

export function IconPlayCircle(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <polygon points="10 8.3 16 12 10 15.7 10 8.3" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

// Logo de la app: tablero/cronograma (clipboard con barras tipo gantt) +
// un engranaje superpuesto en la esquina, para el cuadro azul de la barra
// lateral (ver Sidebar.jsx).
export function IconGestionProyectos(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3.5" width="13" height="17" rx="2" />
      <rect x="7.5" y="2" width="4" height="3" rx="1" />
      <line x1="6" y1="9.5" x2="13" y2="9.5" />
      <line x1="6" y1="12.7" x2="11.2" y2="12.7" />
      <line x1="6" y1="15.9" x2="9.4" y2="15.9" />
      <g transform="translate(14.5,14.5) scale(0.42)">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </g>
    </IconBase>
  );
}
