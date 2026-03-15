import ToolsCard from './ToolsCard'
import { useLocale } from '../../../shared/i18n'

function ToolsGrid({ tools, onToggleFavorite, showLastUsed }) {
    const { t } = useLocale()
    if (!tools || tools.length === 0) return <p className="text-gray-900 dark:text-odoo-dark-text">{t('tools.noTools')}</p>

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
            {tools.map((tool) => (
                <ToolsCard
                    key={tool.id}
                    tool={tool}
                    onToggleFavorite={onToggleFavorite}
                    showLastUsed={showLastUsed}
                />
            ))}
        </div>
    );
}

export default ToolsGrid;