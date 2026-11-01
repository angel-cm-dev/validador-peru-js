export type TipoRuc = 'persona-natural' | 'persona-juridica' | 'no-domiciliado';
export type TipoPlaca = 'vehiculo' | 'moto';
export type TipoDocumento = 'ruc' | 'dni' | 'ce' | 'celular' | 'placa';

/** Elimina espacios, guiones y puntos; convierte a mayúsculas. */
export function normalizar(valor: unknown): string;

/** Calcula el dígito verificador (módulo 11) de los 10 primeros dígitos de un RUC. */
export function calcularDigitoRuc(base10: string): number;
/** Valida longitud, prefijo (10, 15, 17, 20) y dígito verificador del RUC. */
export function validarRuc(ruc: unknown): boolean;
/** Tipo de contribuyente o `null` si el RUC es inválido. */
export function tipoRuc(ruc: unknown): TipoRuc | null;
/** Devuelve el RUC normalizado; lanza `RangeError` si es inválido. */
export function formatearRuc(ruc: unknown): string;

/** Valida un DNI (8 dígitos). */
export function validarDni(dni: unknown): boolean;
/** Devuelve el DNI normalizado; lanza `RangeError` si es inválido. */
export function formatearDni(dni: unknown): string;

/** Valida un Carné de Extranjería (9 dígitos; alfanumérico 8-12 si `estricto: false`). */
export function validarCe(ce: unknown, opciones?: { estricto?: boolean }): boolean;

/** Valida un celular peruano (9 dígitos iniciando en 9, con o sin +51). */
export function validarCelular(telefono: unknown): boolean;
/** Formatea como "987 654 321" o "+51 987 654 321". */
export function formatearCelular(telefono: unknown, opciones?: { internacional?: boolean }): string;
/** Formato E.164: "+51987654321". */
export function celularE164(telefono: unknown): string;

/** Tipo de placa o `null` si es inválida. */
export function tipoPlaca(placa: unknown): TipoPlaca | null;
/** Valida una placa vehicular o de moto. */
export function validarPlaca(placa: unknown): boolean;
/** Formatea como "ABC-123" o "1234-AB". */
export function formatearPlaca(placa: unknown): string;

/** Valida un valor según el tipo indicado. */
export function validar(tipo: TipoDocumento, valor: unknown): boolean;
/** Detecta si el valor es DNI, RUC o CE. */
export function detectarDocumento(valor: unknown): 'dni' | 'ruc' | 'ce' | null;
