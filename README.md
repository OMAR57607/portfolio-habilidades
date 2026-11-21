# 🔴 Portfolio Profesional — Omar Fuentes

> Hoja de presentación profesional: desarrollo full stack, machine learning y analítica de datos, con resultados medidos en la operación real de un taller automotriz.

Construido con **FastAPI** para servir la capa estática del frontend, con cabeceras de
seguridad y caché de producción, y preparado para desplegarse en **Railway** mediante
contenedores **Docker**.

## 🚀 Características

- **Proyectos destacados:** solo los que están desplegados: Sistema Central Toyota (Django + Machine Learning), Verificador de Precios (FastAPI/PWA), Estacionamiento IRcars (Django REST Framework), Catálogo de Accesorios (Next.js, en Vercel), RJ Cars (Node + Claude API) y Punto de Venta para Restaurantes (Django, piloto).
- **Certificaciones:** Google, Johns Hopkins University y Microsoft (Coursera).
- **Simulador analítico BDC:** consola interactiva en JavaScript que reproduce los algoritmos de negocio reales (proyección de kilómetros CERT, clasificación CRT y alertas de riesgo de churn).
- **Patrones de ingeniería:** los patrones aplicados en producción (Outbox Pattern, idempotencia, optimización de N+1, lock cooperativo en base de datos, inferencia ML con TF-IDF y seguridad por capas).
- **Stack agrupado por área y verificado:** Backend, Frontend, Datos, Machine Learning e IA, Nube, DevOps y Negocio. Solo incluye tecnologías presentes en el código de los repositorios.
- **Resultado medido en portada:** comparativa a escala real del tiempo de cotización (hasta 3 h → 15 min promedio).
- **Temas claro / oscuro / sistema:** persistidos en `localStorage` y aplicados antes del primer pintado, sin parpadeo.
- **Accesible y respetuoso del movimiento:** navegación por teclado, enlace de salto, regiones `aria-live` y soporte de `prefers-reduced-motion`.
- **Sin terceros:** fuentes e iconos autoalojados; el sitio no carga nada de CDNs externos.
- **Versión imprimible:** al imprimir o guardar como PDF se genera una versión limpia en papel.

## 📁 Estructura del Proyecto

```
portfolio-habilidades/
├── main.py                  # Backend FastAPI: estáticos, seguridad, caché, SEO y /health
├── requirements.txt         # Dependencias Python
├── Dockerfile               # Imagen de producción (usuario no-root)
├── .dockerignore
├── README.md                # Este archivo
└── static/                  # Capa de frontend
    ├── index.html           # Interfaz de usuario (SEO + datos estructurados)
    ├── icons.svg            # Sprite de iconos SVG (el servidor lo incrusta en el HTML)
    ├── og-image.png         # Imagen de vista previa al compartir el enlace (1200×630)
    ├── manifest.webmanifest # Manifiesto PWA
    ├── app.js               # Punto de entrada: arranca todos los módulos
    ├── fonts/               # Archivo Expanded, Inter y JetBrains Mono (woff2, SIL OFL)
    ├── css/                 # Un archivo por componente
    │   ├── variables.css    # @font-face, tokens de diseño y tema claro
    │   ├── base.css         # Reset, iconos, botones, formularios y layout global
    │   ├── header.css   hero.css   about.css   projects.css
    │   ├── simulator.css services.css skills.css contact.css
    │   ├── animations.css   # Keyframes y prefers-reduced-motion
    │   └── print.css        # Versión para imprimir / guardar como PDF
    └── js/                  # Un módulo ES por responsabilidad
        ├── theme.js         # Selector de tema claro/oscuro/sistema
        ├── menu.js          # Menú móvil
        ├── simulator.js     # Motor de KPIs del simulador BDC
        ├── contact.js       # Envío del formulario vía WhatsApp
        └── effects.js       # Progreso de scroll, reveal y sección activa
```

Las hojas de estilo se enlazan una por una desde `index.html` (no encadenadas con
`@import`) para que el navegador las descargue en paralelo.

## ⚙️ Ejecución Local

1. Instala las dependencias:

   ```bash
   pip install -r requirements.txt
   ```

2. Ejecuta el servidor:

   ```bash
   python main.py
   ```

   Para recarga automática durante el desarrollo:

   ```bash
   DEV_RELOAD=1 python main.py
   ```

3. Abre el navegador en `http://localhost:8080`

## 🔧 Variables de Entorno

| Variable     | Por defecto | Descripción                                                                                              |
| ------------ | ----------- | -------------------------------------------------------------------------------------------------------- |
| `PORT`       | `8080`      | Puerto de escucha. Railway lo inyecta automáticamente.                                                     |
| `SITE_URL`   | *(vacío)*   | URL pública del sitio. Alimenta la etiqueta canónica, Open Graph, `robots.txt` y `sitemap.xml`. Si no se define, se deduce de la petición entrante. |
| `DEV_RELOAD` | `0`         | Ponlo en `1` para recarga automática en local: reinicia al cambiar Python y relee HTML/CSS/JS en cada petición. No usar en producción. |

## 🔒 Seguridad y Rendimiento

El servidor aplica en cada respuesta:

- **Content-Security-Policy** con `nonce` por petición y solo `'self'`: sin `unsafe-inline` (ni en scripts ni en estilos) y sin orígenes de terceros.
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` y `Cross-Origin-Opener-Policy`.
- **Caché con versión de assets:** el HTML enlaza CSS, JS y fuentes con `?v=<hash del contenido>`. Esas URLs se cachean un año (`immutable`) y cambian solas en cada despliegue; el resto se revalida con ETag. Así nunca se mezcla un HTML nuevo con estilos viejos. El HTML va con `no-store` (lleva el nonce).
- **Compresión gzip** de HTML, CSS, JS y SVG.
- El contenedor corre como usuario **sin privilegios de root** y expone un `HEALTHCHECK` contra `/health`.

## 🔎 SEO

`robots.txt` y `sitemap.xml` se generan en tiempo de ejecución a partir de `SITE_URL`
(o de la URL de la petición). El HTML incluye etiqueta canónica, Open Graph, Twitter
Card y datos estructurados JSON-LD de tipo `Person`.

## 🚂 Despliegue en Railway

1. Sube este repositorio a GitHub.
2. Entra en tu panel de [Railway](https://railway.app).
3. Selecciona **New Project** → **Deploy from GitHub repo** y elige el repositorio.
4. Define la variable `SITE_URL` con el dominio público final (por ejemplo `https://omarfuentes.up.railway.app`).
5. Railway detecta el `Dockerfile`, construye la imagen y publica el sitio.

## 🎨 Iconos y fuentes

- **Iconos:** [Lucide](https://lucide.dev) (licencia ISC) y logotipos de [Simple Icons](https://simpleicons.org) (CC0), reunidos en `static/icons.svg`. Para usar uno nuevo, añade su `<symbol id="i-nombre">` al sprite y referéncialo con `<svg class="icon"><use href="#i-nombre"/></svg>`.
- **Fuentes:** Archivo, Inter y JetBrains Mono, bajo SIL Open Font License 1.1, servidas desde `static/fonts/`.
