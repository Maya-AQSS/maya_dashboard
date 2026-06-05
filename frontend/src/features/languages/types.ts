/** Un idioma disponible (GET /api/v1/languages, origen Odoo res.lang). */
export interface Language {
  code: string
  name: string
  is_default: boolean
}
