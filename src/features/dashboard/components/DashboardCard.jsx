function DashboardCard({ application }) {
    return (
        <div className="dashboard-card">
            <h3 className="dashboard-card-title">{application.name}</h3>
            <p className="dashboard-card-category">{application.category}</p>
            <p className="dashboard-card-description">{application.description}</p>
        </div>
    )
}

export default DashboardCard