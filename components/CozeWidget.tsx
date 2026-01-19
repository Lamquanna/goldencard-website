'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, X, Minimize2 } from 'lucide-react'

interface CozeWidgetProps {
  botId?: string
  token?: string
  position?: 'bottom-right' | 'bottom-left'
  primaryColor?: string
}

export function CozeWidget({
  botId = process.env.NEXT_PUBLIC_COZE_BOT_ID,
  token = process.env.NEXT_PUBLIC_COZE_TOKEN,
  position = 'bottom-right',
  primaryColor = '#4CAF50',
}: CozeWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!botId) {
      console.warn('CozeWidget: NEXT_PUBLIC_COZE_BOT_ID not configured')
      setError('Bot ID not configured')
      return
    }

    const loadCozeSDK = async () => {
      try {
        if ((window as any).CozeWebSDK) {
          setIsLoaded(true)
          return
        }

        const script = document.createElement('script')
        script.src = 'https://lf-cdn.coze.com/obj/unpkg/flow-platform/chat-app-sdk/0.1.0-beta.4/libs/cn/index.js'
        script.async = true
        
        script.onload = () => {
          console.log('✅ Coze SDK loaded successfully')
          setIsLoaded(true)
          
          if ((window as any).CozeWebSDK) {
            try {
              new (window as any).CozeWebSDK.WebChatClient({
                config: {
                  bot_id: botId,
                },
                componentProps: {
                  title: 'Golden Energy AI Assistant',
                  icon: 'https://goldenenergy.vn/logo.png',
                  layout: 'pc',
                  width: 400,
                  height: 600,
                },
              })
            } catch (err: any) {
              console.error('Coze initialization error:', err)
              setError('Failed to initialize chat')
            }
          }
        }
        
        script.onerror = () => {
          console.error('❌ Failed to load Coze SDK')
          setError('Failed to load chat SDK')
          setIsLoaded(false)
        }
        
        document.head.appendChild(script)
      } catch (err: any) {
        console.error('Coze loading error:', err)
        setError(err.message)
      }
    }

    loadCozeSDK()
  }, [botId])

  const positionClass = position === 'bottom-right'
    ? 'bottom-6 right-6'
    : 'bottom-6 left-6'

  if (error) {
    return null
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed ${positionClass} z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300`}
        style={{ backgroundColor: primaryColor }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
        
        <span className="absolute top-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
      </button>

      {isOpen && (
        <div
          className={`fixed ${positionClass} z-40 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 mb-20`}
          style={{
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          <div
            className="p-4 text-white flex items-center justify-between"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI Sales Agent</h3>
                <p className="text-xs text-white/80">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          <div className="h-[calc(100%-64px)] bg-gray-50">
            {!isLoaded ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading chat...</p>
                </div>
              </div>
            ) : (
              <div id="coze-chat-container" className="h-full">
                {/* Coze SDK will inject chat UI here */}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}
