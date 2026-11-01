import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizar,
  calcularDigitoRuc,
  validarRuc,
  tipoRuc,
  formatearRuc,
  validarDni,
  formatearDni,
  validarCe,
  validarCelular,
  formatearCelular,
  celularE164,
  tipoPlaca,
  validarPlaca,
  formatearPlaca,
  validar,
  detectarDocumento,
} from '../src/index.js';

describe('normalizar', () => {
  test('quita espacios, guiones y puntos y pasa a mayúsculas', () => {
    assert.equal(normalizar(' ab-c.1 23 '), 'ABC123');
  });
  test('null y undefined devuelven cadena vacía', () => {
    assert.equal(normalizar(null), '');
    assert.equal(normalizar(undefined), '');
  });
  test('convierte números a string', () => {
    assert.equal(normalizar(12345678), '12345678');
  });
});

describe('RUC', () => {
  test('RUC reales conocidos son válidos', () => {
    assert.equal(validarRuc('20131312955'), true); // SUNAT
    assert.equal(validarRuc('20100070970'), true); // dígito 0 (resto 10)
  });

  test('calcula el dígito verificador', () => {
    assert.equal(calcularDigitoRuc('2013131295'), 5);
    assert.equal(calcularDigitoRuc('2010007097'), 0);
  });

  test('resto 11 produce dígito 1', () => {
    // Busca una base cuya suma ponderada sea múltiplo de 11.
    let base = null;
    for (let n = 2010000000; n < 2010001000; n++) {
      const s = String(n);
      const suma = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2].reduce((a, f, i) => a + f * Number(s[i]), 0);
      if (suma % 11 === 0) { base = s; break; }
    }
    assert.ok(base);
    assert.equal(calcularDigitoRuc(base), 1);
    assert.equal(validarRuc(`${base}1`), true);
  });

  test('rechaza dígito verificador incorrecto', () => {
    assert.equal(validarRuc('20131312954'), false);
    assert.equal(validarRuc('20131312956'), false);
  });

  test('rechaza longitudes incorrectas y caracteres no numéricos', () => {
    assert.equal(validarRuc('2013131295'), false);
    assert.equal(validarRuc('201313129550'), false);
    assert.equal(validarRuc('2013131295A'), false);
    assert.equal(validarRuc(''), false);
    assert.equal(validarRuc(null), false);
  });

  test('rechaza prefijos no válidos aunque el dígito cuadre', () => {
    const base = '3013131295';
    const ruc = base + calcularDigitoRuc(base);
    assert.equal(validarRuc(ruc), false);
  });

  test('acepta todos los prefijos válidos', () => {
    for (const prefijo of ['10', '15', '17', '20']) {
      const base = `${prefijo}45678912`;
      assert.equal(validarRuc(base + calcularDigitoRuc(base)), true, prefijo);
    }
  });

  test('acepta RUC con espacios y guiones', () => {
    assert.equal(validarRuc('20-131312955'), true);
    assert.equal(validarRuc(' 20131312955 '), true);
  });

  test('tipoRuc identifica el contribuyente', () => {
    assert.equal(tipoRuc('20131312955'), 'persona-juridica');
    const base = '1045678912';
    assert.equal(tipoRuc(base + calcularDigitoRuc(base)), 'persona-natural');
    const base15 = '1545678912';
    assert.equal(tipoRuc(base15 + calcularDigitoRuc(base15)), 'no-domiciliado');
    assert.equal(tipoRuc('20131312954'), null);
  });

  test('formatearRuc normaliza o lanza', () => {
    assert.equal(formatearRuc('20 131 312 955'), '20131312955');
    assert.throws(() => formatearRuc('123'), RangeError);
  });

  test('calcularDigitoRuc lanza con base inválida', () => {
    assert.throws(() => calcularDigitoRuc('123'), TypeError);
    assert.throws(() => calcularDigitoRuc('20131312955'), TypeError);
  });
});

