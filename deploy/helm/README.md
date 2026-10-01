# Chart de maya-dashboard

Chart fino sobre [`maya-common`](https://github.com/Maya-AQSS/maya_platform/tree/main/charts/maya-common):
todo el despliegue (api, worker, scheduler, reverb, frontend, Job de migración,
Ingress, NetworkPolicy, Vault) vive en el library chart; aquí solo están los
valores de esta app (`values.yaml`).

- Imágenes: `10.224.237.240:5000/maya/maya-dashboard-{api,worker,reverb,frontend}:<tag>`.
- Publicación: el workflow `build-and-publish.yml` (reutilizable `build-app.yml` de
  maya_platform) empaqueta este chart con la versión de la release y lo sube a GHCR
  (`oci://ghcr.io/maya-aqss/charts/maya-dashboard`); IaC lo copia a la registry interna
  (`oci://registry.ceedcv.es/charts`) junto con las imágenes.
- Desarrollo: `IaC/.github/workflows/dev-deploy.yml` (K3s de desarrollo, `IaC/dev/PLAN.md`).
- Despliegue: `helmfile` en IaC (`prod/02-layer-sw`), con `MAYA_DASHBOARD_VERSION`.

Prueba local del render (necesita `helm dependency update` con acceso a GHCR,
o el chart maya-common copiado en `charts/`):

```bash
helm dependency update deploy/helm
helm template maya-dashboard deploy/helm -n maya-dashboard --set image.tag=1.0.0 | kubeconform -strict
```
