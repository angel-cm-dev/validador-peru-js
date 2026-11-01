# validador-peru-js

Librería ligera (ESM, con tipos TypeScript) para validar y formatear RUC, DNI, Carné de Extranjería, celulares y placas del Perú.

![JavaScript](https://img.shields.io/badge/JavaScript-ESM-F7DF1E?logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/types-included-3178C6?logo=typescript&logoColor=white)
![Node](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)
![Licencia MIT](https://img.shields.io/badge/licencia-MIT-blue.svg)
[![CI](https://github.com/angel-cm-dev/validador-peru-js/actions/workflows/ci.yml/badge.svg)](https://github.com/angel-cm-dev/validador-peru-js/actions/workflows/ci.yml)

## Características

- **RUC**: valida longitud, prefijo (10, 15, 17, 20) y dígito verificador **módulo 11** (algoritmo SUNAT); calcula el dígito y detecta el tipo de contribuyente.
- **DNI**: 8 dígitos, normalización.
- **Carné de Extranjería**: 9 dígitos (modo estricto) o alfanumérico 8-12 (modo flexible).
- **Celulares**: acepta `987654321`, `987 654 321`, `+51 987-654-321`, `0051…`; formatea en local, internacional y E.164 (ideal para WhatsApp/SMS).
- **Placas**: vehículos (`ABC-123`, `A1B-234`) y motos (`1234-AB`).
- `validar(tipo, valor)` genérico y `detectarDocumento(valor)`.
- Cero dependencias, ESM nativo, definiciones `.d.ts` incluidas, funciona en Node y navegador.

## Requisitos

- Node.js 20 o superior (o cualquier navegador moderno con soporte ES Modules).

## Instalación y uso

```bash
# Desde npm (cuando se publique)
npm install validador-peru-js

# O clonando el repositorio
git clone https://github.com/angel-cm-dev/validador-peru-js.git
cd validador-peru-js
npm test
npm run example
```

## Ejemplo de uso

```js
import {
  validarRuc,
  tipoRuc,
  calcularDigitoRuc,
  validarDni,
  validarCelular,
  formatearCelular,
  celularE164,
  formatearPlaca,
  validar,
  detectarDocumento,
} from 'validador-peru-js';

validarRuc('20131312955');          // true
tipoRuc('20131312955');             // 'persona-juridica'
calcularDigitoRuc('2013131295');    // 5

validarDni('45678912');             // true

validarCelular('+51 987-654-321');  // true
formatearCelular('987654321', { internacional: true }); // '+51 987 654 321'
celularE164('987 654 321');         // '+51987654321'

formatearPlaca('a1b234');           // 'A1B-234'

validar('ruc', '20100070970');      // true
detectarDocumento('001234567');     // 'ce'
```

Las funciones `formatear*` lanzan `RangeError` si el valor es inválido, por lo que conviene validarlo antes o envolverlas en `try/catch`.

### Algoritmo del RUC (módulo 11)

1. Multiplicar los 10 primeros dígitos por los factores `5 4 3 2 7 6 5 4 3 2` y sumar.
2. `resto = 11 - (suma % 11)`.
3. Si `resto` es 10 el dígito es `0`; si es 11, el dígito es `1`; en otro caso, el dígito es `resto`.

## Estructura del proyecto

```
validador-peru-js/
├── src/
│   ├── index.js        # Implementación (ESM)
│   └── index.d.ts      # Tipos TypeScript
├── examples/demo.js    # Ejemplo ejecutable
├── test/index.test.js  # Pruebas con node:test
├── .github/workflows/ci.yml
└── package.json
```

## Pruebas

```bash
npm test
```

Usa el runner nativo `node:test` (31 pruebas): RUC reales y generados, todos los casos del dígito verificador, formatos de celular, placas y documentos inválidos.

## Roadmap

- [ ] Validación del dígito de control del DNI (carácter impreso en el documento).
- [ ] Ubigeo: validación y búsqueda de departamento/provincia/distrito.
- [ ] Publicación en npm con provenance desde GitHub Actions.

## Licencia y autor

Distribuido bajo licencia [MIT](LICENSE).

Desarrollado por **Angel Castañeda Meza** — Ingeniero de Sistemas, Lima, Perú.
GitHub: [@angel-cm-dev](https://github.com/angel-cm-dev)
