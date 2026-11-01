/**
 * validador-peru-js
 * Validación y formateo de documentos y datos peruanos: RUC, DNI, CE,
 * celulares y placas vehiculares. Sin dependencias.
 *
 * @author Angel Castañeda Meza
 * @license MIT
 */

const FACTORES_RUC = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
const PREFIJOS_RUC = {
  10: 'persona-natural',
  15: 'no-domiciliado',
  17: 'no-domiciliado',
  20: 'persona-juridica',
};

/**
 * Elimina espacios, guiones y puntos; convierte a mayúsculas.
 * @param {unknown} valor
 * @returns {string}
 */
export function normalizar(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor).replace(/[\s.\-]/g, '').toUpperCase();
}

/* ----------------------------------------------------------------- RUC */

/**
 * Calcula el dígito verificador (módulo 11) para los 10 primeros dígitos de un RUC.
 * @param {string} base10
 * @returns {number}
 */
export function calcularDigitoRuc(base10) {
  const base = normalizar(base10);
  if (!/^\d{10}$/.test(base)) {
    throw new TypeError('La base del RUC debe tener exactamente 10 dígitos');
  }
  const suma = FACTORES_RUC.reduce((acc, f, i) => acc + f * Number(base[i]), 0);
  const resto = 11 - (suma % 11);
  if (resto === 10) return 0;
  if (resto === 11) return 1;
  return resto;
}

/**
 * Valida un RUC: 11 dígitos, prefijo válido (10, 15, 17, 20) y dígito verificador.
 * @param {unknown} ruc
 * @returns {boolean}
 */
export function validarRuc(ruc) {
  const valor = normalizar(ruc);
  if (!/^\d{11}$/.test(valor)) return false;
  if (!(valor.slice(0, 2) in PREFIJOS_RUC)) return false;
  return calcularDigitoRuc(valor.slice(0, 10)) === Number(valor[10]);
}

/**
 * Devuelve el tipo de contribuyente según el prefijo, o null si el RUC es inválido.
 * @param {unknown} ruc
 * @returns {'persona-natural'|'persona-juridica'|'no-domiciliado'|null}
 */
export function tipoRuc(ruc) {
  if (!validarRuc(ruc)) return null;
  return PREFIJOS_RUC[normalizar(ruc).slice(0, 2)];
}

/**
 * Normaliza un RUC válido (solo dígitos). Lanza error si es inválido.
 * @param {unknown} ruc
 * @returns {string}
 */
export function formatearRuc(ruc) {
  if (!validarRuc(ruc)) throw new RangeError(`RUC inválido: ${ruc}`);
  return normalizar(ruc);
}

/* ----------------------------------------------------------------- DNI */

/**
 * Valida un DNI peruano: exactamente 8 dígitos.
 * @param {unknown} dni
 * @returns {boolean}
 */
export function validarDni(dni) {
  return /^\d{8}$/.test(normalizar(dni));
}

/**
 * Normaliza un DNI (8 dígitos). Lanza error si es inválido.
 * @param {unknown} dni
 * @returns {string}
 */
export function formatearDni(dni) {
  if (!validarDni(dni)) throw new RangeError(`DNI inválido: ${dni}`);
  return normalizar(dni);
}

/* ------------------------------------------------- Carné de extranjería */

/**
 * Valida un Carné de Extranjería: 9 dígitos (formato vigente de Migraciones).
 * Acepta también el formato antiguo alfanumérico de hasta 12 caracteres si
 * `{ estricto: false }`.
 * @param {unknown} ce
 * @param {{ estricto?: boolean }} [opciones]
 * @returns {boolean}
 */
export function validarCe(ce, { estricto = true } = {}) {
  const valor = normalizar(ce);
  if (estricto) return /^\d{9}$/.test(valor);
  return /^[A-Z0-9]{8,12}$/.test(valor) && /\d/.test(valor);
}

/* ------------------------------------------------------------ Celulares */

/**
 * Extrae los 9 dígitos nacionales de un celular, quitando +51 / 0051 / 51.
 * @param {unknown} telefono
 * @returns {string}
 */
