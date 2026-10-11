# Deploy — Docker on 167.233.87.63:5050 via GitHub Actions

The app is a static site. The image builds it with Node and serves `dist/` with nginx inside the container.
The container listens on 80 and is published on host port **5050**, so it doesn't touch your other apps.

```
push to main ─► CI: typecheck + puzzle tests ─► build image ─► push ghcr.io/<owner>/floorplans ─► SSH: docker pull + run -p 5050:80
```

## One-time setup

### 1. GitHub repository
Create an empty repository on GitHub, then from `C:\Game`:

```bash
git remote add origin https://github.com/<owner>/<repo>.git
```

```bash
git push -u origin master
```

### 2. Deploy key on the server
On your own machine, make a key used only for deployments:

```bash
ssh-keygen -t ed25519 -f floorplans_deploy -N "" -C "github-deploy"
```

Append `floorplans_deploy.pub` to `~/.ssh/authorized_keys` of the deploy user on the server.
That user must be able to run Docker without sudo:

```bash
sudo usermod -aG docker <deploy-user>
```

Open the port if a firewall is active:

```bash
sudo ufw allow 5050/tcp
```

### 3. Repository secrets
GitHub → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Value |
|---|---|
| `SSH_HOST` | `167.233.87.63` |
| `SSH_USER` | the deploy user |
| `SSH_KEY` | the full content of the private key `floorplans_deploy` |
| `SSH_PORT` | only if SSH is not on 22 |
| `SSH_PASSWORD` | optional: use instead of `SSH_KEY` if the server allows password login (then delete `SSH_KEY`) |

`SSH_KEY` must be the **private** key file (no `.pub`), pasted whole, from `-----BEGIN OPENSSH PRIVATE KEY-----`
to `-----END OPENSSH PRIVATE KEY-----`. The error `ssh: no key found` means the secret holds something else.

The image is pushed to GitHub Container Registry with the workflow's own token; no extra secret is needed.

## Every deploy
Push to `main`/`master`, or run **Deploy** manually from the Actions tab. The workflow replaces only the
container named `floorplans`, keeps the last 3 images, and fails if `http://127.0.0.1:5050/healthz` doesn't answer.

## Manual run on the server (without GitHub)

```bash
git clone https://github.com/<owner>/<repo>.git floorplans && cd floorplans && docker compose up -d --build
```

## HTTPS and installing as an app
Browsers only allow service workers and "Install app" on **HTTPS** (or localhost). On `http://167.233.87.63:5050`
the game works fully, but it won't install as a PWA or work offline. To get installable:
- point any domain (or a free `167-233-87-63.sslip.io` name) at the server and put it behind a reverse proxy with
  Let's Encrypt (Caddy, Traefik or nginx-proxy), proxying to `127.0.0.1:5050`. This needs ports 80/443 on the host;
  if your other apps already use a reverse proxy there, add one more site to it.
