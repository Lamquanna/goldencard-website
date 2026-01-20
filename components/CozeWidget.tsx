'use client'

import { useEffect, useState } from 'react'

interface CozeWidgetProps {
  botId?: string
  token?: string
}

export function CozeWidget({
  botId = process.env.NEXT_PUBLIC_COZE_BOT_ID || '7594311757871972405',
  token, // Token from server-side, not env
}: CozeWidgetProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!botId) {
      console.warn('CozeWidget: Bot ID not configured')
      return
    }

    const loadCozeSDK = async () => {
      try {
        // Check if SDK already loaded
        if ((window as any).CozeWebSDK) {
          initializeCoze()
          return
        }

        const script = document.createElement('script')
        script.src = 'https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/1.2.0-beta.6/libs/oversea/index.js'
        script.async = true
        
        script.onload = () => {
          console.log('✅ Coze SDK loaded successfully')
          initializeCoze()
        }
        
        script.onerror = () => {
          console.error('❌ Failed to load Coze SDK')
          setIsLoaded(false)
        }
        
        document.head.appendChild(script)
      } catch (err: any) {
        console.error('Coze loading error:', err)
      }
    }

    const initializeCoze = () => {
      try {
        if ((window as any).CozeWebSDK) {
          const config: any = {
            config: {
              bot_id: botId,
            },
            componentProps: {
              title: 'Golden Energy AI Assistant',
            },
          }

          // Add auth config with token if provided, otherwise use public bot mode
          if (token) {
            config.config.auth = {
              type: 'token',
              token: token,
            }
          } else {
            // For public bots without token - explicitly set auth to null
            config.config.auth = null
          }

          new (window as any).CozeWebSDK.WebChatClient(config)
          setIsLoaded(true)
          console.log('✅ Coze chat initialized successfully')
        }
      } catch (err: any) {
        console.error('❌ Coze initialization error:', err)
        setIsLoaded(false)
      }
    }

    loadCozeSDK()
  }, [botId, token])

  // Widget is rendered by Coze SDK directly on page
  return null
}