function digitosCelular(telefono) {
  let valor = normalizar(telefono).replace(/[()]/g, '');
  if (valor.startsWith('+51')) valor = valor.slice(3);
  else if (valor.startsWith('0051')) valor = valor.slice(4);
  else if (valor.length === 11 && valor.startsWith('51')) valor = valor.slice(2);
  return valor;
}

/**
 * Valida un celular peruano: 9 dígitos iniciando en 9, con o sin prefijo +51.
 * @param {unknown} telefono
 * @returns {boolean}
 */
export function validarCelular(telefono) {
  return /^9\d{8}$/.test(digitosCelular(telefono));
}

/**
 * Formatea un celular como "987 654 321" o "+51 987 654 321".
 * @param {unknown} telefono
 * @param {{ internacional?: boolean }} [opciones]
 * @returns {string}
 */
export function formatearCelular(telefono, { internacional = false } = {}) {
  if (!validarCelular(telefono)) throw new RangeError(`Celular inválido: ${telefono}`);
  const d = digitosCelular(telefono);
  const local = `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  return internacional ? `+51 ${local}` : local;
}

/**
 * Devuelve el celular en formato E.164 (+51987654321), útil para APIs como WhatsApp.
 * @param {unknown} telefono
 * @returns {string}
 */
export function celularE164(telefono) {
  if (!validarCelular(telefono)) throw new RangeError(`Celular inválido: ${telefono}`);
  return `+51${digitosCelular(telefono)}`;
}

/* --------------------------------------------------------------- Placas */

const RE_PLACA_VEHICULO = /^[A-Z][A-Z0-9]{2}\d{3}$/;
const RE_PLACA_MOTO = /^\d{4}[A-Z]{2}$/;

/**
 * Identifica el tipo de placa: 'vehiculo' (ABC-123, A1B-234) o 'moto' (1234-AB).
 * @param {unknown} placa
 * @returns {'vehiculo'|'moto'|null}
 */
export function tipoPlaca(placa) {
  const valor = normalizar(placa);
  if (RE_PLACA_VEHICULO.test(valor)) return 'vehiculo';
  if (RE_PLACA_MOTO.test(valor)) return 'moto';
  return null;
}

/**
 * Valida una placa vehicular peruana.
 * @param {unknown} placa
 * @returns {boolean}
 */
export function validarPlaca(placa) {
  return tipoPlaca(placa) !== null;
}

/**
 * Formatea una placa con guion: "ABC-123" o "1234-AB".
 * @param {unknown} placa
 * @returns {string}
 */
export function formatearPlaca(placa) {
  const tipo = tipoPlaca(placa);
  if (!tipo) throw new RangeError(`Placa inválida: ${placa}`);
  const v = normalizar(placa);
  return tipo === 'vehiculo' ? `${v.slice(0, 3)}-${v.slice(3)}` : `${v.slice(0, 4)}-${v.slice(4)}`;
}

/* -------------------------------------------------------------- Genérico */

const VALIDADORES = {
  ruc: validarRuc,
  dni: validarDni,
  ce: validarCe,
  celular: validarCelular,
  placa: validarPlaca,
};

/**
 * Valida un valor según su tipo de documento.
 * @param {'ruc'|'dni'|'ce'|'celular'|'placa'} tipo
 * @param {unknown} valor
 * @returns {boolean}
 */
export function validar(tipo, valor) {
  const fn = VALIDADORES[String(tipo).toLowerCase()];
  if (!fn) throw new TypeError(`Tipo de documento no soportado: ${tipo}`);
  return fn(valor);
}

/**
 * Intenta detectar el tipo de documento de identidad (DNI, RUC o CE).
 * @param {unknown} valor
 * @returns {'dni'|'ruc'|'ce'|null}
 */
export function detectarDocumento(valor) {
  if (validarDni(valor)) return 'dni';
  if (validarRuc(valor)) return 'ruc';
  if (validarCe(valor)) return 'ce';
  return null;
}
