// Tipos de documento de identidad (coinciden con el enum del backend).
export const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'Cédula de ciudadanía' },
  { value: 'TI', label: 'Tarjeta de identidad' },
  { value: 'CE', label: 'Cédula de extranjería' },
  { value: 'PA', label: 'Pasaporte' },
  { value: 'RC', label: 'Registro civil' },
];

export function tipoDocumentoLabel(value) {
  return TIPOS_DOCUMENTO.find((t) => t.value === value)?.label || value;
}
