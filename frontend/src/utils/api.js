const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '')
export const API_BASE =
  configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:3050' : '')

export const buildAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {})
})

export const getJson = async (response) => {
  const data = await response.json()
  if (!response.ok) {
    const message = data?.message || 'Request failed'
    throw new Error(message)
  }
  return data
}
