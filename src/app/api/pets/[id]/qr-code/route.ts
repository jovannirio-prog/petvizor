import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import QRCode from 'qrcode'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 API QR Code: Начало генерации QR-кода для питомца:', params.id)
    
    const supabase = createClient()
    
    // Получаем питомца
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', params.id)
      .single()

    if (petError || !pet) {
      console.error('❌ API QR Code: Питомец не найден:', petError)
      return NextResponse.json({ error: 'Питомец не найден' }, { status: 404 })
    }

    // Создаем публичный URL для питомца
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
      : 'http://localhost:3000'
    const publicUrl = `${baseUrl}/pet/${pet.id}`
    
    console.log('🔧 API QR Code: Публичный URL:', publicUrl)

    // Генерируем QR-код как base64
    const qrCodeDataUrl = await QRCode.toDataURL(publicUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })

    console.log('🔧 API QR Code: QR-код сгенерирован')

    // Сохраняем QR-код в Supabase Storage
    const fileName = `qr-codes/${pet.id}.png`
    const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64')
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pet-photos')
      .upload(fileName, qrCodeBuffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      console.error('❌ API QR Code: Ошибка загрузки QR-кода:', uploadError)
      return NextResponse.json({ error: 'Ошибка сохранения QR-кода' }, { status: 500 })
    }

    // Получаем публичный URL QR-кода
    const { data: { publicUrl: qrCodeUrl } } = supabase.storage
      .from('pet-photos')
      .getPublicUrl(fileName)

    console.log('🔧 API QR Code: QR-код сохранен:', qrCodeUrl)

    // Обновляем запись питомца с URL QR-кода и изображением
    console.log('🔧 API QR Code: Обновляем запись питомца в базе данных')
    console.log('🔧 API QR Code: qr_code_url:', qrCodeUrl)
    console.log('🔧 API QR Code: qr_code_image length:', qrCodeDataUrl.length)
    
    const { error: updateError } = await supabase
      .from('pets')
      .update({
        qr_code_url: qrCodeUrl,
        qr_code_image: qrCodeDataUrl, // Сохраняем base64 изображение
        qr_code_updated_at: new Date().toISOString()
      })
      .eq('id', pet.id)

    if (updateError) {
      console.error('❌ API QR Code: Ошибка обновления питомца:', updateError)
      console.error('❌ API QR Code: Детали ошибки:', updateError.details)
      console.error('❌ API QR Code: Код ошибки:', updateError.code)
      return NextResponse.json({ error: 'Ошибка обновления питомца' }, { status: 500 })
    }

    console.log('✅ API QR Code: Запись питомца успешно обновлена в базе данных')

    console.log('✅ API QR Code: QR-код успешно сгенерирован и сохранен')

    return NextResponse.json({
      success: true,
      qr_code_url: qrCodeUrl,
      qr_code_image: qrCodeDataUrl, // Добавляем base64 изображение
      public_url: publicUrl,
      message: 'QR-код успешно сгенерирован'
    })

  } catch (error: any) {
    console.error('❌ API QR Code: Неожиданная ошибка:', error)
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 API QR Code: Получение QR-кода для питомца:', params.id)
    
    const supabase = createClient()
    
    // Получаем питомца с QR-кодом
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', params.id)
      .single()

    if (petError || !pet) {
      console.error('❌ API QR Code: Питомец не найден:', petError)
      return NextResponse.json({ error: 'Питомец не найден' }, { status: 404 })
    }

    console.log('🔧 API QR Code: Питомец найден:', pet.name)
    console.log('🔧 API QR Code: qr_code_url в базе:', pet.qr_code_url ? 'exists' : 'null')
    console.log('🔧 API QR Code: qr_code_image в базе:', pet.qr_code_image ? 'exists' : 'null')
    console.log('🔧 API QR Code: qr_code_image length:', pet.qr_code_image?.length || 0)

    // Создаем публичный URL для питомца
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
      : 'http://localhost:3000'
    const publicUrl = `${baseUrl}/pet/${pet.id}`

    return NextResponse.json({
      success: true,
      qr_code_url: pet.qr_code_url,
      qr_code_image: pet.qr_code_image, // Возвращаем base64 изображение
      public_url: publicUrl,
      qr_code_updated_at: pet.qr_code_updated_at,
      has_qr_code: !!pet.qr_code_image // Проверяем наличие изображения
    })

  } catch (error: any) {
    console.error('❌ API QR Code: Неожиданная ошибка:', error)
    return NextResponse.json({ 
      error: 'Внутренняя ошибка сервера',
      details: error.message 
    }, { status: 500 })
  }
}
