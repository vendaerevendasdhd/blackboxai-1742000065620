import { useState, useEffect, useRef } from 'react'
import { ChatBubbleLeftIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Message {
  id: number
  text: string
  sender: 'user' | 'support'
  timestamp: Date
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)

  useEffect(() => {
    if (isOpen && !ws) {
      const websocket = new WebSocket('ws://localhost:3000')
      
      websocket.onopen = () => {
        console.log('Connected to chat server')
      }

      websocket.onmessage = (event) => {
        const message = JSON.parse(event.data)
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: message.content,
          sender: 'support',
          timestamp: new Date()
        }])
      }

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      setWs(websocket)
    }

    return () => {
      if (ws) {
        ws.close()
        setWs(null)
      }
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !ws) return

    const message: Message = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    }

    ws.send(JSON.stringify({
      type: 'message',
      content: newMessage
    }))

    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="chat-widget bg-primary-600 text-white p-4 rounded-full hover:bg-primary-700 transition-colors"
      >
        <ChatBubbleLeftIcon className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div className="chat-widget w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col">
      {/* Header */}
      <div className="p-4 bg-primary-600 text-white rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold">Customer Support</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-200"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-bubble ${
              message.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-other'
            }`}
          >
            <p>{message.text}</p>
            <span className="text-xs opacity-75">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 input"
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatWidget
