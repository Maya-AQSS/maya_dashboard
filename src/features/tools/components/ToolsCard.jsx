import { useState } from 'react'
import styles from './ToolsCard.module.css'

function ToolsCard({ tool, onToggleFavorite, showLastUsed }) {

  const isFavorite = Boolean(tool.isFavorite)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleStarClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    onToggleFavorite(tool.id)
    setShowConfirm(false)
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  const formattedLastUsedAt = tool.lastUsedAt
    ? new Date(tool.lastUsedAt).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : 'Sin datos'

  const title = isFavorite
    ? `Quitar ${tool.name} de favoritas`
    : `Añadir ${tool.name} a favoritas`

  const message = isFavorite
    ? 'Esta herramienta dejará de aparecer en tu listado de favoritas.'
    : 'Esta herramienta aparecerá en tu listado de favoritas.'

  return (
    <>
      <article className={styles.card}>
        <header className={styles.header}>

          <button
            type="button"
            className={styles.favoriteBadge}
            onClick={handleStarClick}
            aria-label={isFavorite ? 'Quitar de favoritas' : 'Añadir a favoritas'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </header>

        <a
          href={tool.documentationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cardLink}
        >
          <h3 className={styles.title}>{tool.name}</h3>
          <p className={styles.description}>{tool.description}</p>
          {showLastUsed && (
            <p className={styles.lastUsedAt}>Último uso: {formattedLastUsedAt}</p>
          )}
        </a>
      </article>

      {showConfirm && (
        <div className={styles.confirmOverlay} onClick={handleCancel}>
          <div
            className={styles.confirmDialog}
            onClick={(event) => event.stopPropagation()}
          >
            <h4 className={styles.confirmTitle}>{title}</h4>
            <p className={styles.confirmMessage}>{message}</p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.confirmButtonSecondary}
                onClick={handleCancel}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.confirmButton}
                onClick={handleConfirm}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}


export default ToolsCard