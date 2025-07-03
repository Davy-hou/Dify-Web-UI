import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History, Trash2 } from 'lucide-react'

type ChatHistory = {
  id: string
  title: string
  messages: { role: 'user' | 'assistant'; content: string }[]
}

type ChatHistoryProps = {
  history: ChatHistory[]
  onSelectChat: (chat: ChatHistory) => void
  onDeleteChat: (id: string) => void
}

export function ChatHistory({ history, onSelectChat, onDeleteChat }: ChatHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <History className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">View chat history</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chat History</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-4">
          {history.map((chat) => (
            <div key={chat.id} className="flex items-center justify-between py-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => {
                  onSelectChat(chat)
                  setIsOpen(false)
                }}
              >
                {chat.title}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteChat(chat.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete chat</span>
              </Button>
            </div>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

