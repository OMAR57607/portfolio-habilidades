from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import os

app = FastAPI(title="Omar Fuentes Portfolio API")

# Servir archivos estáticos del frontend
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_index():
    return FileResponse("static/index.html")

# Servir style.css directo si es necesario
@app.get("/style.css")
async def read_css():
    return FileResponse("static/style.css")

# Servir app.js directo si es necesario
@app.get("/app.js")
async def read_js():
    return FileResponse("static/app.js")

# Servir logo.png directo si es necesario
@app.get("/logo.png")
async def read_logo():
    return FileResponse("static/logo.png")

# Servir favicon.ico para navegadores que lo piden en la raíz
@app.get("/favicon.ico")
async def read_favicon():
    return FileResponse("static/favicon.ico")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
