"use client"

import { useState, useEffect } from "react"
import { Settings, Moon, Sun, Globe, Key, Eye, EyeOff, Plus, Trash2, AppWindow, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface App {
  id: string
  name: string
  provider: string
  token: string
  createdAt: string
}

const menuItems = [
  { id: 'api', icon: Key, label: 'Server Settings' },
  { id: 'apps', icon: AppWindow, label: 'App Settings' },
  { id: 'appearance', icon: Sun, label: 'Appearance' },
  { id: 'language', icon: Globe, label: 'Language' }
]

const getTabDescription = (tabId: string) => {
  switch (tabId) {
    case 'appearance':
      return "Select your preferred theme"
    case 'language':
      return "Select the language for the interface"
    case 'api':
      return "Configure Dify Server host here"
    case 'apps':
      return "Manage your apps"
    default:
      return ""
  }
}

const apiProviders = [
  { id: 'dify', name: 'Dify', placeholder: 'Enter your Dify host' },
  { id: 'coze', name: 'Coze', placeholder: 'Enter your Coze host' }
]

interface SettingsDialogProps {
  refreshAppList?: () => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  defaultTab?: string
}

export function SettingsDialog({ refreshAppList, isOpen, onOpenChange, defaultTab }: SettingsDialogProps = {}) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'appearance')

  // 当defaultTab改变时，更新activeTab
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab)
    }
  }, [defaultTab])
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const [apiKey, setApiKey] = useState("")
  const [apiProvider, setApiProvider] = useState("dify")
  const [isSaving, setIsSaving] = useState(false)

  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' })

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/provider')
        if (response.ok) {
          const settings = await response.json()
          if (settings.difyHost) {
            setApiKey(settings.difyHost)
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
    loadSettings()
  }, [])

  // App settings state
  const [apps, setApps] = useState<App[]>([])
  const [totalApps, setTotalApps] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(2)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Add app form state
  const [newAppName, setNewAppName] = useState('')
  const [newAppProvider, setNewAppProvider] = useState('dify')
  const [newAppToken, setNewAppToken] = useState('')
  const [showNewAppToken, setShowNewAppToken] = useState(false)
  const [isAddingApp, setIsAddingApp] = useState(false)

  // Reset form
  const resetForm = () => {
    setNewAppName('')
    setNewAppToken('')
    setNewAppProvider('dify')
    setShowNewAppToken(false)
    setShowAddForm(false)
  }

  // Load apps function
  const loadApps = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/settings/apps?page=${currentPage}&pageSize=${pageSize}`)
      if (response.ok) {
        const data = await response.json()
        setApps(data.items)
        setTotalApps(data.total)
      }
    } catch (error) {
      console.error('Error loading apps:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load apps effect
  useEffect(() => {
    if (activeTab === 'apps') {
      loadApps()
    }
  }, [activeTab, currentPage, pageSize])

  const totalPages = Math.ceil(totalApps / pageSize)

  const handlePageChange = (newPage: number) => {
    if (isLoading) return
    setCurrentPage(newPage)
  }

  // Add new app
  const handleAddApp = async () => {
    if (!newAppName.trim() || !newAppToken.trim()) return

    setIsAddingApp(true)
    try {
      const response = await fetch('/api/settings/apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newAppName,
          provider: newAppProvider,
          token: newAppToken
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add app')
      }

      resetForm()
      loadApps()
      // 通知应用选择器刷新列表
      refreshAppList?.()
    } catch (error) {
      console.error('Error adding app:', error)
    } finally {
      setIsAddingApp(false)
    }
  }

  // Delete app
  const handleDeleteApp = async (id: string) => {
    try {
      const response = await fetch('/api/settings/apps', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      })

      if (!response.ok) {
        throw new Error('Failed to delete app')
      }

      // If this is the last item on the current page and not the first page,
      // go to the previous page
      if (apps.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      } else {
        // Otherwise, just reload the current page
        loadApps()
      }

      // 通知应用选择器刷新列表
      refreshAppList?.()
    } catch (error) {
      console.error('Error deleting app:', error)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'appearance':
        return (
          <div className="space-y-4">
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>{t("Light")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>{t("Dark")}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
      case 'language':
        return (
          <div className="space-y-4">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>English</span>
                  </div>
                </SelectItem>
                <SelectItem value="zh">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>中文</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
      case 'api':
        return (
          <div className="space-y-4">
            <Select value={apiProvider} onValueChange={(value) => {
              setApiProvider(value)
              setSaveStatus({ type: null, message: '' })
            }}>
              <SelectTrigger>
                <SelectValue placeholder={t("Select API Provider")} />
              </SelectTrigger>
              <SelectContent>
                {apiProviders.map(provider => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      <span>{provider.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-3">
              <Input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                placeholder={t(apiProviders.find(p => p.id === apiProvider)?.placeholder || '')}
              />
              <Button
                className="w-full"
                onClick={handleSaveApiKey}
                disabled={isSaving || !apiKey.trim()}
              >
                {isSaving ? t('Saving...') : t('Save')}
              </Button>

              {/* 固定高度的状态消息区域，避免布局跳动 */}
              <div className="h-5 flex items-center">
                {saveStatus.type && (
                  <div className={`text-sm transition-opacity duration-200 ${
                    saveStatus.type === 'success'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {saveStatus.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      case 'apps':
        return showAddForm ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{t('Add New App')}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                <X className="h-4 w-4 mr-2" />
                {t('Cancel')}
              </Button>
            </div>

 

              <div className="space-y-2">
                <Label>{t('API Provider')}</Label>
                <Select value={newAppProvider} onValueChange={setNewAppProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select API Provider")} />
                  </SelectTrigger>
                  <SelectContent>
                    {apiProviders.map(provider => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          <span>{provider.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('App Name')}</Label>
                <Input
                  type="text"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder={t('Enter app name')}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('API Token')}</Label>
                <div className="relative">
                  <Input
                    type={showNewAppToken ? "text" : "password"}
                    value={newAppToken}
                    onChange={(e) => setNewAppToken(e.target.value)}
                    className="pr-10"
                    placeholder={t('Enter API token')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowNewAppToken(!showNewAppToken)}
                  >
                    {showNewAppToken ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showNewAppToken ? t('Hide API Token') : t('Show API Token')}
                    </span>
                  </Button>
                </div>
              </div>

              <Button 
                className="w-full"
                onClick={handleAddApp}
                disabled={isAddingApp || !newAppName.trim() || !newAppToken.trim()}
              >
                {isAddingApp ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('Adding...')}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('Add App')}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">{t('Your Apps')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('Total')}: {totalApps}
                </p>
              </div>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('Add App')}
              </Button>
            </div>
            
            {apps.length === 0 ? (
              <div className="text-center py-6 space-y-4">
                <div className="text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">{t('No apps added yet')}</p>
                </div>
                <Button variant="outline" onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('Add Your First App')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('Name')}</th>
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('Provider')}</th>
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('API Token')}</th>
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('Created')}</th>
                          <th className="w-[100px] p-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {apps.map(app => (
                          <tr key={app.id} className="hover:bg-muted/50">
                            <td className="p-3">
                              <div className="font-medium">{app.name}</div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Key className="h-3 w-3 shrink-0" />
                                {app.provider}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-sm text-muted-foreground font-mono">
                                {app.token ? `${app.token.substring(0, 8)}...${app.token.substring(app.token.length - 4)}` : 'No token'}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-sm text-muted-foreground">
                                {new Date(app.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteApp(app.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">{t('Delete App')}</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-1 mt-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <span className="sr-only">{t('Previous')}</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => handlePageChange(page)}
                        disabled={isLoading}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isLoading}
                    >
                      <span className="sr-only">{t('Next')}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
    }
  }

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return

    setIsSaving(true)
    setSaveStatus({ type: null, message: '' })
    
    try {
      const response = await fetch('/api/settings/provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: apiProvider,
          key: '', // Server Settings中不保存API key，只保存host
          host: apiKey // 用户输入的实际上是host地址
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save host')
      }

      setSaveStatus({
        type: 'success',
        message: t('Host saved successfully')
      })

      // 3秒后清除成功提示
      setTimeout(() => {
        setSaveStatus({ type: null, message: '' })
      }, 3000)
    } catch (error) {
      console.error('Error saving host:', error)
      setSaveStatus({
        type: 'error',
        message: t('Failed to save host')
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-[200px] border-r shrink-0">
            <div className="p-4 border-b">
              <DialogTitle>{t('Settings')}</DialogTitle>
            </div>
            <nav className="p-2">
              {menuItems.map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "flex items-center gap-2 w-full rounded-md p-2 text-sm transition-colors",
                      activeTab === item.id
                        ? "bg-secondary"
                        : "hover:bg-secondary/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t(item.label)}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">{t(menuItems.find(item => item.id === activeTab)?.label || '')}</h2>
              <p className="text-sm text-muted-foreground">{t(getTabDescription(activeTab))}</p>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
