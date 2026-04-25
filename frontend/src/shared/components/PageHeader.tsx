function PageHeader({ title, rightAction, centerTitleOnMobile = false }) {
  return (
    <header className="w-full mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className={`min-w-0 ${centerTitleOnMobile ? 'w-full sm:w-auto' : ''}`}>
        <h2
          className={`mt-2 sm:mt-4 mb-1 text-[1.05rem] sm:text-[1.4rem] text-text-primary dark:text-text-dark-primary ${centerTitleOnMobile ? 'text-center sm:text-left' : ''}`}
        >
          {title}
        </h2>
      </div>

      {rightAction && <div className="w-full sm:w-auto flex justify-center sm:justify-end flex-shrink-0">{rightAction}</div>}
    </header>
  )
}

export default PageHeader