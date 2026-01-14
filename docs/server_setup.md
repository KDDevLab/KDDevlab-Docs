# 📚 Production-Ready React Portfolio Deployment Guide

**Projekt:** Sicheres React Portfolio mit HTTPS, SSH-Härtung und automatischer Bot-Abwehr  
**Stack:** React + Vite, Nginx, Let's Encrypt, Fail2Ban  
**Betriebssystem:** Debian/Ubuntu-basiert  
**Ziel:** Production-ready Setup mit maximaler Sicherheit

---

## 📋 Inhaltsverzeichnis

1. [Installierte Software](#1-installierte-software)
2. [SSH-Härtung](#2-ssh-härtung)
3. [React Portfolio Deployment](#3-react-portfolio-deployment)
4. [Nginx Konfiguration](#4-nginx-konfiguration)
5. [Fail2Ban Setup](#5-fail2ban-setup)
6. [Update-Workflow](#6-update-workflow)
7. [Troubleshooting](#7-troubleshooting)
8. [Sicherheits-Level](#8-erreichte-sicherheits-level)
9. [Performance & Best Practices](#9-performance--best-practices)
10. [Wichtige Dateien & Pfade](#10-wichtige-dateien--pfade)
11. [Deployment Checkliste](#11-checkliste-für-neues-deployment)

---

## 📦 1. Installierte Software

### 1.1 Basis-Tools

| Software | Zweck | Installation |
|----------|-------|--------------|
| **Git** | Repository klonen & Updates | `sudo apt install git -y` |
| **Node.js 22** | JavaScript Runtime für React | [Node.js Download](https://nodejs.org/) |
| **NPM 10** | Package Manager | Mit Node.js installiert |

### 1.2 Webserver & SSL

| Software | Zweck | Installation |
|----------|-------|--------------|
| **Nginx** | Reverse Proxy & Static File Server | `sudo apt install nginx -y` |
| **Certbot** | Let's Encrypt SSL-Zertifikate | `sudo apt install certbot python3-certbot-nginx -y` |

### 1.3 Security

| Software | Zweck | Installation |
|----------|-------|--------------|
| **Fail2Ban** | Automatische IP-Sperrung bei Angriffen | `sudo apt install fail2ban -y` |
| **iptables** | Firewall (für Fail2Ban) | `sudo apt install iptables -y` |

---

## 🔐 2. SSH-Härtung

### 2.1 Warum SSH-Keys statt Passwörter?

**Problem mit Passwörtern:**
- Bots führen täglich tausende Brute-Force-Angriffe durch
- Selbst starke Passwörter können durch Leaks kompromittiert werden
- Passwörter können durch Keylogger abgefangen werden

**Vorteile von SSH-Keys:**
- 256-bit Verschlüsselung (praktisch unknackbar)
- Kein Passwort-Raten möglich
- Physischer Zugriff auf Private Key nötig

### 2.2 SSH-Key Authentifizierung einrichten

**Auf lokalem Computer:**
```bash
# SSH-Key generieren (ed25519 - modern & sicher)
ssh-keygen -t ed25519 -C "ihre@email.de"

# Bei Abfrage Enter drücken für Standard-Speicherort
# Optional: Passphrase für extra Schutz

# Öffentlichen Key anzeigen
cat ~/.ssh/id_ed25519.pub
```

**Auf dem Server:**
```bash
# SSH-Verzeichnis erstellen (falls nicht vorhanden)
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Öffentlichen Key hinzufügen
nano ~/.ssh/authorized_keys
# → Key einfügen (komplette Zeile von id_ed25519.pub)

# Permissions setzen
chmod 600 ~/.ssh/authorized_keys
```

**Oder automatisch mit ssh-copy-id:**
```bash
# Von lokalem Computer aus
ssh-copy-id benutzer@ihr-server.de
```

**Test:**
```bash
# Neue Terminal-Session öffnen
ssh benutzer@ihr-server.de
# Sollte OHNE Passwort-Abfrage funktionieren
```

### 2.3 SSH-Server absichern

⚠️ **WICHTIG:** Behalten Sie eine aktive SSH-Session offen, falls etwas schiefgeht!

**Datei:** `/etc/ssh/sshd_config`
```bash
sudo nano /etc/ssh/sshd_config
```

**Wichtige Einstellungen:**
```bash
# SSH-Keys erlauben
PubkeyAuthentication yes

# Passwort-Login KOMPLETT deaktivieren
PasswordAuthentication no

# Root darf sich nicht per SSH einloggen
PermitRootLogin no

# Keyboard-Interactive Auth deaktivieren (neuere OpenSSH-Versionen)
KbdInteractiveAuthentication no

# Alternativ für ältere Versionen:
ChallengeResponseAuthentication no
```

**Bedeutung der Einstellungen:**

| Einstellung | Zweck |
|-------------|-------|
| `PubkeyAuthentication yes` | Erlaubt Login mit SSH-Keys |
| `PasswordAuthentication no` | Verhindert Brute-Force komplett |
| `PermitRootLogin no` | Zusätzliche Sicherheitsebene bei Einbruch |
| `KbdInteractiveAuthentication no` | Schließt alternative Passwort-Methoden |

**Änderungen anwenden:**
```bash
# Config testen
sudo sshd -t

# SSH-Service neu starten
sudo systemctl restart sshd
```

**Wichtiger Test:**
```bash
# In NEUER Terminal-Session (alte offen lassen!)
ssh benutzer@ihr-server.de

# Sollte ohne Passwort funktionieren
# Falls nicht: In alter Session Änderungen rückgängig machen!
```

---

## 🌐 3. React Portfolio Deployment

### 3.1 Projekt-Struktur
```
/home/benutzer/apps/
└── mein-portfolio/
    ├── src/
    ├── public/
    ├── dist/          # Build Output (wird von Nginx ausgeliefert)
    ├── package.json
    └── vite.config.js
```

### 3.2 Repository Setup
```bash
# Arbeitsverzeichnis erstellen
mkdir -p ~/apps
cd ~/apps

# Repository klonen (GitHub/GitLab/BitBucket)
git clone git@github.com:username/mein-portfolio.git
cd mein-portfolio
```

### 3.3 Build Prozess
```bash
# Dependencies installieren
npm install

# Production Build erstellen
npm run build
```

**Was passiert:**
- Vite optimiert und minifiziert den Code
- Erstellt `dist/` Ordner mit Production-ready Dateien
- Assets werden gehasht für optimales Caching

### 3.4 Dateiberechtigungen

**Warum wichtig:** Nginx läuft standardmäßig als `www-data` User und benötigt Lesezugriff.
```bash
# Owner auf www-data setzen
sudo chown -R www-data:www-data ~/apps/mein-portfolio/dist

# Ordner: 755 (rwxr-xr-x)
sudo chmod -R 755 ~/apps/mein-portfolio/dist

# Dateien: 644 (rw-r--r--)
sudo find ~/apps/mein-portfolio/dist -type f -exec chmod 644 {} \;
```

**Kritisch: Parent-Ordner Permissions**
```bash
# Alle Parent-Ordner müssen für www-data durchlaufbar sein
sudo chmod 755 /home/benutzer
sudo chmod 755 /home/benutzer/apps
sudo chmod 755 /home/benutzer/apps/mein-portfolio
```

**Häufiger Fehler:**
- `/home/benutzer` hat Permission `700` (nur Owner)
- Nginx kann nicht auf `/home/benutzer/apps/...` zugreifen
- Resultat: 403 Forbidden oder 502 Bad Gateway

---

## ⚙️ 4. Nginx Konfiguration

### 4.1 Vollständiger Server Block

**Datei:** `/etc/nginx/sites-available/meine-domain.de`
```nginx
# HTTP → HTTPS Redirect
server {
    listen 80;
    listen [::]:80;
    server_name meine-domain.de www.meine-domain.de;
    return 301 https://$host$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name meine-domain.de www.meine-domain.de;

    # SSL-Zertifikate (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/meine-domain.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/meine-domain.de/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Document Root
    root /home/benutzer/apps/mein-portfolio/dist;
    index index.html;

    # Security: Block häufige Angriffspfade
    # Diese Pfade erzeugen 404-Errors die Fail2Ban erkennt
    location ~ ^/(wp-login|wp-signup|wp-admin)\.php {
        return 404;
    }
    
    location ~ ^/(roundcube|extmail|mail|horde|webmail|v-webmail|vwebmail) {
        return 404;
    }
    
    location ~ ^/(typo3/|xampp/|admin/)?(pma|phpmyadmin|phpmyAdmin|phpMyAdmin|mysqladmin) {
        return 404;
    }
    
    location ~ ^/cgi-bin {
        return 404;
    }
    
    location ~ /\.(env|git|svn|htaccess) {
        return 404;
    }

    # React Router Support (Single Page Application)
    # Alle unbekannten Routen werden zu index.html weitergeleitet
    # React Router übernimmt dann das clientseitige Routing
    location / {
        try_files $uri /index.html;
    }

    # Logging
    access_log /var/log/nginx/meine-domain_access.log;
    error_log /var/log/nginx/meine-domain_error.log;
}
```

### 4.2 Konfiguration verstehen

**Wichtige Direktiven:**

| Direktive | Erklärung |
|-----------|-----------|
| `try_files $uri /index.html` | Versucht zuerst die Datei direkt zu laden, sonst index.html |
| `return 404` für Bot-Pfade | Gibt 404 zurück statt 200 → Fail2Ban kann reagieren |
| `http2` | Modernes HTTP/2 Protokoll für bessere Performance |
| `ssl_certificate` | HTTPS-Verschlüsselung mit Let's Encrypt |

**Warum `try_files $uri /index.html` und NICHT `try_files $uri $uri/ /index.html`?**

- `$uri/` kann Rewrite-Loops verursachen
- Bei SPAs brauchen wir nur File-Fallback zu index.html
- Einfacher = weniger Fehleranfälligkeit

### 4.3 Konfiguration aktivieren
```bash
# Symlink erstellen (aktiviert die Config)
sudo ln -s /etc/nginx/sites-available/meine-domain.de /etc/nginx/sites-enabled/

# Syntax-Test (WICHTIG vor Reload!)
sudo nginx -t

# Bei Erfolg: Nginx neu laden
sudo systemctl reload nginx
```

### 4.4 SSL-Zertifikat mit Let's Encrypt

**Automatische Einrichtung:**
```bash
# Certbot installiert und konfiguriert automatisch
sudo certbot --nginx -d meine-domain.de -d www.meine-domain.de

# Folgen Sie den interaktiven Prompts:
# - Email-Adresse eingeben
# - Terms of Service akzeptieren
# - Optional: Email-Benachrichtigungen
# - Redirect HTTP → HTTPS wählen
```

**Auto-Renewal testen:**
```bash
# Dry-Run (simuliert Erneuerung)
sudo certbot renew --dry-run
```

**Automatische Erneuerung:**
- Certbot installiert automatisch einen Systemd-Timer
- Zertifikate werden alle 60 Tage automatisch erneuert
- Prüfung: `sudo systemctl status certbot.timer`

---

## 🛡️ 5. Fail2Ban Setup

### 5.1 Warum Fail2Ban?

**Realität öffentlicher Server:**
- Täglich hunderte automatisierte Angriffe
- SSH Brute-Force: 1000+ Login-Versuche pro Tag
- Web-Scanner: Suche nach WordPress, phpMyAdmin, etc.
- DDoS-Versuche

**Fail2Ban Funktionsweise:**
1. Überwacht Log-Dateien kontinuierlich
2. Erkennt verdächtige Muster (z.B. wiederholte 404-Errors)
3. Sperrt IP-Adresse automatisch via iptables
4. Automatische Entsperrung nach Ban-Zeit

### 5.2 Installation
```bash
# Fail2Ban installieren
sudo apt install fail2ban -y

# Beim Boot starten
sudo systemctl enable fail2ban

# Service starten
sudo systemctl start fail2ban
```

### 5.3 Konfiguration

**Datei:** `/etc/fail2ban/jail.local`
```ini
[DEFAULT]
# Standard-Einstellungen für alle Jails

# Ban-Zeit: 1 Stunde (3600 Sekunden)
bantime = 3600

# Zeit-Fenster für Erkennung: 10 Minuten
findtime = 600

# Maximale Fehlversuche vor Ban
maxretry = 5

# Firewall-Backend
banaction = iptables-multiport

# Ignorierte IPs (z.B. eigene IP, Monitoring-Services)
# ignoreip = 127.0.0.1/8 ::1

# ============================================
# SSH Protection
# ============================================
[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 5
bantime = 3600

# ============================================
# Nginx Protection
# ============================================

# HTTP-Auth Brute-Force
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3

# Bot-Scanner (wp-admin, phpmyadmin, etc.)
# Aggressiv: Nur 2 Versuche, 24h Ban
[nginx-botsearch]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2
bantime = 86400  # 24 Stunden

# Fehlerhafte HTTP-Requests
[nginx-bad-request]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 3

# 403 Forbidden Spam
[nginx-forbidden]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3

# Rate Limiting Violations
[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
```

**Konfiguration anwenden:**
```bash
# Syntax prüfen
sudo fail2ban-client -t

# Service neu starten
sudo systemctl restart fail2ban

# Status prüfen
sudo fail2ban-client status
```

### 5.4 Jail-Strategien erklärt

| Jail | Schutz | Strategie | Begründung |
|------|--------|-----------|------------|
| `nginx-botsearch` | Web-Scanner | Aggressiv (2/24h) | Legitime User greifen nicht auf wp-admin zu |
| `sshd` | SSH Brute-Force | Moderat (5/1h) | Erlaubt Tippfehler bei echten Logins |
| `nginx-limit-req` | Rate Limiting | Tolerant (10/1h) | Unterscheidet User von DDoS |

### 5.5 Monitoring & Management

**Status-Befehle:**
```bash
# Übersicht aller Jails
sudo fail2ban-client status

# Details eines spezifischen Jails
sudo fail2ban-client status nginx-botsearch

# Alle aktuell gebannten IPs
sudo fail2ban-client banned
```

**Live-Monitoring:**
```bash
# Echtzeit-Log mit nur Bans
sudo tail -f /var/log/fail2ban.log | grep "Ban"

# Nginx Access-Log beobachten
sudo tail -f /var/log/nginx/access.log
```

**Statistiken:**
```bash
# Anzahl Bans heute
sudo grep "$(date +%Y-%m-%d)" /var/log/fail2ban.log | grep "Ban" | wc -l

# Top 10 gebannte IPs (historisch)
sudo grep "Ban" /var/log/fail2ban.log | awk '{print $NF}' | sort | uniq -c | sort -rn | head -10

# Aktivste Jails
sudo grep "Ban" /var/log/fail2ban.log | grep -oP '\[\K[^\]]+' | sort | uniq -c | sort -rn
```

**Manuelle IP-Verwaltung:**
```bash
# IP manuell bannen
sudo fail2ban-client set nginx-botsearch banip 203.0.113.42

# IP entbannen
sudo fail2ban-client set nginx-botsearch unbanip 203.0.113.42

# Alle Bans eines Jails löschen
sudo fail2ban-client set nginx-botsearch unbanip --all

# Komplette Jail neu starten
sudo fail2ban-client reload nginx-botsearch
```

---

## 🔄 6. Update-Workflow

### 6.1 Portfolio aktualisieren
```bash
# Auf Server einloggen
ssh benutzer@ihr-server.de

# Zu Projekt-Ordner navigieren
cd ~/apps/mein-portfolio

# Änderungen vom Repository holen
git pull origin main

# Dependencies aktualisieren (falls package.json geändert)
npm install

# Production Build erstellen
npm run build

# Nginx neu laden (nur bei Config-Änderungen nötig)
sudo systemctl reload nginx
```

**Optional: Backup vor Update**
```bash
# Aktuellen Build sichern
cp -r dist dist.backup-$(date +%Y%m%d)

# Bei Problemen zurückrollen
rm -rf dist
mv dist.backup-YYYYMMDD dist
sudo systemctl reload nginx
```

### 6.2 System-Updates
```bash
# Paketlisten aktualisieren
sudo apt update

# Verfügbare Updates anzeigen
sudo apt list --upgradable

# Sicherheitsupdates installieren
sudo apt upgrade -y

# Optional: Neustart bei Kernel-Updates
sudo reboot
```

**Automatische Updates (empfohlen):**
```bash
# Unattended-Upgrades installieren
sudo apt install unattended-upgrades -y

# Konfigurieren
sudo dpkg-reconfigure -plow unattended-upgrades

# Status prüfen
sudo systemctl status unattended-upgrades
```

---

## 📊 7. Troubleshooting

### 7.1 Website nicht erreichbar

**Symptom:** Browser zeigt "Diese Website ist nicht erreichbar"

**Diagnose:**
```bash
# Ist Nginx aktiv?
sudo systemctl status nginx

# Horcht Nginx auf Port 80/443?
sudo netstat -tlnp | grep nginx

# Firewall blockiert Ports?
sudo iptables -L -n | grep -E "80|443"
```

**Lösung:**
```bash
# Nginx starten
sudo systemctl start nginx

# Firewall-Regeln prüfen (falls UFW aktiv)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 7.2 502 Bad Gateway

**Symptom:** Nginx gibt 502-Error zurück

**Häufigste Ursachen:**

1. **Datei-Permissions falsch**
```bash
# Prüfen
ls -la ~/apps/mein-portfolio/dist/

# Korrigieren
sudo chown -R www-data:www-data ~/apps/mein-portfolio/dist
sudo chmod -R 755 ~/apps/mein-portfolio/dist
```

2. **Parent-Ordner nicht lesbar**
```bash
# Alle Parent-Ordner prüfen
namei -l ~/apps/mein-portfolio/dist/index.html

# Permissions korrigieren
sudo chmod 755 /home/benutzer
sudo chmod 755 /home/benutzer/apps
```

### 7.3 500 Internal Server Error

**Symptom:** Website zeigt 500-Error

**Diagnose:**
```bash
# Error-Log prüfen
sudo tail -50 /var/log/nginx/error.log
```

**Häufige Fehler:**

1. **Rewrite-Loop**
```
rewrite or internal redirection cycle while internally redirecting to "/index.html"
```

**Lösung:** Config-Fehler in `try_files`
```nginx
# FALSCH (verursacht Loop):
location / {
    try_files $uri $uri/ /index.html;
}

# RICHTIG:
location / {
    try_files $uri /index.html;
}
```

2. **Fehlende index.html**
```bash
# Prüfen
ls ~/apps/mein-portfolio/dist/index.html

# Falls fehlt: Rebuild
cd ~/apps/mein-portfolio
npm run build
```

### 7.4 SSL-Zertifikat Probleme

**Symptom:** Browser zeigt "Nicht sicher" oder Zertifikatsfehler

**Diagnose:**
```bash
# Zertifikat-Status prüfen
sudo certbot certificates

# Expiry-Datum prüfen
openssl x509 -in /etc/letsencrypt/live/meine-domain.de/cert.pem -noout -dates
```

**Lösung:**
```bash
# Manuell erneuern
sudo certbot renew

# Bei Problemen: Neu ausstellen
sudo certbot delete --cert-name meine-domain.de
sudo certbot --nginx -d meine-domain.de
```

### 7.5 Fail2Ban bannt nicht

**Symptom:** Bots werden nicht gesperrt trotz Angriffen

**Diagnose:**
```bash
# Jail aktiv?
sudo fail2ban-client status nginx-botsearch

# Log-Datei wird überwacht?
sudo fail2ban-client get nginx-botsearch logpath

# Pattern-Test
sudo fail2ban-regex /var/log/nginx/access.log /etc/fail2ban/filter.d/nginx-botsearch.conf
```

**Häufige Ursachen:**

1. **Nginx gibt 200 statt 404 zurück**
```bash
# Testen
curl -I https://meine-domain.de/wp-admin

# Sollte: HTTP/2 404
# Ist aber: HTTP/2 200 (durch React SPA)
```

**Lösung:** Bot-Pfade in Nginx explizit blocken (siehe Nginx-Config)

2. **Filter erkennt Log-Format nicht**
```bash
# Log-Format prüfen
sudo tail /var/log/nginx/access.log

# Pattern-Test
sudo fail2ban-regex /var/log/nginx/access.log /etc/fail2ban/filter.d/nginx-botsearch.conf --print-all-matched
```

### 7.6 SSH-Aussperrung

**Symptom:** Kann mich nicht mehr per SSH einloggen

⚠️ **WICHTIG:** Deshalb IMMER eine Backup-Session offen lassen!

**Lösung via Server-Panel (Hetzner, Netcup, etc.):**

1. Via Web-Console einloggen
2. SSH-Config zurücksetzen:
```bash
sudo nano /etc/ssh/sshd_config
# PasswordAuthentication yes (temporär)
sudo systemctl restart sshd
```

3. Per Passwort einloggen
4. SSH-Keys debuggen:
```bash
# Permissions prüfen
ls -la ~/.ssh/

# Sollte sein:
# .ssh/             → 700
# authorized_keys   → 600

# Korrigieren
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

## 🎯 8. Erreichte Sicherheits-Level

### Vorher (unsicherer Standard):

- ❌ HTTP-only (unverschlüsselte Übertragung)
- ❌ Passwort-Login aktiv (Brute-Force-Angriffe möglich)
- ❌ Root-Login erlaubt (volle Kontrolle bei Einbruch)
- ❌ Keine automatische Angriffserkennung
- ❌ Bot-Scanner können ungehindert scannen

### Nachher (gehärtetes Production-Setup):

- ✅ **HTTPS erzwungen** mit A+ Rating (TLS 1.2+)
- ✅ **SSH Key-only Authentication** (Passwort-Login unmöglich)
- ✅ **Root-Login blockiert** (zusätzliche Sicherheitsebene)
- ✅ **Fail2Ban aktiv** (6 Jails, automatisches IP-Banning)
- ✅ **Bot-Pfade blocken** (404 für wp-admin, phpmyadmin, etc.)
- ✅ **Firewall via iptables** (nur benötigte Ports offen)
- ✅ **Automatische SSL-Renewal** (kein manueller Eingriff)

### Typische Angriffs-Statistik nach 24h:

- 🔴 20-50 gebannte IPs pro Tag
- 🔴 0 erfolgreiche SSH-Einbrüche
- 🔴 0 erfolgreiche Web-Exploits
- 🟢 100% Uptime

---

## 📈 9. Performance & Best Practices

### 9.1 Nginx Performance-Optimierungen

**In `/etc/nginx/nginx.conf` im `http {}` Block:**
```nginx
# Gzip Compression (reduziert Bandbreite um ~70%)
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript 
           application/x-javascript application/xml+rss 
           application/javascript application/json;

# Connection Keepalive
keepalive_timeout 65;
keepalive_requests 100;

# File Caching
open_file_cache max=1000 inactive=20s;
open_file_cache_valid 30s;
open_file_cache_min_uses 2;
open_file_cache_errors on;
```

**In Server-Block:**
```nginx
# Browser-Caching für Static Assets
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}

# HTML nicht cachen (für Updates)
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### 9.2 Security Headers
```nginx
# In server {} Block:

# Clickjacking-Schutz
add_header X-Frame-Options "SAMEORIGIN" always;

# MIME-Type Sniffing verhindern
add_header X-Content-Type-Options "nosniff" always;

# XSS-Schutz (Legacy-Browser)
add_header X-XSS-Protection "1; mode=block" always;

# Referrer Policy
add_header Referrer-Policy "no-referrer-when-downgrade" always;

# Content Security Policy (CSP)
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

**Test Security Headers:**
```bash
# Online-Tools:
# - https://securityheaders.com
# - https://observatory.mozilla.org

# Command-Line:
curl -I https://meine-domain.de | grep -i "x-frame\|x-content\|x-xss"
```

### 9.3 Vite Build-Optimierungen

**In `vite.config.js`:**
```javascript
export default {
  build: {
    // Source Maps nur für Development
    sourcemap: false,
    
    // Chunk-Size Optimierung
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
        }
      }
    },
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // console.log entfernen
      }
    }
  }
}
```

### 9.4 Monitoring Setup

**Server-Ressourcen überwachen:**
```bash
# CPU & RAM
htop

# Disk Usage
df -h
du -sh ~/apps/*

# Nginx Connections
sudo netstat -an | grep :80 | wc -l
```

**Log-Rotation konfigurieren:**
```bash
# Datei: /etc/logrotate.d/nginx
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

---

## 📝 10. Wichtige Dateien & Pfade

### System-Konfiguration

| Datei/Ordner | Zweck | Backup-Priority |
|--------------|-------|-----------------|
| `/etc/nginx/sites-available/` | Nginx Server-Configs | 🔴 Hoch |
| `/etc/nginx/nginx.conf` | Nginx Haupt-Config | 🔴 Hoch |
| `/etc/ssh/sshd_config` | SSH-Server Konfiguration | 🔴 Hoch |
| `/etc/fail2ban/jail.local` | Fail2Ban Jail-Config | 🔴 Hoch |
| `/etc/letsencrypt/` | SSL-Zertifikate & Keys |
| `/etc/ssh/sshd_config` | SSH-Server Konfiguration |
| `/etc/fail2ban/jail.local` | Fail2Ban Jail-Config |
| `/var/log/nginx/access.log` | Nginx Access-Log |
| `/var/log/nginx/error.log` | Nginx Error-Log |
| `/var/log/fail2ban.log` | Fail2Ban Log |
| `~/.ssh/authorized_keys` | Autorisierte SSH-Keys |
---

## ✅ 11. Checkliste für neues Deployment

- [ ] Server mit SSH-Key zugänglich
- [ ] Git, Node.js, Nginx installiert
- [ ] Repository geklont
- [ ] `npm install && npm run build`
- [ ] Dateiberechtigungen: `www-data:www-data`, `755`/`644`
- [ ] Nginx-Config erstellt & aktiviert
- [ ] SSL-Zertifikat mit Certbot
- [ ] SSH gehärtet (Key-only, kein Root)
- [ ] Fail2Ban installiert & konfiguriert
- [ ] Bot-Pfade in Nginx blockiert
- [ ] Nginx & Fail2Ban testen
- [ ] Monitoring eingerichtet

---