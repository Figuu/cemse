#!/bin/bash

# Script alternativo para comentar la línea CSP problemática
# Ejecutar con: sudo bash fix-nginx-csp-simple.sh

echo "🔧 Comentando línea CSP problemática en nginx..."

# Crear backup
cp /etc/nginx/sites-available/emplea-y-emprende /etc/nginx/sites-available/emplea-y-emprende.backup.$(date +%Y%m%d_%H%M%S)

# Comentar la línea CSP problemática
sed -i 's/add_header Content-Security-Policy/# add_header Content-Security-Policy/' /etc/nginx/sites-available/emplea-y-emprende

echo "🔍 Verificando configuración..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuración válida. Recargando nginx..."
    systemctl reload nginx
    echo "🎉 ¡Línea CSP comentada exitosamente!"
else
    echo "❌ Error. Restaurando backup..."
    cp /etc/nginx/sites-available/emplea-y-emprende.backup.$(date +%Y%m%d_%H%M%S) /etc/nginx/sites-available/emplea-y-emprende
fi
