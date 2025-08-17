import { supabase } from './supabase'

export async function apiRequest(url: string, options: RequestInit = {}) {
  try {
    // Получаем текущую сессию
    const { data: { session } } = await supabase.auth.getSession()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    // Добавляем токен авторизации если есть
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

export async function apiUpload(url: string, formData: FormData) {
  try {
    // Получаем текущую сессию
    const { data: { session } } = await supabase.auth.getSession()
    
    const headers: Record<string, string> = {}

    // Добавляем токен авторизации если есть
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API upload error:', error)
    throw error
  }
}
