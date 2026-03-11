import styles from './DashboardCard.module.css'

function DashboardCard({ application }) {
  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{application.name}</h3>
      <p className={styles.category}>{application.category}</p>
      <p className={styles.description}>{application.description}</p>
    </article>
  )
}

export default DashboardCard