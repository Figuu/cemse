# Correcciones de Content Security Policy (CSP)

## Problemas Identificados

1. **Error de `unsafe-eval`**: Next.js requiere `unsafe-eval` para el hot reload en desarrollo
2. **Permisos del micrófono**: La configuración `microphone=self` estaba causando violaciones de política
3. **Conflicto de headers**: Nginx estaba sobrescribiendo los headers de CSP de Next.js con una configuración más restrictiva
4. **CSP de nginx**: La configuración `/etc/nginx/sites-available/emplea-y-emprende` tenía `"default-src 'self' http: https: data: blob: 'unsafe-inline'"` que bloqueaba `unsafe-eval`

## Cambios Realizados

### 1. next.config.ts
- **Agregado `'unsafe-eval'`** tanto en desarrollo como en producción para permitir el funcionamiento correcto de Next.js
- **Cambiado `microphone=self`** a `microphone=()` para deshabilitar completamente el acceso al micrófono
- **Mantenida la configuración de CSP** más permisiva para permitir todas las funcionalidades necesarias

### 2. setup-ubuntu.sh (Nginx)
- **Removido el header CSP** de nginx para evitar conflictos con Next.js
- **Actualizado Referrer-Policy** para ser consistente con Next.js
- **Agregado comentario** explicativo sobre el manejo de CSP

### 3. Configuración de Nginx en Producción
- **Identificado el problema**: `/etc/nginx/sites-available/emplea-y-emprende` tenía CSP que sobrescribía Next.js
- **Creados scripts de corrección**: `fix-nginx-csp.sh` y `fix-nginx-csp-simple.sh`

## Solución Completa

### Paso 1: Ejecutar script de corrección de nginx
```bash
# Opción 1: Script completo (recomendado)
sudo bash fix-nginx-csp.sh

# Opción 2: Script simple (solo comenta la línea problemática)
sudo bash fix-nginx-csp-simple.sh
```

### Paso 2: Reiniciar la aplicación Next.js
```bash
# Si usas PM2
pm2 restart emplea-y-emprende

# Si usas npm/yarn
npm run dev  # o npm run build && npm start
```

## Configuración Final de CSP

```javascript
// Desarrollo y Producción (manejado por Next.js)
"default-src 'self'; 
 script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
 style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
 font-src 'self' https://fonts.gstatic.com; 
 img-src 'self' data: blob: https://* http://localhost:9000; 
 media-src 'self' blob: https://*; 
 connect-src 'self' https://* http://localhost:9000 ws://localhost:* wss://*; 
 frame-ancestors 'none'; 
 base-uri 'self'; 
 form-action 'self';"
```

## Permisos de Política Final

```javascript
"camera=(), microphone=(), geolocation=self, payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()"
```

## Archivos Creados

- `fix-nginx-csp.sh`: Script completo para corregir configuración nginx
- `fix-nginx-csp-simple.sh`: Script simple que solo comenta la línea problemática
- `CSP-FIXES.md`: Esta documentación

## Verificación

Después de ejecutar los scripts, verifica que:
1. Los errores de CSP han desaparecido del navegador
2. La aplicación funciona correctamente
3. No hay errores en la consola del navegador

## Notas de Seguridad

- `unsafe-eval` está habilitado para permitir el funcionamiento de Next.js
- El micrófono está deshabilitado por defecto por seguridad
- La configuración permite conexiones WebSocket para desarrollo
- Se mantienen todas las protecciones de seguridad esenciales
- Los headers CSP son manejados exclusivamente por Next.js
