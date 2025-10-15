#!/bin/bash

# Script para corregir la configuración CSP de nginx
# Ejecutar con: sudo bash fix-nginx-csp.sh

echo "🔧 Corrigiendo configuración CSP de nginx..."

# Crear backup de la configuración actual
echo "📦 Creando backup de la configuración actual..."
cp /etc/nginx/sites-available/emplea-y-emprende /etc/nginx/sites-available/emplea-y-emprende.backup.$(date +%Y%m%d_%H%M%S)

# Crear nueva configuración con CSP corregida
echo "✏️  Creando nueva configuración..."
cat > /etc/nginx/sites-available/emplea-y-emprende << 'EOF'
# emplea-y-emprende Application Configuration
server {
    listen 80;
    server_name empleayemprende.boring.lat www.empleayemprende.boring.lat;
    
    # Security headers (CSP manejado por Next.js)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    # Note: CSP is handled by Next.js application headers
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    # Client max body size (for file uploads)
    client_max_body_size 100M;
    
    # Proxy settings
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Logs
    access_log /var/log/nginx/emplea_y_emprende_access.log;
    error_log /var/log/nginx/emplea_y_emprende_error.log;
}

# Redirect www to non-www
server {
    listen 80;
    server_name empleayemprende.boring.lat www.empleayemprende.boring.lat;
    return 301 http://empleayemprende.boring.lat$request_uri;
}
EOF

# Verificar la configuración
echo "🔍 Verificando configuración de nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuración válida. Recargando nginx..."
    systemctl reload nginx
    echo "🎉 ¡Configuración CSP corregida exitosamente!"
    echo "📝 Los headers CSP ahora son manejados por Next.js"
else
    echo "❌ Error en la configuración. Restaurando backup..."
    cp /etc/nginx/sites-available/emplea-y-emprende.backup.$(date +%Y%m%d_%H%M%S) /etc/nginx/sites-available/emplea-y-emprende
    echo "🔄 Backup restaurado"
fi
