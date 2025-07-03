import { motion, AnimatePresence } from "framer-motion"
import { Bot, User, FileText, Copy, Check, BookOpen, ExternalLink, ChevronDown, ChevronRight } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Message, KnowledgeSource } from "@/hooks/useChat"
import { ThinkingAnimation } from "@/components/thinking-animation"
import { ChatError } from "@/components/chat-error"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

interface KnowledgeSourcesProps {
  sources: KnowledgeSource[]
}

function KnowledgeSources({ sources }: KnowledgeSourcesProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!sources || sources.length === 0) return null

  return (
    <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-muted">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full text-left hover:bg-muted/50 rounded p-2 -m-2 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
        <BookOpen className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          知识库来源 ({sources.length})
        </span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 mt-4">
              {sources.map((source, index) => (
                <div key={index} className="p-3 bg-background rounded-md border border-muted/50 text-sm">
                  {source.title && (
                    <div className="font-medium mb-2 flex items-center gap-2 text-foreground">
                      {source.title}
                      {source.url && (
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                  )}
                  <div className="text-muted-foreground line-clamp-3 leading-relaxed">
                    {source.content}
                  </div>
                  {source.score && (
                    <div className="text-xs text-muted-foreground mt-2 font-medium">
                      相关度: {(source.score * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  return (
    <div className="space-y-4 py-4 max-w-4xl mx-auto">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`flex items-start gap-3 ${
              message.role === "assistant" ? "flex-row" : "flex-row-reverse"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                message.role === "assistant"
                  ? "cool-gradient text-white"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {message.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div
              className={cn(
                "rounded-lg px-4 py-2 max-w-[85%] space-y-2",
                message.role === "assistant" 
                  ? "bg-card text-card-foreground" 
                  : "cool-gradient text-white"
              )}
            >
              {message.content.startsWith("Error:") ? (
                <ChatError message={message.content.slice(7)} />
              ) : message.isStreaming ? (
                // 流式输出期间显示纯文本，避免 Markdown 重新渲染
                <div className="prose dark:prose-invert whitespace-pre-line leading-relaxed">
                  {message.content}
                  <span className="animate-pulse ml-1">▋</span>
                </div>
              ) : message.isMarkdown ? (
                <div className="prose dark:prose-invert [&>*]:leading-relaxed [&>*]:mb-3 last:[&>*]:mb-0">
                  <ReactMarkdown
                    components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "")
                      const code = String(children).replace(/\n$/, "")
                      
                      if (!inline && match) {
                        return (
                          <div className="relative group">
                            <div className="absolute right-2 top-2 flex items-center gap-2">
                              <span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                                {match[1]}
                              </span>
                              <button
                                onClick={() => copyToClipboard(code)}
                                className="p-1 rounded bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {copiedCode === code ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <SyntaxHighlighter
                              language={match[1]}
                              style={vscDarkPlus}
                              customStyle={{
                                margin: 0,
                                borderRadius: "0.5rem",
                                padding: "1rem",
                              }}
                              PreTag="div"
                            >
                              {code}
                            </SyntaxHighlighter>
                          </div>
                        )
                      }

                      return (
                        <code
                          className={cn(
                            "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
                            className
                          )}
                          {...props}
                        >
                          {children}
                        </code>
                      )
                    },
                    p({ children }) {
                      return <p className="mb-4 last:mb-0">{children}</p>
                    },
                    ul({ children }) {
                      return <ul className="list-disc pl-4 mb-4 last:mb-0">{children}</ul>
                    },
                    ol({ children }) {
                      return <ol className="list-decimal pl-4 mb-4 last:mb-0">{children}</ol>
                    },
                    li({ children }) {
                      return <li className="mb-1 last:mb-0">{children}</li>
                    },
                    h1({ children }) {
                      return <h1 className="text-2xl font-bold mb-4 last:mb-0">{children}</h1>
                    },
                    h2({ children }) {
                      return <h2 className="text-xl font-bold mb-3 last:mb-0">{children}</h2>
                    },
                    h3({ children }) {
                      return <h3 className="text-lg font-bold mb-2 last:mb-0">{children}</h3>
                    }
                  }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="prose dark:prose-invert whitespace-pre-line leading-relaxed">
                  {message.content}
                </div>
              )}
              {message.file && (
                <div className="flex items-center gap-2 mt-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{message.file.name}</span>
                </div>
              )}
              {message.knowledgeSources && message.knowledgeSources.length > 0 && (
                <KnowledgeSources sources={message.knowledgeSources} />
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 cool-gradient text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div className="rounded-lg px-4 py-2 bg-card text-card-foreground">
            <ThinkingAnimation />
          </div>
        </motion.div>
      )}
    </div>
  )
}
