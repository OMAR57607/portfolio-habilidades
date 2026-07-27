# 🔴 Portfolio Profesional — Omar Fuentes

> Sitio web interactivo para mostrar habilidades de desarrollo y analítica de datos en el sector automotriz.

Construido con **FastAPI** para servir la capa estática del frontend, con cabeceras de
seguridad y caché de producción, y preparado para desplegarse en **Railway** mediante
contenedores **Docker**.

## 🚀 Características

- **Proyectos destacados:** Sistema Central Toyota (Django + Machine Learning), Verificador de Precios (FastAPI/PWA), Consolidador BDC (Flask/Pandas), Capturador de Evidencias (Streamlit) y el sitio Fuertes Trail Puebla (Node.js/Express).
- **Simulador analítico BDC:** consola interactiva en JavaScript que reproduce los algoritmos de negocio reales (proyección de kilómetros CERT, clasificación CRT y alertas de riesgo de churn).
- **Patrones de ingeniería:** los patrones aplicados en producción (Outbox Pattern, idempotencia, optimización de N+1, lock cooperativo, inferencia ML con TF-IDF y seguridad por capas).
- **Filtrado de skills:** grid interactivo que agrupa el stack en Backend, Datos, Machine Learning, Nube, DevOps y Negocio.
- **Temas claro / oscuro / sistema:** persistidos en `localStorage` y aplicados antes del primer pintado, sin parpadeo.
- **Accesible y respetuoso del movimiento:** navegación por teclado, enlace de salto, regiones `aria-live` y soporte de `prefers-reduced-motion`.

## 📁 Estructura del Proyecto

```
portfolio-habilidades/
├── main.py                  # Backend FastAPI: estáticos, seguridad, SEO y /health
├── requirements.txt         # Dependencias Python
├── Dockerfile               # Imagen de producción (usuario no-root)
├── .dockerignore
├── README.md                # Este archivo
└── static/                  # Capa de frontend
    ├── index.html           # Interfaz de usuario (SEO + datos estructurados)
    ├── manifest.webmanifest # Manifiesto PWA
    ├── app.js               # Punto de entrada: arranca todos los módulos
    ├── css/                 # Un archivo por componente
    │   ├── variables.css    # Tokens de diseño y tema claro
    │   ├── base.css         # Reset, utilitarios y layout global
    │   ├── header.css   hero.css   about.css   projects.css
    │   ├── simulator.css services.css skills.css contact.css
    │   └── animations.css   # Keyframes y prefers-reduced-motion
    └── js/                  # Un módulo ES por responsabilidad
        ├── theme.js         # Selector de tema claro/oscuro/sistema
        ├── menu.js          # Menú móvil
        ├── skills.js        # Filtrado del grid de skills
        ├── simulator.js     # Motor de KPIs del simulador BDC
        ├── contact.js       # Envío del formulario vía WhatsApp
        └── effects.js       # Scroll, reveal, tilt 3D y sección activa
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
| `DEV_RELOAD` | `0`         | Ponlo en `1` para recarga automática en local. No usar en producción.                                      |

## 🔒 Seguridad y Rendimiento

El servidor aplica en cada respuesta:

- **Content-Security-Policy** con `nonce` por petición, sin `unsafe-inline` en scripts.
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` y `Strict-Transport-Security`.
- Caché de una semana para los estáticos y `no-store` para el HTML (que lleva el nonce).
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
