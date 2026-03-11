import styles from './DashboardCard.module.css'
import { Link } from 'react-router-dom'

function DashboardCard({ application }) {
    return (
        <article className={styles.card}>
            <h3 className={styles.title}>{application.name}</h3>
            <p className={styles.category}>{application.category}</p>
            <p className={styles.description}>{application.description}</p>

            <Link
                to={`/technologies/${application.id}`}
                className={`${styles.link} ${styles.button}`}
            >
                Ver detalle
            </Link>

        </article>
    )
}

export default DashboardCard