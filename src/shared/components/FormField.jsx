import { forwardRef } from 'react'

const inputBase =
  'py-2 px-3 border border-gray-300 dark:border-odoo-dark-border rounded-lg text-[0.9rem] bg-white dark:bg-odoo-dark-surface text-gray-900 dark:text-odoo-dark-text placeholder:text-gray-500 dark:placeholder:text-odoo-dark-muted focus:outline-none focus:border-odoo-primary dark:focus:border-odoo-primary focus:ring-1 focus:ring-odoo-primary/25'
const inputInvalid =
  'border-red-600 dark:border-red-500 bg-red-50 dark:bg-red-950/40 focus:border-red-600 dark:focus:border-red-500 focus:ring-red-600/25'
const errorText = 'text-[0.8rem] text-red-600 dark:text-red-400'
const textareaExtra = 'resize-y min-h-16'

const FormField = forwardRef(function FormField(
  {
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    inputMode,
    pattern,
    rows,
    optionalLabel,
    inputClassName,
    invalidClassName,
    errorClassName,
    textareaClassName,
    autoComplete,
    required,
  },
  ref,
) {

  const id = `error-${name}`
  const hasError = Boolean(error)

  const inputClasses = [
    inputClassName ?? inputBase,
    hasError && (invalidClassName ?? inputInvalid),
  ]
    .filter(Boolean)
    .join(' ')

  const displayLabel = optionalLabel ? `${label} ${optionalLabel}` : label

  const commonProps = {
    ref,
    id: name,
    name,
    value: value ?? '',
    onChange,
    'aria-invalid': hasError,
    'aria-describedby': hasError ? id : undefined,
    autoComplete,
    required,
  }

  return (
    <label htmlFor={name} className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-odoo-dark-muted">
      {displayLabel}
      {type === 'textarea' ? (
        <textarea
          {...commonProps}
          rows={rows ?? 3}
          className={`${inputClasses} ${textareaClassName ?? textareaExtra}`.trim()}
        />
      ) : (
        <input
          type={type}
          {...commonProps}
          className={inputClasses}
          placeholder={placeholder}
          inputMode={inputMode}
          pattern={pattern}
        />
      )}
      {error && (
        <span id={id} className={errorClassName ?? errorText} role="alert">
          {error}
        </span>
      )}
    </label>
  )
})

export default FormField
