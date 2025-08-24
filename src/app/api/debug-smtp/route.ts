import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    smtpConfig: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || '587',
      user: process.env.SMTP_USER ? 'Настроен' : 'Не настроен',
      pass: process.env.SMTP_PASS ? 'Настроен' : 'Не настроен',
      from: process.env.SMTP_FROM || 'PetVizor <noreply@petvizor.com>',
      userLength: process.env.SMTP_USER?.length || 0,
      passLength: process.env.SMTP_PASS?.length || 0
    },
    allEnvVars: {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER ? '***' + process.env.SMTP_USER.slice(-4) : 'Не настроен',
      SMTP_PASS: process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'Не настроен',
      SMTP_FROM: process.env.SMTP_FROM
    }
  })
}
