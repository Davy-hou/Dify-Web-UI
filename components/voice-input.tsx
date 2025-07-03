import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff } from 'lucide-react'
import { toast } from 'sonner'

interface VoiceInputProps {
  onTranscript: (transcript: string) => void
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'en-US'

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('')

        onTranscript(transcript)
      }

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error)
        toast.error('Speech recognition error: ' + event.error)
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [onTranscript])

  const toggleListening = useCallback(() => {
    if (!recognition) {
      toast.error('Speech recognition is not supported in this browser')
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }, [isListening, recognition])

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleListening}
      className={`hover:bg-muted ${isListening ? 'bg-primary text-primary-foreground' : ''}`}
    >
      {isListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      <span className="sr-only">{isListening ? 'Stop voice input' : 'Start voice input'}</span>
    </Button>
  )
}

