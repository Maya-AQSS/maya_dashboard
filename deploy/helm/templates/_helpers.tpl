{{/* vim: set filetype=mustache: */}}
{{/*
Maya Dashboard — chart helpers.
*/}}

{{- define "maya-dashboard.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "maya-dashboard.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{- define "maya-dashboard.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "maya-dashboard.labels" -}}
helm.sh/chart: {{ include "maya-dashboard.chart" . }}
app.kubernetes.io/name: {{ include "maya-dashboard.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: maya
{{- end -}}

{{- define "maya-dashboard.selectorLabels" -}}
app.kubernetes.io/name: {{ include "maya-dashboard.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "maya-dashboard.componentSelector" -}}
{{ include "maya-dashboard.selectorLabels" . }}
app.kubernetes.io/component: {{ .component }}
{{- end -}}

{{/* Construye la referencia completa de la imagen. */}}
{{- define "maya-dashboard.image" -}}
{{- $registry := .root.Values.image.registry -}}
{{- $repo := .root.Values.image.repository -}}
{{- $name := .name -}}
{{- $tag := default .root.Values.image.tag .root.Chart.AppVersion -}}
{{- if $registry -}}
{{- printf "%s/%s/%s:%s" $registry $repo $name $tag -}}
{{- else -}}
{{- printf "%s/%s:%s" $repo $name $tag -}}
{{- end -}}
{{- end -}}

{{/* envFrom estándar (config + secret) para todos los pods backend. */}}
{{- define "maya-dashboard.envFrom" -}}
- configMapRef:
    name: {{ include "maya-dashboard.fullname" . }}-config
- secretRef:
    name: {{ .Values.secret.name }}
    optional: false
{{- end -}}

{{/* Volúmenes writable (tmpfs / emptyDir) requeridos por readOnlyRootFilesystem. */}}
{{- define "maya-dashboard.writableVolumes" -}}
- name: tmp
  emptyDir: {}
- name: storage-framework
  emptyDir: {}
- name: storage-logs
  emptyDir: {}
- name: bootstrap-cache
  emptyDir: {}
{{- end -}}

{{- define "maya-dashboard.writableVolumeMounts" -}}
- name: tmp
  mountPath: /tmp
- name: storage-framework
  mountPath: /var/www/html/storage/framework
- name: storage-logs
  mountPath: /var/www/html/storage/logs
- name: bootstrap-cache
  mountPath: /var/www/html/bootstrap/cache
{{- end -}}
