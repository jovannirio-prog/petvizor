'use client'

export default function ClearAuthButton() {
  const handleClearAuth = () => {
    localStorage.removeItem('supabase_access_token')
    localStorage.removeItem('supabase_refresh_token')
    window.location.reload()
  }

  return (
    <div className="mt-4 text-center">
      <button
        onClick={handleClearAuth}
        className="text-sm text-gray-500 hover:text-gray-700 underline"
      >
        Очистить авторизацию (для тестирования)
      </button>
    </div>
  )
}
