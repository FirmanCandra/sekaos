# Rule: Git Commit, Push & Branching Policy

## Scope
Berlaku untuk semua task pembaruan kode, bug fixing, pembuatan fitur, dan dokumentasi di repositori Sekaos.

## Requirements
1. **Always Push Updates**: Setiap kali menyelesaikan tugas atau membuat perubahan yang signifikan pada kode, AI Agent WAJIB mengeksekusi `git add`, `git commit -m "..."`, dan `git push origin <branch>`.
2. **Branch Management**:
   - Selalu kembangkan di branch `main` terlebih dahulu.
   - Sinkronisasikan / merge ke branch `production` untuk kode yang siap rilis.
3. **Pre-push Verification**:
   - Pastikan `npm run build` sukses sebelum push.
   - Jangan pernah menyertakan file `.env` atau token privat ke dalam commit.
4. **CI/CD Compliance**:
   - Pastikan perubahan mematuhi alur GitHub Actions yang didefinisikan di `.github/workflows/`.
