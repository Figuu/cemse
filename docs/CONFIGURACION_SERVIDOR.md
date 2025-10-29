# Configuración del Servidor - CEMSE (Emplea y Emprende)

## Información Básica

**Dominio:** https://empleaemprende.bo
**Servidor:** Servidor de la Gobernación de Cochabamba
**Sistema Operativo:** Ubuntu Server
**Ubicación del Proyecto:** `/opt/cemse`

---

## Cómo se Configuró el Servidor

### 1. Preparación del Servidor

Se utilizó un servidor proporcionado por la Gobernación de Cochabamba y se instalaron las herramientas necesarias:

- **Node.js 20** - Para ejecutar la aplicación Next.js
- **Docker** - Para los servicios de base de datos, caché y almacenamiento
- **Nginx** - Como puente entre internet y la aplicación
- **PostgreSQL** - Base de datos principal
- **Redis** - Sistema de caché para mejorar el rendimiento
- **MinIO** - Para guardar archivos (imágenes, videos, documentos)

Todo esto se instaló ejecutando un script automatizado llamado `setup.sh` que preparó el servidor en unos 15-20 minutos.

### 2. Configuración del Dominio

El dominio **empleaemprende.bo** se configuró de la siguiente manera:

1. **Registros DNS:** Se apuntaron los registros del dominio a la IP del servidor de la Gobernación
2. **Certificado SSL:** Se instaló un certificado gratuito de Let's Encrypt para tener HTTPS
3. **Renovación Automática:** El certificado se renueva solo cada 90 días

Ahora el sitio es accesible de forma segura en:
- https://empleaemprende.bo
- https://www.empleaemprende.bo

### 3. Estructura de la Aplicación

La aplicación funciona así:

```
Internet (Puerto 80/443)
    ↓
Nginx (Reverse Proxy)
    ↓
Next.js App (Puerto 3000)
    ↓
Docker Containers:
  - PostgreSQL (Base de datos)
  - Redis (Caché)
  - MinIO (Archivos)
```

### 4. Servicios Automáticos

Se configuraron dos servicios que se inician automáticamente cuando el servidor arranca:

- **cemse-backend**: Inicia los contenedores Docker (base de datos, caché, almacenamiento)
- **cemse**: Inicia la aplicación web de Next.js

Estos servicios se reinician automáticamente si algo falla.

---

## Datos Iniciales Cargados

### Usuario Administrador

Al instalar el sistema se creó un usuario administrador inicial:

- **Email:** admin@demo.com
- **Contraseña:** 12345678
- **Rol:** SUPERADMIN

Este usuario tiene acceso completo al panel administrativo.

### Cursos

Los cursos específicos fueron cargados **manualmente** por el equipo de Boring Ventures usando el panel administrativo de la aplicación.

La plataforma soporta 8 categorías de cursos:
- Habilidades Blandas
- Cursos Técnicos
- Emprendimiento
- Alfabetización Digital
- Liderazgo
- Comunicación
- Finanzas
- Marketing

Cada curso puede tener 3 niveles: Principiante, Intermedio y Avanzado.

### Otros Datos

Los datos reales de producción (empresas, jóvenes, ofertas de trabajo, emprendimientos) fueron ingresados por los usuarios de la plataforma después del lanzamiento.

---

## Cómo Actualizar la Aplicación

Ejecutando el comando:

```bash
cd /opt/cemse
./update.sh
```

Este script hace todo automáticamente:
1. Descarga los últimos cambios de GitHub
2. Instala dependencias nuevas (si hay)
3. Actualiza la base de datos
4. Reinicia los servicios
5. Verifica que todo funcione

Todo el proceso toma entre 2-5 minutos.

---

## Scripts Útiles

En la carpeta del proyecto (`/opt/cemse`) hay un script principal llamado `manage.sh` que ayuda con tareas comunes:

```bash
./manage.sh start      # Iniciar la aplicación
./manage.sh stop       # Detener la aplicación
./manage.sh restart    # Reiniciar todo
./manage.sh status     # Ver si todo está funcionando
./manage.sh logs       # Ver los registros de actividad
./manage.sh backup     # Crear una copia de seguridad
./manage.sh health     # Verificar la salud del sistema
```

---

## Backups (Copias de Seguridad)

### Ubicación
Los backups se guardan en: `/opt/cemse/backups/`

### Crear un Backup
```bash
cd /opt/cemse
./manage.sh backup
```

Esto crea una copia de:
- La base de datos completa
- Todos los archivos subidos por usuarios
- Configuración del sistema

Los backups más antiguos de 30 días se borran automáticamente.

---

## Verificar que Todo Funcione

Para verificar rápidamente que la aplicación está funcionando:

```bash
cd /opt/cemse
./manage.sh status
```

O simplemente abre el navegador y visita:
- https://empleaemprende.bo

---

## Si Algo Sale Mal

### La aplicación no carga

```bash
cd /opt/cemse
./manage.sh restart
```

Espera 30 segundos y vuelve a intentar acceder.

### Ver qué está pasando

```bash
cd /opt/cemse
./manage.sh logs
```

Esto muestra los registros de actividad en tiempo real.

### Reinicio Completo

Si nada más funciona:

```bash
cd /opt/cemse
./manage.sh stop
./manage.sh start
```

---

## Características Especiales del Servidor

### Subida de Archivos Grandes
El servidor está configurado para permitir la subida de archivos de hasta **600 MB**, especialmente pensado para videos de cursos.

### Certificado SSL
El certificado HTTPS se renueva automáticamente cada 3 meses, no hay que hacer nada manual.

### Reinicio Automático
Si la aplicación se cae por algún motivo, se reinicia automáticamente en 10 segundos.

---

## Información Técnica (Resumen)

| Aspecto | Detalle |
|---------|---------|
| **Servidor** | Gobernación de Cochabamba (Ubuntu Server) |
| **Dominio** | empleaemprende.bo |
| **Aplicación** | Next.js 15 + React 19 |
| **Base de Datos** | PostgreSQL 15 |
| **Ubicación** | /opt/cemse |
| **Puerto Web** | 443 (HTTPS) y 80 (HTTP) |
| **Usuario** | cemsedev |

---

## Contacto

**Repositorio del Proyecto:**
https://github.com/figuu/cemse

**Rama Principal:** master

---

## Comandos Rápidos de Referencia

```bash
# Ir a la carpeta del proyecto
cd /opt/cemse

# Actualizar la aplicación
./update.sh

# Ver estado de servicios
./manage.sh status

# Crear backup
./manage.sh backup

# Reiniciar todo
./manage.sh restart

# Ver logs en tiempo real
./manage.sh logs

# Verificar salud del sistema
./manage.sh health
```

---

**Última Actualización:** Octubre 2025
**Estado:** En Producción Activa
