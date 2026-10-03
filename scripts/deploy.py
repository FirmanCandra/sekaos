#!/usr/bin/env python3
"""
Sekaos Project - Automated Hostinger Deployer
Membangun bundle React (Vite) dan mengunggah langsung ke public_html Hostinger via SFTP.
"""

import os
import subprocess
import sys
import paramiko
import urllib.request

# Ensure UTF-8 output on Windows terminals
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

HOST = '46.202.186.254'
PORT = 65002
USER = 'u267893077'
PASS = 'Sekaos*06'
REMOTE_PATH = 'domains/snow-sparrow-521382.hostingersite.com/public_html'
LOCAL_PATH = 'dist'
LIVE_URL = 'https://snow-sparrow-521382.hostingersite.com/'

def run_build():
    print("[1/3] Menjalankan 'npm run build'...")
    cmd = 'npm.cmd run build' if os.name == 'nt' else 'npm run build'
    res = subprocess.run(cmd, shell=True)
    if res.returncode != 0:
        print("[ERROR] Build gagal! Deployment dibatalkan.")
        sys.exit(1)
    print("[SUCCESS] Build berhasil!")

def deploy():
    print(f"[2/3] Menghubungkan ke Hostinger SSH ({HOST}:{PORT})...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
        sftp = client.open_sftp()
        print("[SUCCESS] Terhubung ke Hostinger SFTP!")

        # Pastikan folder target ada
        try:
            sftp.stat(REMOTE_PATH)
        except IOError:
            print(f"[INFO] Membuat direktori {REMOTE_PATH}...")
            sftp.mkdir(REMOTE_PATH)

        print(f"[3/3] Mengunggah aset terkompilasi dari '{LOCAL_PATH}' ke '{REMOTE_PATH}'...")
        total_files = 0
        for root, dirs, files in os.walk(LOCAL_PATH):
            rel_path = os.path.relpath(root, LOCAL_PATH)
            dest_dir = REMOTE_PATH if rel_path == '.' else os.path.join(REMOTE_PATH, rel_path).replace('\\', '/')
            
            try:
                sftp.mkdir(dest_dir)
            except IOError:
                pass
                
            for file in files:
                src_file = os.path.join(root, file)
                dest_file = os.path.join(dest_dir, file).replace('\\', '/')
                sftp.put(src_file, dest_file)
                total_files += 1

        print(f"[SUCCESS] Berhasil mengunggah {total_files} file ke Hostinger!")
        sftp.close()
        client.close()

        # Verifikasi live web
        print(f"[VERIFY] Memverifikasi status website di {LIVE_URL}...")
        req = urllib.request.Request(LIVE_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"[LIVE] HTTP Status: {resp.status} OK!")
            print(f"[DONE] Website aktif dan dapat diakses di: {LIVE_URL}")

    except Exception as e:
        print(f"[ERROR] Error saat deploy: {e}")
        sys.exit(1)

if __name__ == '__main__':
    run_build()
    deploy()
