import '../styles/layout.css'

function PageHeader({ title, subtitle, rightAction }) {
    return (
        <header className="page-header">
            <div>
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
            </div>

            {rightAction}
        </header>
    )
}

export default PageHeader