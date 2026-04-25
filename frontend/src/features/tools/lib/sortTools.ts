function sortToolsByName(tools) {
  return [...tools].sort((a, b) => a.name.localeCompare(b.name))
}

function sortByLastUsedAtDesc(tools) {
  return [...tools].sort((a, b) => {
    const aValue = a.lastUsedAt ?? ''
    const bValue = b.lastUsedAt ?? ''
    return bValue.localeCompare(aValue)
  })
}

export { sortToolsByName, sortByLastUsedAtDesc }
