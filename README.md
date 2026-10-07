# sandiellyortega.com

Sitio personal de una sola página de Sandielly "Sandy" Ortega Polanco, Data Analytics & BI Engineer.

Está hecho con HTML, CSS y JavaScript, sin frameworks ni paso de build. GitHub Pages sirve los archivos tal cual.

## Estructura

```
index.html              Página completa. El texto en español va en el HTML y el inglés en atributos data-en
404.html                Página de error
favicon.svg
robots.txt, sitemap.xml
.nojekyll               Evita que GitHub Pages procese el sitio con Jekyll
assets/css/styles.css   Estilos y tokens de color (claro y oscuro)
assets/js/main.js       Idioma, tema, menús, animaciones, lightbox, videos, formulario
assets/img/             Imágenes
cv/                     CV en PDF
```

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub. Si se llama `<tu-usuario>.github.io`, el sitio queda en la raíz de ese dominio.
2. Sube el **contenido de esta carpeta** (no la carpeta del perfil completo):
   ```bash
   cd sitio-web
   git init -b main
   git add .
   git commit -m "Sitio personal"
   git remote add origin https://github.com/<tu-usuario>/<repo>.git
   git push -u origin main
   ```
3. En GitHub, ve a **Settings → Pages → Build and deployment**, elige *Deploy from a branch*, la rama `main` y la carpeta `/ (root)`.

### Dominio propio (sandiellyortega.com)

1. En **Settings → Pages → Custom domain**, escribe `sandiellyortega.com`. GitHub crea el archivo `CNAME`.
2. En tu proveedor de DNS, crea registros `A` para `@` apuntando a `185.199.108.153`, `185.199.109.153`, `185.199.110.153` y `185.199.111.153`, y un `CNAME` para `www` apuntando a `<tu-usuario>.github.io`.
3. Cuando el certificado esté listo, activa **Enforce HTTPS**.

No crees el archivo `CNAME` a mano antes de configurar el DNS: GitHub redirigiría a un dominio que todavía no responde.

### Si NO usas el dominio propio

Si publicas en otra URL, como `https://<tu-usuario>.github.io/<repo>/`, reemplaza `https://sandiellyortega.com/` por esa URL en:
- `index.html`: etiquetas `canonical`, `hreflang`, `og:url`, `og:image` y el bloque JSON-LD
- `robots.txt` y `sitemap.xml`
- `404.html`: cambia `href="/"` y `/favicon.svg` por `/<repo>/`

El resto del sitio usa rutas relativas y funciona en cualquier URL.

## Pendientes de contenido

Busca `[` o `PENDIENTE` en `index.html` para encontrarlos.

| Qué | Dónde |
|---|---|
| CV en PDF: `cv/Sandielly-Ortega-CV-ES.pdf` y `cv/Sandielly-Ortega-CV-EN.pdf` | carpeta `cv/` |
| Enlace de Calendly (`[CALENDLY]`) | hero y Contacto |
| Charlas: tema de Codecamp SDQ 2023 y de Big Data Day 2022, confirmar el año de Universidad O&M (2024) y enlaces a slides o video | sección Charlas |
| Capturas de dashboards: `assets/img/dashboards/dash-1.png` … `dash-6.png` (16:10, datos anonimizados) | sección Casos |
| Logo de Proxify con texto: `assets/img/logos/proxify-wordmark.png` (su sitio bloquea la descarga automática; mientras falte se muestra el nombre) | franja de empresas |
| Logos de clientes que faltan: `assets/img/clientes/complete-automation.png` y `south-american-restaurants.png` | Experiencia |

Mientras falte un logo, se muestran las iniciales de la empresa (o su nombre en la franja). Mientras falte una captura o la portada, se muestra un recuadro con su descripción.

## Fotos de charlas

Las fotos originales van en `images/`, que no se sube al repo (`.gitignore`) porque pesan varios MB. El sitio usa versiones web de ~1400 px (100–130 KB) en `assets/img/charlas/`. Para agregar una charla, reduce la foto a ese tamaño y copia un `<li class="talk">` de la sección Charlas.

## Videos de YouTube

Cada `<li class="video">` lleva el ID del video en `data-yt` y el título en `data-title`. Los videos no cargan si abres `index.html` directo desde la carpeta (YouTube da "Error 153"). Pruébalos con `python -m http.server`.

## Editar contenido

- **Texto:** edita el español dentro de la etiqueta y el inglés en su atributo `data-en`.
  ```html
  <p data-en="Remote">Remoto</p>
  ```
  Para atributos se usa `data-en-<atributo>`, por ejemplo `data-en-aria-label` o `data-en-alt`.
- **Idioma por URL:** `?lang=en` abre el sitio en inglés. La preferencia de idioma y la de tema se guardan en el navegador.
- **Formulario:** GitHub Pages no ejecuta código de servidor. Por eso el formulario abre el cliente de correo del visitante con el mensaje ya escrito (`mailto:`). Si prefieres recibir los mensajes sin que el visitante use su correo, puedes conectar un servicio como Formspree cambiando el `<form>` y el bloque «Formulario de contacto» de `main.js`.
- **Analytics:** en el `<head>` hay un bloque comentado para GA4 o Plausible.

## Probar localmente

```bash
cd sitio-web
python -m http.server 8000
# abre http://localhost:8000
```
