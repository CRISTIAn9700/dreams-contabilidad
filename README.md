# Dreams Contabilidad

Sistema web inicial para contabilidad de una agencia de publicidad ecuatoriana con producción en maquinaria láser CO2.

## Acceso inicial

- Usuario: `admin@dreams.ec`
- Contraseña: `Dreams2026!`
- Moneda: USD
- IVA inicial: 15%

## Módulos incluidos

- Inicio de sesión local.
- Panel financiero con ventas, gastos, utilidad bruta e IVA por declarar.
- Registro de ventas con cliente, producto, cantidad, estado y cálculo automático de IVA.
- Registro de gastos con proveedor, categoría, subtotal, IVA y total.
- Catálogo de productos y servicios de publicidad/láser CO2.
- Base de clientes.
- Reportes de IVA, cuentas por cobrar y cuentas por pagar.
- Ajustes editables del negocio y porcentaje de IVA.
- Calendario contable mensual con ventas y gastos.
- Accesos rápidos para registrar venta, registrar gasto y abrir el Facturador SRI.
- Preparación para GitHub Pages por rama `gh-pages` y sincronización compartida en Supabase.

## Datos base para Ecuador

El prototipo usa una tarifa IVA general inicial del 15%, moneda USD y separación de subtotal, IVA y total para facilitar reportes mensuales. Para producción se recomienda validar siempre con fuentes oficiales:

- Servicio de Rentas Internas: https://www.sri.gob.ec/
- Banco Central del Ecuador: https://www.bce.fin.ec/estadisticas-economicas/

## Próxima fase recomendada

1. Crear proyecto Supabase y ejecutar `supabase/schema.sql`.
2. Configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. Roles: propietario, contador, vendedor y operador.
4. Facturación electrónica y anexos según requerimientos SRI.
5. Retenciones de IVA e Impuesto a la Renta.
6. Inventario con movimientos, mínimos y costo promedio.
7. Importación/exportación Excel.
8. Dashboard con indicadores BCE actualizables.
9. Despliegue en la nube con dominio y certificado HTTPS.

## Facturador SRI

El panel y cada venta incluyen un acceso directo al Facturador SRI:

https://facturadorsri.sri.gob.ec/portal-facturadorsri-internet/pages/inicio.html

La integración automática con emisión, firma y autorización debe tratarse como una fase posterior porque requiere autorización de comprobantes electrónicos, certificado de firma digital y pruebas contra los servicios del SRI.

## Activar nube con Supabase

1. Crear un proyecto en Supabase.
2. En SQL Editor, ejecutar el contenido de `supabase/schema.sql`.
3. Copiar `.env.example` como `.env`.
4. Colocar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
5. Ejecutar `npm run dev`.

Cuando esas variables existen, la pantalla de acceso usa Supabase Auth y guarda la contabilidad en la tabla `app_states`. Sin esas variables, la app conserva el modo local con `localStorage`.
