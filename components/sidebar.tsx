import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useLanguage } from "@/contexts/language-context"

type Message = {
  role: 'user' | 'assistant'
  content: string
  file?: File
}

type ChatHistory = {
  id: string
  title: string
  messages: Message[]
}

type SidebarProps = {
  history: ChatHistory[]
  onSelectChat: (chat: ChatHistory) => void
  onDeleteChat: (id: string) => void
  onNewChat: () => void
}



export function Sidebar({ history, onSelectChat, onDeleteChat, onNewChat }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)
  const { t } = useLanguage()
  const renderToggleButton = () => (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className={`hover:bg-transparent ${isCollapsed ? 'w-full justify-start px-2' : ''}`}
    >
      {isCollapsed ? (
        <ChevronRight className="h-4 w-4 mr-2" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
      <span className="sr-only">{isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</span>
    </Button>
  )

  const renderChatList = () => (
    <ScrollArea className="flex-grow">
      {!isCollapsed && (
        <div className="p-4 space-y-2">
          {history.map((chat) => (
            <div key={chat.id} className="flex items-center justify-between group">
              <Button
                variant="ghost"
                className="w-full justify-start text-left truncate hover:bg-transparent hover:text-primary transition-colors"
                onClick={() => onSelectChat(chat)}
              >
                {chat.title}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteChat(chat.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-transparent hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  )

  return (
    <div className={`h-screen sidebar-gradient transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col border-r`}>
      <div className="flex items-center justify-between p-4 border-b">
        {isCollapsed ? (
          renderToggleButton()
        ) : (
          <>
            <h2 className="text-lg font-semibold">{t("Chat History")}</h2>
            {renderToggleButton()}
          </>
        )}
      </div>
      {renderChatList()}
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full cool-gradient text-white hover:text-primary hover:bg-transparent transition-all duration-300" onClick={onNewChat}>
          {isCollapsed ? <Plus className="h-4 w-4 mx-auto" /> : t("New Chat")}
        </Button>
      </div>
    </div>
  )
}

