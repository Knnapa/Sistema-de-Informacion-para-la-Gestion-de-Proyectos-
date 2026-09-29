# MIUDES — Sistema de Informacion para la Gestion de Proyectos de la Extension de Vicerrectoria (UDES)

Trabajo de grado — Ingenieria de Software, Universidad de Santander.

Sistema web para que la Vicerrectoria de Extension registre, gestione y haga seguimiento a sus proyectos de intervencion social.

## Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Base de datos:** MySQL (via Sequelize)
- **Autenticacion:** JWT + control de acceso basado en roles (RBAC)

## Modulos

Administracion (implementado en esta version inicial), Proyectos, Participantes, Reportes, Indicadores, Induccion — ver `docs/` para el detalle de requisitos (RF-01 a RF-30) y la guia completa del proyecto.

## Roles

`administrador` · `lider` · `colider` · `estudiante`

## Estructura del repositorio

```
miudes/
├── backend/     # API REST (Node.js/Express/Sequelize)
├── frontend/    # Interfaz web (React/Vite)
├── database/    # schema.sql de referencia (diccionario de datos)
├── docs/        # SRS, log de uso de IA, actas, evidencias de prueba
└── docker-compose.yml  # MySQL local para desarrollo
```

## Como levantar el entorno local

### 1. Base de datos

```bash
docker compose up -d
```

Esto levanta MySQL en `localhost:3306` con la base `miudes` ya creada.

(Si prefieres no usar Docker, crea manualmente una base MySQL local y usa `database/schema.sql` como referencia.)

### 2. Backend

```bash
cd backend
cp .env.example .env      # ajusta las variables si hace falta
npm install
npm run seed               # crea el usuario administrador inicial
npm run dev                 # levanta el API en http://localhost:4000
```

Con `npm run dev`, Sequelize crea/ajusta automaticamente las tablas en la base de datos (`sequelize.sync`).

Las credenciales del administrador inicial son las que definiste en `SEED_ADMIN_CORREO` / `SEED_ADMIN_PASSWORD` dentro de `.env` (por defecto: `admin@miudes.local` / `CambiaEstaClave123` — cambialas).

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # levanta la interfaz en http://localhost:5173
```

Inicia sesion con el usuario administrador creado en el paso anterior. Desde el dashboard vas a "Administracion de usuarios" para crear al resto de usuarios (Lider, Co-lider, Estudiante).

## Que ya esta implementado (Modulo de Administracion)

- Login con JWT (`POST /api/auth/login`)
- Listar, crear, editar y desactivar usuarios (`/api/usuarios`) — solo rol Administrador
- Asignacion de rol al crear/editar un usuario (RF-02)
- Restablecer contrasena de cualquier usuario (`PUT /api/usuarios/:id/reset-password`) — RF-04
- Log de acciones criticas del Administrador (tabla `logs_acciones`) — RF-06
- Interfaz React minima: login, dashboard y pantalla de administracion de usuarios

## Que sigue

Con este modulo de Administracion integrado y probado, el siguiente paso (metodologia iterativo-incremental, ver la guia del proyecto) es el modulo de **Proyectos**: constructor de formularios dinamicos, adjuntos y vinculacion con participantes.

## Subir este proyecto a GitHub

Este repositorio todavia no existe en GitHub. Para crearlo:

```bash
cd miudes
git init
git add .
git commit -m "Scaffold inicial: modulo de Administracion (auth + RBAC)"
```

Luego crea un repositorio vacio en GitHub (sin README, sin .gitignore) y conectalo:

```bash
git remote add origin https://github.com/<tu-usuario>/<nombre-del-repo>.git
git branch -M main
git push -u origin main
```

A partir de ahi, trabaja con una rama por modulo (por ejemplo `feature/proyectos`) y haz commits descriptivos y frecuentes — te va a facilitar mucho documentar el capitulo de Implementacion del trabajo de grado con evidencia real de avance.
