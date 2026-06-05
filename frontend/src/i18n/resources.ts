import { commonResources, notificationResources, deepMerge } from '@ceedcv-maya/shared-i18n-react'

import esCommon from './locales/es/common.json'
import esAuth from './locales/es/auth.json'

import vaCommon from './locales/va/common.json'
import vaAuth from './locales/va/auth.json'

import enCommon from './locales/en/common.json'
import enAuth from './locales/en/auth.json'

export const SUPPORTED_LOCALES = ['es', 'va', 'en'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: SupportedLocale = 'es'

export const NAMESPACES = ['common', 'auth', 'notifications'] as const
export type Namespace = (typeof NAMESPACES)[number]

// Cada namespace fusiona el canon shared con sus strings locales. Local
// siempre gana en colisión gracias al orden del spread.
const baseEs = commonResources.es.common
const baseVa = commonResources.va.common
const baseEn = commonResources.en.common

export const resources = {
  es: { common: deepMerge(baseEs, esCommon), auth: deepMerge(baseEs, esAuth), notifications: notificationResources.es.notifications },
  va: { common: deepMerge(baseVa, vaCommon), auth: deepMerge(baseVa, vaAuth), notifications: notificationResources.va.notifications },
  en: { common: deepMerge(baseEn, enCommon), auth: deepMerge(baseEn, enAuth), notifications: notificationResources.en.notifications },
} as const
