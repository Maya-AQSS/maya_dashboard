import DashboardCard from './DashboardCard'

function DashboardCards({ applications }) {

    if (!applications || applications.length === 0) return <div>No hay aplicaciones para mostrar</div>

    return (
        <div className="dashboard-grid">
            {applications.map((app) => (
                <DashboardCard key={app.id} application={app} />
            ))}
        </div>
    )
}

export default DashboardCards