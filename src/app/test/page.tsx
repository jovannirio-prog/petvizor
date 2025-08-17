export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Тестовая страница</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium mb-4">Статус:</h2>
          <p className="text-green-600">✅ Страница работает!</p>
          <p className="text-gray-600 mt-2">Время: {new Date().toLocaleString()}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Следующие шаги:</h3>
          <div className="space-y-2 text-blue-800">
            <p>1. Если эта страница работает, то роутинг в порядке</p>
            <p>2. Попробуйте: <code>/api/health</code></p>
            <p>3. Попробуйте: <code>/api/debug-env</code></p>
            <p>4. Если API работает, но страницы нет - проблема в кеше</p>
          </div>
        </div>
      </div>
    </div>
  )
}
