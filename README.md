# 🔴 Portfolio Profesional - Omar Fuentes

> Sitio web interactivo y premium para mostrar habilidades de desarrollo y analítica de datos en el sector automotriz.

Este portfolio está construido utilizando **FastAPI** para servir la capa estática del frontend y estructurado de manera optimizada para su despliegue inmediato en **Railway** mediante contenedores **Docker**.

## 🚀 Características
- **Proyectos Destacados:** Detalles estructurados del Sistema Central Toyota (Django + Machine Learning), Verificador de Precios (FastAPI/PWA), Consolidador BDC (Flask/Pandas), Capturador de Evidencias (Streamlit) y el sitio Fuertes Trail Puebla (Node.js/Express).
- **Simulador Analítico BDC:** Consola interactiva en JavaScript que demuestra el comportamiento de tus algoritmos de negocio (proyección de kilómetros CERT, segmentación CRT y alertas de riesgo de Churn).
- **Patrones de Ingeniería:** Sección que documenta los patrones reales aplicados en producción (Outbox Pattern, idempotencia, optimización de N+1, lock cooperativo, inferencia ML con TF-IDF y seguridad por capas).
- **Filtrado de Skills:** Grid interactivo que agrupa y filtra tu Stack tecnológico en Backend, Datos, Machine Learning, Nube y DevOps.
- **Diseño Ultra Premium:** Estilo de modo oscuro con Glassmorphism (vidrio translúcido), luces difusas de fondo y animaciones suaves al hacer scroll.

## 📁 Estructura del Proyecto
```
portfolio-habilidades/
├── main.py              # Backend FastAPI para servir la app
├── requirements.txt     # Dependencias Python
├── Dockerfile           # Configuración para Railway
├── README.md            # Este archivo
└── static/              # Capa de Frontend
    ├── index.html       # Interfaz de usuario (SEO optimizado)
    ├── style.css        # Sistema de estilos y variables CSS
    └── app.js           # Lógica del frontend y simulador BDC
```

## ⚙️ Ejecución Local

1. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

2. Ejecuta el servidor de desarrollo local:
   ```bash
   python main.py
   ```

3. Abre el navegador en `http://localhost:8080`

## 🚂 Despliegue en Railway

1. Sube esta carpeta (`portfolio-habilidades`) como un repositorio nuevo en tu cuenta de GitHub (público o privado).
2. Entra en tu panel de [Railway](https://railway.app).
3. Selecciona **New Project** (Nuevo Proyecto) -> **Deploy from GitHub repo**.
4. Selecciona tu repositorio recién creado.
5. Railway detectará el `Dockerfile` de forma automática, construirá la imagen y publicará tu portfolio web.
