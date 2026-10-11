#!/usr/bin/env python3
"""
Sekaos Project - Production Release & Hostinger Deployer
1. Mem-build bundle React Vite ke folder dist/
2. Meng-commit isi dist/ ke branch 'production' sebagai root
3. Melakukan push ke origin production (memuaskan Hostinger Git deployment)
4. Memastikan server Hostinger ter-update dengan git reset --hard origin/production
5. Verifikasi HTTP 200 OK di domain live
"""

import os
import subprocess
import sys
import paramiko
import urllib.request

HOST = '46.202.186.254'
PORT = 65002
USER = 'u267893077'
PASS = 'Setiket*06'
REMOTE_PATH = 'domains/snow-sparrow-521382.hostingersite.com/public_html'
LIVE_URL = 'https://snow-sparrow-521382.hostingersite.com/'

def run_cmd(cmd, check=True):
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if check and res.returncode != 0:
        print(f"[ERROR] Command failed: {cmd}\n{res.stderr}")
        sys.exit(1)
    return res.stdout.strip()

def build():
    print("[1/5] Membangun bundle produksi (npm run build)...")
    run_cmd('npm.cmd run build' if os.name == 'nt' else 'npm run build')
    print("[SUCCESS] Build selesai!")

def update_production_branch():
    print("[2/5] Menyiapkan branch 'production' dengan artefak terkompilasi...")
    # Add dist to git index temporarily
    run_cmd('git add -f dist')
    
    # Write tree with dist as prefix
    tree_id = run_cmd('git write-tree --prefix=dist')
    
    # Get current production parent commit
    parent_commit = run_cmd('git rev-parse production', check=False)
    parent_arg = f'-p {parent_commit}' if parent_commit else ''
    
    # Create commit
    msg = "release(production): bundle React SPA dan PHP MySQL API siap saji Hostinger"
    commit_cmd = f'git commit-tree {tree_id} {parent_arg} -m "{msg}"'
    commit_id = run_cmd(commit_cmd)
    
    # Update local production ref
    run_cmd(f'git update-ref refs/heads/production {commit_id}')
    
    # Reset dist from index on current branch
    run_cmd('git reset HEAD dist', check=False)
    print(f"[SUCCESS] Branch 'production' lokal berhasil diperbarui ({commit_id[:8]})!")

def push_production():
    print("[3/5] Melakukan push branch 'production' ke GitHub...")
    run_cmd('git push origin production')
    print("[SUCCESS] Branch 'production' berhasil di-push ke GitHub!")

def sync_hostinger():
    print(f"[4/5] Sinkronisasi ke Hostinger SSH ({HOST}:{PORT})...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
        
        # Di Hostinger public_html: fetch dan reset ke origin/production
        remote_cmd = f"cd {REMOTE_PATH} && git fetch origin production && git reset --hard origin/production && git clean -fd"
        stdin, stdout, stderr = client.exec_command(remote_cmd)
        out = stdout.read().decode('utf-8')
        err = stderr.read().decode('utf-8')
        print("[HOSTINGER GIT SYNC]:")
        if out: print(out.strip())
        if err: print(err.strip())
        
        client.close()
        print("[SUCCESS] Server Hostinger berhasil disinkronkan ke rilis produksi!")
    except Exception as e:
        print(f"[WARNING] Gagal sinkronisasi SSH langsung: {e}. Hostinger webhook akan otomatis menarik perubahan.")

def verify():
    print(f"[5/5] Verifikasi live status di {LIVE_URL}...")
    try:
        req = urllib.request.Request(LIVE_URL, headers={'User-Agent': 'Mozilla/5.0', 'Cache-Control': 'no-cache'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode('utf-8')
            if 'main.jsx' in content:
                print("[ERROR] Server masih menyajikan raw main.jsx!")
                sys.exit(1)
            elif 'assets/index-' in content:
                print(f"[LIVE] HTTP {resp.status} OK - Bundle produksi aktif!")
            else:
                print(f"[LIVE] HTTP {resp.status} OK")
    except Exception as e:
        print(f"[ERROR] Verifikasi gagal: {e}")
        sys.exit(1)

if __name__ == '__main__':
    build()
    update_production_branch()
    push_production()
    sync_hostinger()
    verify()
    print("\n🎉 DEPLOYMENT SELESAI! Website aktif tanpa layar putih!")
