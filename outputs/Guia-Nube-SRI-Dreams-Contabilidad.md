# Dreams Contabilidad: nube y SRI

## Hosting recomendado

Para publicar la interfaz gratis, usa GitHub Pages. En este entorno se publica con una rama `gh-pages`, evitando permisos adicionales de GitHub Actions.

Pasos:

1. Crear un repositorio en GitHub, por ejemplo `dreams-contabilidad`.
2. Subir este proyecto al repositorio.
3. Subir el proyecto a `main`.
4. Subir la carpeta compilada `dist` a la rama `gh-pages`.
5. En GitHub, ir a Settings > Pages y elegir Deploy from a branch: `gh-pages` / root.

## Base de datos compartida

GitHub Pages solo publica la interfaz. Para que varios usuarios entren desde distintos dispositivos y vean la misma contabilidad, el proyecto ya tiene una integración opcional con Supabase:

- Auth para usuarios y contraseñas reales.
- PostgreSQL para ventas, gastos, productos y clientes.
- Realtime para ver cambios entre usuarios.
- Políticas de seguridad por negocio.

El esquema inicial está en `supabase/schema.sql`. La tabla `app_states` permite sincronizar el estado completo del prototipo por usuario, y las demás tablas quedan listas para una normalización contable más avanzada.

Pasos para activarlo:

1. Crear proyecto en Supabase.
2. Ejecutar `supabase/schema.sql` desde SQL Editor.
3. Copiar `.env.example` como `.env`.
4. Pegar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
5. Reiniciar la app.

Con credenciales configuradas, Dreams usa Supabase Auth para crear e ingresar usuarios. Sin credenciales, mantiene el modo local.

## Enlace con Facturador SRI

El sistema ya incluye un botón directo al Facturador SRI:

https://facturadorsri.sri.gob.ec/portal-facturadorsri-internet/pages/inicio.html

Según información oficial del SRI, el Facturador SRI permite generar, firmar electrónicamente, enviar al SRI y notificar comprobantes electrónicos. Para usarlo necesitas:

- RUC.
- Clave del SRI.
- Autorización para emitir comprobantes electrónicos.
- Firma electrónica vigente tipo archivo.

## Integración futura correcta

Primera fase:

- Desde cada venta de Dreams, abrir el Facturador SRI.
- Mostrar un resumen listo para copiar: cliente, RUC, producto, subtotal, IVA y total.
- Marcar la venta como `No emitida`, `En proceso` o `Emitida`.
- Guardar clave de acceso o número de autorización del comprobante.

Segunda fase:

- Generar XML de comprobante electrónico desde Dreams.
- Firmar con certificado digital del negocio.
- Enviar al web service del SRI en ambiente de pruebas.
- Validar autorización.
- Pasar a ambiente de producción.
- Generar y guardar RIDE/PDF.

Esta segunda fase requiere revisar certificados, normativa vigente, ambientes SRI y seguridad de firma digital.
