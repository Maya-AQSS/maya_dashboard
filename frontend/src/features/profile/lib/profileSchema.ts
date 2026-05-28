import { z } from 'zod'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DNI_REGEX = /^[0-9]{8}[A-Z]$/i
const PHONE_MIN_DIGITS = 9
const POSTAL_CODE_REGEX = /^[0-9]{5}$/
const NUMERIC_ONLY = /^\d+$/
const STREET_MIN_LENGTH = 4
const HAS_LETTER = /[a-zA-ZáéíóúñÑÀ-ÿ]/

type Translator = (key: string, opts?: Record<string, unknown>) => string

/**
 * Factory that builds the Zod schema with translated error messages.
 * The backend currently has no `/me/profile` write endpoint; validation
 * lives on the client until the persistence layer is added.
 */
export function createProfileFormSchema(t: Translator) {
  const requireTrimmed = (key: string) =>
    z
      .string()
      .transform((s) => s.trim())
      .refine((s) => s.length > 0, { message: t(key) })

  const optionalNumeric = (key: string) =>
    z
      .string()
      .transform((s) => s.trim())
      .refine((s) => s === '' || NUMERIC_ONLY.test(s), { message: t(key) })

  return z.object({
    name: requireTrimmed('profile.validation.nameRequired'),
    surname: requireTrimmed('profile.validation.surnameRequired'),
    username: requireTrimmed('profile.validation.usernameRequired'),
    email: z
      .string()
      .transform((s) => s.trim())
      .superRefine((value, ctx) => {
        if (!value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('profile.validation.emailRequired'),
          })
        } else if (!EMAIL_REGEX.test(value)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('profile.validation.emailInvalid'),
          })
        }
      }),
    phone: z
      .string()
      .transform((s) => s.trim())
      .superRefine((value, ctx) => {
        if (!value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('profile.validation.phoneRequired'),
          })
          return
        }
        const digits = value.replace(/\D/g, '')
        if (digits.length < PHONE_MIN_DIGITS) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('profile.validation.phoneMinDigits', { count: PHONE_MIN_DIGITS }),
          })
        }
      }),
    role: requireTrimmed('profile.validation.roleRequired'),
    dni: z
      .string()
      .transform((s) => s.trim())
      .superRefine((value, ctx) => {
        if (!value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('profile.validation.dniRequired'),
          })
        } else if (!DNI_REGEX.test(value)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('profile.validation.dniFormat'),
          })
        }
      }),
    street: z
      .string()
      .transform((s) => s.trim())
      .superRefine((value, ctx) => {
        if (!value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('profile.validation.streetRequired'),
          })
          return
        }
        if (value.length < STREET_MIN_LENGTH) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('profile.validation.streetMinLength', { count: STREET_MIN_LENGTH }),
          })
          return
        }
        if (!HAS_LETTER.test(value)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('profile.validation.streetHasLetters'),
          })
        }
      }),
    addressNumber: z
      .string()
      .transform((s) => s.trim())
      .superRefine((value, ctx) => {
        if (!value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('profile.validation.addressNumberRequired'),
          })
        } else if (!NUMERIC_ONLY.test(value)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('profile.validation.addressNumberNumeric'),
          })
        }
      }),
    addressFloor: optionalNumeric('profile.validation.addressFloorNumeric'),
    addressDoor: optionalNumeric('profile.validation.addressDoorNumeric'),
    postalCode: z
      .string()
      .transform((s) => s.trim())
      .superRefine((value, ctx) => {
        if (!value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('profile.validation.postalCodeRequired'),
          })
        } else if (!POSTAL_CODE_REGEX.test(value)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('profile.validation.postalCodeDigits'),
          })
        }
      }),
    city: z
      .string()
      .transform((s) => s.trim())
      .superRefine((value, ctx) => {
        if (!value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('profile.validation.cityRequired'),
          })
          return
        }
        if (value.length < STREET_MIN_LENGTH) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('profile.validation.cityMinLength', { count: STREET_MIN_LENGTH }),
          })
          return
        }
        if (!HAS_LETTER.test(value)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('profile.validation.cityHasLetters'),
          })
        }
      }),
    bio: requireTrimmed('profile.validation.bioRequired'),
  })
}

export type ProfileFormInput = {
  name: string
  surname: string
  username: string
  email: string
  phone: string
  role: string
  dni: string
  street: string
  addressNumber: string
  addressFloor: string
  addressDoor: string
  postalCode: string
  city: string
  bio: string
}

export const emptyProfileForm: ProfileFormInput = {
  name: '',
  surname: '',
  username: '',
  email: '',
  phone: '',
  role: '',
  dni: '',
  street: '',
  addressNumber: '',
  addressFloor: '',
  addressDoor: '',
  postalCode: '',
  city: '',
  bio: '',
}

const CAR_REGISTRATION_REGEX = /^[0-9]{4}[A-Z]{3}$/

export function createEmployeeFormSchema(t: Translator) {
  return z.object({
    personal_email: z
      .string()
      .transform((s) => s.trim())
      .refine((s) => s === '' || EMAIL_REGEX.test(s), {
        message: t('profile.validation.personalEmailInvalid'),
      }),
    iban: z
      .string()
      .transform((s) => s.trim())
      .refine((s) => s === '' || s.length <= 34, {
        message: t('profile.validation.ibanTooLong'),
      }),
    car_registration_number_1: z
      .string()
      .transform((s) => s.trim().toUpperCase())
      .refine((s) => s === '' || CAR_REGISTRATION_REGEX.test(s), {
        message: t('profile.validation.carRegistrationFormat'),
      }),
    car_registration_number_2: z
      .string()
      .transform((s) => s.trim().toUpperCase())
      .refine((s) => s === '' || CAR_REGISTRATION_REGEX.test(s), {
        message: t('profile.validation.carRegistrationFormat'),
      }),
    car_registration_number_3: z
      .string()
      .transform((s) => s.trim().toUpperCase())
      .refine((s) => s === '' || CAR_REGISTRATION_REGEX.test(s), {
        message: t('profile.validation.carRegistrationFormat'),
      }),
  })
}

const _employeeSchemaShape = createEmployeeFormSchema((k) => k)
export type EmployeeFormInput = z.infer<typeof _employeeSchemaShape>

export const emptyEmployeeForm: EmployeeFormInput = {
  personal_email: '',
  iban: '',
  car_registration_number_1: '',
  car_registration_number_2: '',
  car_registration_number_3: '',
}
