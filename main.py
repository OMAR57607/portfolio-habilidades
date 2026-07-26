"""Servidor del portfolio de Omar Fuentes.

Sirve la capa estática del frontend con cabeceras de seguridad y de caché
adecuadas para producción, y genera `robots.txt` / `sitemap.xml` a partir de la
URL pública real del despliegue.
"""

import os
import secrets
from pathlib import Path

import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.responses import FileResponse, HTMLResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
INDEX_FILE = STATIC_DIR / "index.html"

# URL pública del sitio. Si no se define, se deduce de la petición entrante.
# En Railway basta con declarar SITE_URL=https://tu-dominio.com
SITE_URL = os.environ.get("SITE_URL", "").rstrip("/")

# Marcadores que el HTML sustituye en cada petición.
SITE_URL_PLACEHOLDER = "__SITE_URL__"
NONCE_PLACEHOLDER = "__CSP_NONCE__"

# Orígenes externos de los que depende el frontend.
GOOGLE_FONTS_CSS = "https://fonts.googleapis.com"
GOOGLE_FONTS_FILES = "https://fonts.gstatic.com"
FONTAWESOME_CDN = "https://cdnjs.cloudflare.com"


def build_csp(nonce: str | None = None) -> str:
    """CSP del sitio. Con nonce se evita por completo `unsafe-inline` en scripts."""
    script_src = f"'self' 'nonce-{nonce}'" if nonce else "'self'"
    return "; ".join(
        [
            "default-src 'self'",
            f"script-src {script_src}",
            # Los estilos en línea siguen siendo necesarios para las animaciones
            # calculadas en JS (dial de churn, filtros de skills).
            f"style-src 'self' 'unsafe-inline' {GOOGLE_FONTS_CSS} {FONTAWESOME_CDN}",
            f"font-src 'self' {GOOGLE_FONTS_FILES} {FONTAWESOME_CDN}",
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
}

# Caché larga para assets, sin caché para el HTML (lleva un nonce por petición).
STATIC_CACHE_CONTROL = "public, max-age=604800, stale-while-revalidate=86400"
HTML_CACHE_CONTROL = "no-store"

app = FastAPI(
    title="Omar Fuentes Portfolio",
    description="Portfolio de tecnología y analítica para concesionarias automotrices.",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)


@app.middleware("http")
async def add_security_and_cache_headers(request: Request, call_next):
    response: Response = await call_next(request)

    for header, value in SECURITY_HEADERS.items():
        response.headers.setdefault(header, value)
    # La ruta del index fija su propia CSP con nonce; el resto usa la genérica.
    response.headers.setdefault("Content-Security-Policy", build_csp())

    if request.url.path.startswith("/static/"):
        response.headers.setdefault("Cache-Control", STATIC_CACHE_CONTROL)

    return response


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


def resolve_site_url(request: Request) -> str:
    """URL pública del sitio: la configurada, o la deducida de la petición."""
    if SITE_URL:
        return SITE_URL
    return str(request.base_url).rstrip("/")


@app.get("/", response_class=HTMLResponse)
async def read_index(request: Request) -> HTMLResponse:
    nonce = secrets.token_urlsafe(16)
    html = INDEX_FILE.read_text(encoding="utf-8")
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
        headers={"Cache-Control": STATIC_CACHE_CONTROL},
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
    reload_enabled = os.environ.get("DEV_RELOAD", "0") == "1"
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload_enabled)
