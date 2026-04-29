function getApiBaseUrl() {
 return (import.meta.env.VITE_API_URL ||'').replace(/\/$/,'')
}

async function getDashboardLayout(userId, token) {
 if (!userId || !token) {
 throw new Error('dashboardLayout.errorLoad')
 }

 const baseUrl = getApiBaseUrl()

 if (!baseUrl) {
 throw new Error('dashboardLayout.errorConfig')
 }

 const url =`${baseUrl}/dashboard/user/${encodeURIComponent(userId)}/dashboard-layout`
 let response
 const controller = new AbortController()
 const timeoutId = setTimeout(() => controller.abort(), 10000)

 try {
 response = await fetch(url, {
 method:'GET',
 signal: controller.signal,
 headers: {
'Accept':'application/json',
'Authorization':`Bearer ${token}`,
 },
 })
 } catch {
 throw new Error('dashboardLayout.errorNetwork')
 } finally {
 clearTimeout(timeoutId)
 }

 if (!response.ok) {
 if (response.status === 401) throw new Error('dashboardLayout.errorUnauthorized')
 if (response.status === 403) throw new Error('dashboardLayout.errorForbidden')
 if (response.status >= 500) throw new Error('dashboardLayout.errorServer')
 throw new Error('dashboardLayout.errorLoad')
 }

 return await response.json()
}

async function updateDashboardLayout(userId, layout, token) {
 if (!userId || !token) {
 throw new Error('dashboardLayout.errorSave')
 }

 const baseUrl = getApiBaseUrl()

 if (!baseUrl) {
 throw new Error('dashboardLayout.errorConfig')
 }

 const url =`${baseUrl}/dashboard/user/${encodeURIComponent(userId)}/dashboard-layout`
 let response
 const controller = new AbortController()
 const timeoutId = setTimeout(() => controller.abort(), 10000)

 try {
 response = await fetch(url, {
 method:'PUT',
 signal: controller.signal,
 headers: {
'Accept':'application/json',
'Content-Type':'application/json',
'Authorization':`Bearer ${token}`,
 },
 body: JSON.stringify({ layout }),
 })
 } catch {
 throw new Error('dashboardLayout.errorNetwork')
 } finally {
 clearTimeout(timeoutId)
 }

 if (!response.ok) {
 if (response.status === 401) throw new Error('dashboardLayout.errorUnauthorized')
 if (response.status === 403) throw new Error('dashboardLayout.errorForbidden')
 if (response.status === 422) throw new Error('dashboardLayout.errorValidation')
 if (response.status >= 500) throw new Error('dashboardLayout.errorServer')
 throw new Error('dashboardLayout.errorSave')
 }

 return await response.json()
}

export { getDashboardLayout, updateDashboardLayout }
