"use client"

import { Send, Sparkles, LogOut } from "lucide-react"
import { useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar"
import { FileUpload } from "@/components/file-upload"
import { VoiceInput } from "@/components/voice-input"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { LanguageToggle } from "@/components/language-toggle"
import { MessageList } from "@/components/message-list"
import { ChatError } from "@/components/chat-error"
import { AppSelector } from "@/components/app-selector"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { useChat } from "@/hooks/useChat"
import { useScrollToBottom } from "@/hooks/useScrollToBottom"
import { Toaster } from "sonner"
import { SettingsDialog } from "@/components/settings-dialog"

export default function Chat() {
  const [input, setInput] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoginForm, setIsLoginForm] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsDefaultTab, setSettingsDefaultTab] = useState('appearance')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()
  const { t } = useLanguage()

  const handleScroll = useCallback(() => {
    const element = scrollAreaRef.current
    if (!element) return

    const viewport = element.querySelector('[data-radix-scroll-area-viewport]')
    const content = viewport?.firstElementChild
    
    if (viewport && content) {
      requestAnimationFrame(() => {
        viewport.scrollTop = content.scrollHeight
      })
    }
  }, [])

  const { messages, isLoading, history, selectedApp, setSelectedApp, appRefreshTrigger, refreshAppList, sendMessage, selectChat, deleteChat, newChat } = useChat(handleScroll)

  // Auto scroll to bottom when messages change
  useScrollToBottom(scrollAreaRef, [messages])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() && !selectedFile) return

    await sendMessage(input, selectedFile)
    setInput("")
    setSelectedFile(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleVoiceInput = (transcript: string) => {
    setInput(transcript)
  }

  const handleLogout = () => {
    logout()
  }

  const handleOpenSettings = (tab: string = 'appearance') => {
    setSettingsDefaultTab(tab)
    setIsSettingsOpen(true)
  }
  // if(!user)
  if (!true) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">{t("Welcome")}</h1>
          {isLoginForm ? (
            <LoginForm onToggleForm={() => setIsLoginForm(false)} />
          ) : (
            <RegisterForm onToggleForm={() => setIsLoginForm(true)} />
          )}
          <div className="mt-4 text-center">
            <LanguageToggle />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Toaster />
      <Sidebar
        history={history}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        onNewChat={newChat}
      />
      <div className="flex flex-col flex-grow">
        <header className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary float-animation" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
              {t("Welcome")}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SettingsDialog
              refreshAppList={refreshAppList}
              isOpen={isSettingsOpen}
              onOpenChange={setIsSettingsOpen}
              defaultTab={settingsDefaultTab}
            />
            <ThemeToggle />
            {/* <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">{t("Log out")}</span>
            </Button> */}
          </div>
        </header>
        <main className="flex-grow overflow-hidden bg-dot-pattern">
          <ScrollArea className="h-full px-4" ref={scrollAreaRef}>
            <MessageList messages={messages} isLoading={isLoading} />
          </ScrollArea>
        </main>
        <footer className="border-t p-4 bg-card">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2 max-w-3xl mx-auto">
            <AppSelector
              selectedApp={selectedApp}
              onAppSelect={setSelectedApp}
              disabled={isLoading}
              refreshTrigger={appRefreshTrigger}
              onOpenSettings={() => handleOpenSettings('apps')}
            />
            <Input
              placeholder={t("Type your message...")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-grow border-muted-foreground/20 bg-background"
            />
            {/*<VoiceInput onTranscript={handleVoiceInput} disabled={isLoading} />*/}
            <FileUpload onFileSelect={setSelectedFile} disabled={isLoading} />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || (!input.trim() && !selectedFile) || !selectedApp}
              className="cool-gradient text-white hover:bg-gradient-to-br hover:from-blue-600 hover:to-teal-500 transition-all duration-300"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">{t("Send message")}</span>
            </Button>
          </form>
          {selectedFile && (
            <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2 max-w-3xl mx-auto">
              <span>{t("Selected file:")}</span>
              <span className="font-medium">{selectedFile.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                className="h-auto p-1"
              >
                ×
              </Button>
            </div>
          )}
        </footer>
      </div>
    </div>
  )
}
