// TODO: replace mock with real PATCH /api/v1/profile endpoint when available
async function updateProfile<T>(updates: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return updates
}

export { updateProfile }
