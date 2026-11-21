"""Servidor del portfolio de Omar Fuentes.

Sirve la capa estática del frontend con cabeceras de seguridad y de caché
adecuadas para producción, y genera `robots.txt` / `sitemap.xml` a partir de la
URL pública real del despliegue.
"""

import hashlib
import os
import secrets
from pathlib import Path

import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, HTMLResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
INDEX_FILE = STATIC_DIR / "index.html"
ICON_SPRITE_FILE = STATIC_DIR / "icons.svg"

# URL pública del sitio. Si no se define, se deduce de la petición entrante.
# En Railway basta con declarar SITE_URL=https://tu-dominio.com
SITE_URL = os.environ.get("SITE_URL", "").rstrip("/")

# Con DEV_RELOAD=1 la plantilla se reconstruye en cada petición, para ver los
# cambios de HTML/CSS/JS sin reiniciar el servidor.
DEV_RELOAD = os.environ.get("DEV_RELOAD", "0") == "1"

# Marcadores que el HTML sustituye en cada petición.
SITE_URL_PLACEHOLDER = "__SITE_URL__"
NONCE_PLACEHOLDER = "__CSP_NONCE__"
# Marcadores que se resuelven una sola vez, al construir la plantilla.
ASSET_VERSION_PLACEHOLDER = "__ASSET_VERSION__"
ICON_SPRITE_PLACEHOLDER = "<!-- __ICON_SPRITE__ -->"


def build_csp(nonce: str | None = None) -> str:
    """CSP del sitio. Con nonce se evita por completo `unsafe-inline` en scripts."""
    script_src = f"'self' 'nonce-{nonce}'" if nonce else "'self'"
    return "; ".join(
        [
            "default-src 'self'",
            f"script-src {script_src}",
            # Fuentes e iconos se sirven desde el propio origen: no hay CDNs de
            # terceros ni estilos en línea, así que basta con 'self'.
            "style-src 'self'",
            "font-src 'self'",
            "img-src 'self' data:",
            "connect-src 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "object-src 'none'",
        ]
    )


SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Cross-Origin-Opener-Policy": "same-origin",
}

# Los assets enlazados con ?v=<hash> cambian de URL en cada despliegue, así que
# pueden cachearse "para siempre". El resto se revalida con ETag (304 barato):
# nunca se mezcla un HTML nuevo con CSS/JS viejo tras publicar cambios.
VERSIONED_CACHE_CONTROL = "public, max-age=31536000, immutable"
STATIC_CACHE_CONTROL = "no-cache"
HTML_CACHE_CONTROL = "no-store"


def compute_asset_version() -> str:
    """Huella corta del contenido de `static/`: cambia si cambia cualquier asset."""
    digest = hashlib.sha256()
    for path in sorted(STATIC_DIR.rglob("*")):
        if path.is_file():
            digest.update(path.relative_to(STATIC_DIR).as_posix().encode())
            digest.update(path.read_bytes())
    return digest.hexdigest()[:12]


def build_template() -> tuple[str, str]:
    """HTML con el sprite de iconos incrustado y los assets versionados."""
    version = compute_asset_version()
    html = INDEX_FILE.read_text(encoding="utf-8")
    html = html.replace(ICON_SPRITE_PLACEHOLDER, ICON_SPRITE_FILE.read_text(encoding="utf-8"))
    html = html.replace(ASSET_VERSION_PLACEHOLDER, version)
    return html, version


TEMPLATE, ASSET_VERSION = build_template()


def current_template() -> tuple[str, str]:
    return build_template() if DEV_RELOAD else (TEMPLATE, ASSET_VERSION)


app = FastAPI(
    title="Omar Fuentes Portfolio",
    description="Portfolio de desarrollo full stack y analítica de datos.",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

# HTML, CSS, JS y SVG viajan comprimidos (las fuentes woff2 y los PNG ya lo están).
app.add_middleware(GZipMiddleware, minimum_size=1024)


@app.middleware("http")
async def add_security_and_cache_headers(request: Request, call_next):
    response: Response = await call_next(request)

    for header, value in SECURITY_HEADERS.items():
        response.headers.setdefault(header, value)
    # La ruta del index fija su propia CSP con nonce; el resto usa la genérica.
    response.headers.setdefault("Content-Security-Policy", build_csp())

    if request.url.path.startswith("/static/") and response.status_code in (200, 304):
        _, version = current_template()
        is_versioned = request.query_params.get("v") == version
        response.headers["Cache-Control"] = (
            VERSIONED_CACHE_CONTROL if is_versioned and not DEV_RELOAD else STATIC_CACHE_CONTROL
        )

    return response


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


def resolve_site_url(request: Request) -> str:
    """URL pública del sitio: la configurada, o la deducida de la petición."""
    if SITE_URL:
        return SITE_URL
    return str(request.base_url).rstrip("/")


# HEAD incluido: lo usan monitores de disponibilidad y vistas previas de enlaces.
@app.api_route("/", methods=["GET", "HEAD"], response_class=HTMLResponse)
async def read_index(request: Request) -> HTMLResponse:
    nonce = secrets.token_urlsafe(16)
    html, _ = current_template()
    html = html.replace(SITE_URL_PLACEHOLDER, resolve_site_url(request))
    html = html.replace(NONCE_PLACEHOLDER, nonce)
    return HTMLResponse(
        html,
        headers={
            "Cache-Control": HTML_CACHE_CONTROL,
            "Content-Security-Policy": build_csp(nonce),
        },
    )


@app.get("/favicon.ico", include_in_schema=False)
async def read_favicon() -> FileResponse:
    return FileResponse(
        STATIC_DIR / "favicon.ico",
        headers={"Cache-Control": "public, max-age=86400"},
    )


@app.get("/robots.txt", response_class=PlainTextResponse, include_in_schema=False)
async def read_robots(request: Request) -> PlainTextResponse:
    body = f"User-agent: *\nAllow: /\n\nSitemap: {resolve_site_url(request)}/sitemap.xml\n"
    return PlainTextResponse(body)


@app.get("/sitemap.xml", include_in_schema=False)
async def read_sitemap(request: Request) -> Response:
    # El portfolio es una única página; los anclajes no son URLs indexables.
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"  <url><loc>{resolve_site_url(request)}/</loc><changefreq>monthly</changefreq></url>\n"
        "</urlset>\n"
    )
    return Response(xml, media_type="application/xml")


@app.get("/health", include_in_schema=False)
async def health() -> dict:
    return {"status": "ok"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=DEV_RELOAD)
