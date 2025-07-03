import { useState, useEffect, useCallback, useRef, startTransition } from 'react'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'

export type KnowledgeSource = {
  content: string
  title?: string
  url?: string
  score?: number
}

export type Message = {
  role: "user" | "assistant"
  content: string
  isMarkdown?: boolean
  isStreaming?: boolean
  file?: File
  knowledgeSources?: KnowledgeSource[]
}

export type ChatHistory = {
  id: string
  title: string
  messages: Message[]
  lastUpdated: number
}

export type App = {
  id: string
  name: string
  provider: string
  token: string
  createdAt: string
}

type ScrollHandler = () => void

export function useChat(onMessageUpdate?: ScrollHandler) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedApp, setSelectedApp] = useState<App | null>(null)
  const [appRefreshTrigger, setAppRefreshTrigger] = useState(0)
  const currentChatId = useRef<string | null>(null)
  const [history, setHistory] = useState<ChatHistory[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chatHistory")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  // Update history when messages change
  useEffect(() => {
    if (messages.length === 0) {
      currentChatId.current = null
      return
    }

    setHistory(prevHistory => {
      const newHistory = [...prevHistory]
      const now = Date.now()

      if (currentChatId.current) {
        // Update existing chat
        const existingChatIndex = newHistory.findIndex(chat => chat.id === currentChatId.current)
        if (existingChatIndex !== -1) {
          newHistory[existingChatIndex] = {
            ...newHistory[existingChatIndex],
            messages,
            lastUpdated: now
          }
        } else {
          // Chat was deleted, create new one
          currentChatId.current = nanoid()
          newHistory.unshift({
            id: currentChatId.current,
            title: messages[0].content.slice(0, 30) + "...",
            messages,
            lastUpdated: now
          })
        }
      } else {
        // Create new chat
        currentChatId.current = nanoid()
        newHistory.unshift({
          id: currentChatId.current,
          title: messages[0].content.slice(0, 30) + "...",
          messages,
          lastUpdated: now
        })
      }

      // Sort by last updated
      newHistory.sort((a, b) => b.lastUpdated - a.lastUpdated)

      // Limit to 50 chats
      const limitedHistory = newHistory.slice(0, 50)
      
      // Save to localStorage
      localStorage.setItem("chatHistory", JSON.stringify(limitedHistory))
      
      return limitedHistory
    })
  }, [messages])

  const sendMessage = async (input: string, selectedFile: File | null) => {
    if (!input.trim() && !selectedFile) return

    // 必须选择一个应用才能发送消息
    if (!selectedApp) {
      alert("请先选择一个应用")
      return
    }

    const newMessage: Message = { role: "user", content: input, file: selectedFile || undefined }
    setMessages(prev => [...prev, newMessage])
    setIsLoading(true)

    try {
      // Always use chat-dify endpoint since this app is Dify-focused
      const requestPayload: any = {
        inputs: {},
        query: input,
        response_mode: "streaming",
        conversation_id: currentChatId.current || "",
        user: "abc-123",
        messages: [...messages, newMessage]
      }

      // If an app is selected, use its token
      if (selectedApp) {
        requestPayload.appToken = selectedApp.token
        requestPayload.appProvider = selectedApp.provider
      }

      const response = await fetch("/api/chat-dify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const streamMessage: Message = {
        role: "assistant",
        content: "",
        isMarkdown: true
      }

      let currentContent = ""
      setMessages(prev => [...prev, streamMessage])
      setIsLoading(false)

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Response body is null')

      const decoder = new TextDecoder()
      let buffer = ''
      setIsStreaming(true) // 开始流式输出

      while (true) {
        const result = await reader.read()
        if (result.done) break

        const chunk = decoder.decode(result.value)
        buffer += chunk

        // 按照 SSE 标准，事件由 \n\n 分隔
        const events = buffer.split('\n\n')
        // 保留最后一个可能不完整的事件
        buffer = events.pop() || ''

        for (const event of events) {
          if (!event.trim()) continue

          const lines = event.split('\n')
          for (const line of lines) {
            if (line.trim().startsWith('data: ')) {
              try {
                const jsonStr = line.trim().slice(5)
                if (!jsonStr) continue

                const data = JSON.parse(jsonStr)
                console.log('Parsed SSE data:', data)

                if (data.error) {
                  toast.error(data.error)
                  setMessages(prev => {
                    const newMessages = [...prev]
                    newMessages[newMessages.length - 1].content = `Error: ${data.error}`
                    return newMessages
                  })
                  break
                }

                if (data.content) {
                  currentContent += data.content
                  console.log('Updated content length:', currentContent.length, 'New chunk:', data.content)

                  setMessages(prev => {
                    const newMessages = [...prev]
                    // 在流式输出期间，禁用 Markdown 渲染以显示增量效果
                    newMessages[newMessages.length - 1].content = currentContent
                    newMessages[newMessages.length - 1].isMarkdown = false // 流式期间禁用 Markdown
                    newMessages[newMessages.length - 1].isStreaming = true // 标记为流式状态
                    return newMessages
                  })

                  // Trigger scroll on each content update
                  onMessageUpdate?.()
                }

                // 处理knowledge源文档
                if (data.knowledgeSources) {
                  console.log('Received knowledge sources:', data.knowledgeSources)

                  setMessages(prev => {
                    const newMessages = [...prev]
                    if (newMessages.length > 0) {
                      newMessages[newMessages.length - 1].knowledgeSources = data.knowledgeSources
                    }
                    return newMessages
                  })

                  // Trigger scroll on knowledge sources update
                  onMessageUpdate?.()
                }

                if (data.end) {
                  console.log('Stream ended:', data.metadata)
                  setIsStreaming(false) // 结束流式输出

                  // 流式结束后，重新启用 Markdown 渲染
                  setMessages(prev => {
                    const newMessages = [...prev]
                    if (newMessages.length > 0) {
                      newMessages[newMessages.length - 1].isMarkdown = true
                      newMessages[newMessages.length - 1].isStreaming = false
                    }
                    return newMessages
                  })

                  break
                }
              } catch (e) {
                console.error('Error parsing chunk:', e, 'Line:', line)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in sendMessage:", error)
      const errorMessage = error instanceof Error ? error.message : "An error occurred while processing your request."
      toast.error(errorMessage)
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${errorMessage}` }])
    } finally {
      setIsLoading(false)
    }
  }

  const selectChat = (chat: ChatHistory) => {
    currentChatId.current = chat.id
    setMessages(chat.messages)
  }

  const deleteChat = (id: string) => {
    if (id === currentChatId.current) {
      currentChatId.current = null
      setMessages([])
    }

    setHistory(prev => {
      const newHistory = prev.filter(chat => chat.id !== id)
      localStorage.setItem("chatHistory", JSON.stringify(newHistory))
      return newHistory
    })
  }

  const newChat = () => {
    currentChatId.current = null
    setMessages([])
  }

  const refreshAppList = useCallback(() => {
    setAppRefreshTrigger(prev => prev + 1)
  }, [])

  return {
    messages,
    isLoading,
    history,
    selectedApp,
    setSelectedApp,
    appRefreshTrigger,
    refreshAppList,
    sendMessage,
    selectChat,
    deleteChat,
    newChat
  }
}