describe('DNI', () => {
  test('valida 8 dígitos', () => {
    assert.equal(validarDni('45678912'), true);
    assert.equal(validarDni('00012345'), true);
    assert.equal(validarDni(45678912), true);
  });
  test('rechaza longitudes y letras', () => {
    assert.equal(validarDni('4567891'), false);
    assert.equal(validarDni('456789123'), false);
    assert.equal(validarDni('4567891A'), false);
  });
  test('formatearDni normaliza o lanza', () => {
    assert.equal(formatearDni('4567-8912'), '45678912');
    assert.throws(() => formatearDni('abc'), RangeError);
  });
});

describe('Carné de Extranjería', () => {
  test('modo estricto: 9 dígitos', () => {
    assert.equal(validarCe('001234567'), true);
    assert.equal(validarCe('12345678'), false);
    assert.equal(validarCe('A12345678'), false);
  });
  test('modo flexible: alfanumérico 8-12', () => {
    assert.equal(validarCe('N00123456', { estricto: false }), true);
    assert.equal(validarCe('ABCDEFGHI', { estricto: false }), false);
    assert.equal(validarCe('1234567', { estricto: false }), false);
  });
});

describe('Celular', () => {
  test('acepta formatos comunes', () => {
    for (const t of ['987654321', '987 654 321', '987-654-321', '+51987654321', '+51 987 654 321', '51987654321', '0051987654321', '(+51) 987654321']) {
      assert.equal(validarCelular(t), true, t);
    }
  });
  test('rechaza fijos y longitudes incorrectas', () => {
    for (const t of ['014567890', '87654321', '9876543210', '+52987654321', 'abc', '']) {
      assert.equal(validarCelular(t), false, t);
    }
  });
  test('formatea local e internacional', () => {
    assert.equal(formatearCelular('+51987654321'), '987 654 321');
    assert.equal(formatearCelular('987654321', { internacional: true }), '+51 987 654 321');
  });
  test('E.164', () => {
    assert.equal(celularE164('987 654 321'), '+51987654321');
    assert.throws(() => celularE164('123'), RangeError);
  });
  test('formatearCelular lanza si es inválido', () => {
    assert.throws(() => formatearCelular('123'), RangeError);
  });
});

describe('Placas', () => {
  test('reconoce placas de vehículos', () => {
    for (const p of ['ABC-123', 'abc123', 'A1B-234', 'C6Z 123', 'F2D-456']) {
      assert.equal(tipoPlaca(p), 'vehiculo', p);
    }
  });
  test('reconoce placas de motos', () => {
    assert.equal(tipoPlaca('1234-AB'), 'moto');
    assert.equal(tipoPlaca('5678cd'), 'moto');
  });
  test('rechaza formatos inválidos', () => {
    for (const p of ['1BC-123', 'AB-123', 'ABCD-123', 'ABC-12', '123-ABC', '']) {
      assert.equal(validarPlaca(p), false, p);
    }
  });
  test('formatea con guion', () => {
    assert.equal(formatearPlaca('abc123'), 'ABC-123');
    assert.equal(formatearPlaca('1234ab'), '1234-AB');
    assert.throws(() => formatearPlaca('xx'), RangeError);
  });
});

describe('validar y detectarDocumento', () => {
  test('validar despacha según tipo', () => {
    assert.equal(validar('ruc', '20131312955'), true);
    assert.equal(validar('DNI', '45678912'), true);
    assert.equal(validar('celular', '912345678'), true);
    assert.equal(validar('placa', 'ABC-123'), true);
    assert.equal(validar('ce', '001234567'), true);
  });
  test('validar lanza con tipo desconocido', () => {
    assert.throws(() => validar('pasaporte', 'X'), TypeError);
  });
  test('detecta el tipo de documento', () => {
    assert.equal(detectarDocumento('45678912'), 'dni');
    assert.equal(detectarDocumento('20131312955'), 'ruc');
    assert.equal(detectarDocumento('001234567'), 'ce');
    assert.equal(detectarDocumento('123'), null);
  });
});
