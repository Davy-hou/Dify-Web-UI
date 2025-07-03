import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Paperclip } from 'lucide-react'
import { toast } from 'sonner'

interface FileUploadProps {
  onFileSelect: (file: File) => void
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size exceeds 5MB limit')
        return
      }
      onFileSelect(file)
      toast.success('File uploaded successfully')
    }
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        className="hover:bg-muted"
      >
        <Paperclip className="h-4 w-4" />
        <span className="sr-only">Upload file</span>
      </Button>
    </>
  )
}

