function PageSkeleton() {
  return (
    <div className="min-h-screen bg-ui-body dark:bg-ui-dark-bg flex items-start justify-center pt-20">
      <div className="w-full max-w-2xl px-8 flex flex-col gap-4 animate-pulse">
        <div className="h-6 w-48 bg-ui-border-l dark:bg-ui-dark-border rounded-lg" />
        <div className="h-4 w-full bg-ui-border-l dark:bg-ui-dark-border rounded-lg" />
        <div className="h-4 w-3/4 bg-ui-border-l dark:bg-ui-dark-border rounded-lg" />
        <div className="mt-4 h-32 w-full bg-ui-border-l dark:bg-ui-dark-border rounded-2xl" />
      </div>
    </div>
  )
}

export default PageSkeleton
