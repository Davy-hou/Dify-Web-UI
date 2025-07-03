import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

interface App {
  id: string
  name: string
  provider: string
  token: string
  createdAt: string
}

interface PaginatedResponse {
  items: App[]
  total: number
  page: number
  pageSize: number
}

const APPS_FILE = path.join(process.cwd(), '.apps.json')
const DEFAULT_PAGE_SIZE = 5

async function getApps(): Promise<App[]> {
  try {
    const content = await fs.readFile(APPS_FILE, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    return []
  }
}

async function saveApps(apps: App[]) {
  await fs.writeFile(APPS_FILE, JSON.stringify(apps, null, 2))
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE))
    
    const apps = await getApps()
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    const response: PaginatedResponse = {
      items: apps.slice(start, end),
      total: apps.length,
      page,
      pageSize
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error reading apps:', error)
    return NextResponse.json(
      { error: 'Failed to read apps' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { name, provider, token } = await req.json()
    const apps = await getApps()
    
    const newApp: App = {
      id: Math.random().toString(36).substring(7),
      name,
      provider,
      token,
      createdAt: new Date().toISOString()
    }
    
    apps.push(newApp)
    await saveApps(apps)

    return NextResponse.json(newApp)
  } catch (error) {
    console.error('Error saving app:', error)
    return NextResponse.json(
      { error: 'Failed to save app' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    let apps = await getApps()
    
    apps = apps.filter(app => app.id !== id)
    await saveApps(apps)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting app:', error)
    return NextResponse.json(
      { error: 'Failed to delete app' },
      { status: 500 }
    )
  }
}
