import {
  validarRuc,
  tipoRuc,
  calcularDigitoRuc,
  validarDni,
  formatearCelular,
  celularE164,
  formatearPlaca,
  detectarDocumento,
} from '../src/index.js';

console.log('RUC 20131312955 válido:', validarRuc('20131312955'));
console.log('Tipo de RUC:', tipoRuc('20131312955'));
console.log('Dígito verificador de 2013131295:', calcularDigitoRuc('2013131295'));
console.log('DNI 45678912 válido:', validarDni('45678912'));
console.log('Celular formateado:', formatearCelular('+51987654321', { internacional: true }));
console.log('Celular E.164:', celularE164('987-654-321'));
console.log('Placa formateada:', formatearPlaca('a1b234'));
console.log('Documento detectado:', detectarDocumento('001234567'));
