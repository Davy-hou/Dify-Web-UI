import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const envPath = path.join(process.cwd(), '.env')
    let envContent = ''
    try {
      envContent = await fs.readFile(envPath, 'utf-8')
    } catch (error) {
      return NextResponse.json({ dify: '', coze: '' })
    }

    // Parse env content
    const envLines = envContent.split('\n')
    const settings = {
      dify: '',
      coze: '',
      difyHost: 'https://api.dify.ai/v1'
    }

    envLines.forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key === 'DIFY_API_KEY') {
        settings.dify = valueParts.join('=').trim()
      } else if (key === 'COZE_API_KEY') {
        settings.coze = valueParts.join('=').trim()
      } else if (key === 'DIFY_HOST') {
        settings.difyHost = valueParts.join('=').trim()
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error reading settings:', error)
    return NextResponse.json(
      { error: 'Failed to read settings' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { provider, key, host } = await req.json()
    
    // Read existing .env file
    const envPath = path.join(process.cwd(), '.env')
    let envContent = ''
    try {
      envContent = await fs.readFile(envPath, 'utf-8')
    } catch (error) {
      // File doesn't exist, start with empty content
    }

    // Parse existing env content
    const envLines = envContent.split('\n').filter(line => line.trim() !== '')
    const envMap = new Map()
    
    envLines.forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key) {
        envMap.set(key.trim(), valueParts.join('=').trim())
      }
    })

    // Update or add new values
    if (provider === 'dify') {
      if (key) {
        envMap.set('DIFY_API_KEY', key)
      }
      if (host) {
        envMap.set('DIFY_HOST', host)
      }
    } else if (provider === 'coze') {
      envMap.set('COZE_API_KEY', key)
    }

    // Convert back to string
    const newEnvContent = Array.from(envMap.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    // Write back to .env file
    await fs.writeFile(envPath, newEnvContent + '\n')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving API key:', error)
    return NextResponse.json(
      { error: 'Failed to save API key' },
      { status: 500 }
    )
  }
}
