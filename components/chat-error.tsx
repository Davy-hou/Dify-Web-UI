import { AlertCircle } from "lucide-react"

interface ChatErrorProps {
  message: string
}

export function ChatError({ message }: ChatErrorProps) {
  return (
    <div className="rounded-lg px-4 py-2 bg-destructive/10 text-destructive flex items-center gap-2">
      <AlertCircle className="h-4 w-4" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
