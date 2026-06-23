# Publicar Dreams Contabilidad en GitHub Pages

## Estado actual

El proyecto ya está listo como repositorio local con rama `main`.

Commits actuales:

- `5c776fe` Crear Dreams Contabilidad.
- `40a03e4` Integrar marca Dreams y sincronizacion Supabase.
- `78ca2bc` Mejorar estado de nube y acceso remoto.

## Opción recomendada

1. Iniciar sesión en GitHub.
2. Crear un repositorio nuevo llamado `dreams-contabilidad`.
3. Dejarlo vacío, sin README, sin `.gitignore` y sin licencia.
4. Copiar la URL HTTPS del repositorio, por ejemplo:

```bash
https://github.com/TU-USUARIO/dreams-contabilidad.git
```

5. Ejecutar:

```bash
./scripts/publicar-github-pages.sh https://github.com/TU-USUARIO/dreams-contabilidad.git
```

6. Ejecutar `npm run build`.
7. Publicar la carpeta `dist` en una rama `gh-pages`.
8. En GitHub, ir a Settings > Pages y elegir Deploy from a branch: `gh-pages` / root.

## Resultado esperado

GitHub publicará la interfaz en una URL parecida a:

```text
https://TU-USUARIO.github.io/dreams-contabilidad/
```

## Datos compartidos

GitHub Pages aloja la interfaz, pero no guarda datos compartidos. Para usuarios reales y registros visibles desde varios dispositivos, hay que activar Supabase:

1. Crear proyecto en Supabase.
2. Ejecutar `supabase/schema.sql`.
3. Configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. Guardar esas variables como Secrets/Variables del despliegue si se desea compilar con nube activa.
