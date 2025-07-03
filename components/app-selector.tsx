"use client"

import { useState, useEffect } from "react"
import { ChevronDown, AppWindow, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"

interface App {
  id: string
  name: string
  provider: string
  token: string
  createdAt: string
}

interface AppSelectorProps {
  selectedApp: App | null
  onAppSelect: (app: App | null) => void
  disabled?: boolean
  refreshTrigger?: number // 用于触发刷新的计数器
  onOpenSettings?: () => void // 打开设置对话框的回调
}

export function AppSelector({ selectedApp, onAppSelect, disabled, refreshTrigger, onOpenSettings }: AppSelectorProps) {
  const [apps, setApps] = useState<App[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()

  // Load all apps (without pagination for selector)
  const loadApps = async () => {
    setIsLoading(true)
    try {
      // Load all apps by using a large page size
      const response = await fetch('/api/settings/apps?page=1&pageSize=100')
      if (response.ok) {
        const data = await response.json()
        setApps(data.items)
      }
    } catch (error) {
      console.error('Error loading apps:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadApps()
  }, [refreshTrigger]) // 当 refreshTrigger 变化时重新加载应用列表

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="default"
          disabled={disabled || isLoading}
          className="min-w-[140px] justify-between shrink-0"
        >
          <div className="flex items-center gap-2">
            <AppWindow className="h-4 w-4" />
            <span className="truncate">
              {selectedApp ? selectedApp.name : t("Select App")}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {apps.length > 0 ? (
          apps.map((app) => (
            <DropdownMenuItem
              key={app.id}
              onClick={() => onAppSelect(app)}
              className="flex items-center gap-2"
            >
              <AppWindow className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="truncate">{app.name}</span>
                <span className="text-xs text-muted-foreground">
                  {app.provider}
                </span>
              </div>
            </DropdownMenuItem>
          ))
        ) : isLoading ? (
          <DropdownMenuItem disabled className="text-muted-foreground">
            {t("Loading...")}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onOpenSettings?.()}
            className="flex items-center gap-2 text-primary cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <div className="flex flex-col">
              <span>{t("Add Your First App")}</span>
              <span className="text-xs text-muted-foreground">
                {t("Configure an app to start chatting")}
              </span>
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
