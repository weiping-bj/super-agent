import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Monitor, Loader2, Maximize2, Minimize2, Wifi, WifiOff } from 'lucide-react'

declare global {
  interface Window {
    dcv: any;
  }
}

type ConnectionMode = 'none' | 'connecting' | 'dcv' | 'screenshot'

export function BrowserLiveView() {
  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState<ConnectionMode>('none')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [toolName, setToolName] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [dcvLoaded, setDcvLoaded] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 400, y: window.innerHeight / 2 - 250 })
  const [dragging, setDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const panelRef = useRef<HTMLDivElement>(null)

  const [size, setSize] = useState({ width: 800, height: 500 })
  const [resizing, setResizing] = useState(false)
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 })

  const connectionRef = useRef<any>(null)
  const authRef = useRef<any>(null)
  const dcvContainerRef = useRef<HTMLDivElement>(null)
  const sdkLoadAttempted = useRef(false)

  const loadDCVSDK = useCallback(() => {
    if (window.dcv) {
      setDcvLoaded(true)
      return
    }
    if (sdkLoadAttempted.current) return
    sdkLoadAttempted.current = true

    const script = document.createElement('script')
    script.src = '/dcv-sdk/dcvjs-umd/dcv.js'
    script.type = 'text/javascript'
    script.onload = () => {
      console.log('[BrowserLiveView] DCV SDK loaded successfully')
      if (window.dcv && window.dcv.setLogLevel && window.dcv.LogLevel) {
        window.dcv.setLogLevel(window.dcv.LogLevel.INFO)
      }
      setDcvLoaded(true)
    }
    script.onerror = () => {
      console.error('[BrowserLiveView] Failed to load DCV SDK')
      setError('Failed to load DCV SDK')
    }
    document.head.appendChild(script)
  }, [])

  const scaleDcvCanvas = useCallback(() => {
    const wrapper = document.getElementById('dcv-live-wrapper')
    const dcvDisplay = document.getElementById('dcv-live-display')
    if (!wrapper || !dcvDisplay) return

    const availableWidth = wrapper.clientWidth
    if (!availableWidth) return

    const scale = availableWidth / 1456
    dcvDisplay.style.transform = `scale(${scale})`
    wrapper.style.height = `${Math.ceil(824 * scale)}px`
  }, [])

  const connectToSession = useCallback((serverUrl: string, dcvSessionId: string, authToken: string) => {
    const displayElement = document.getElementById('dcv-live-display')
    if (!displayElement) {
      setTimeout(() => connectToSession(serverUrl, dcvSessionId, authToken), 100)
      return
    }

    const baseUrl = window.location.origin + '/dcv-sdk/dcvjs-umd'

    const connectOptions = {
      url: serverUrl,
      sessionId: dcvSessionId,
      authToken,
      divId: 'dcv-live-display',
      baseUrl,
      observers: {
        httpExtraSearchParams: () => {
          const params = new URL(serverUrl).searchParams
          return params
        },
        firstFrame: () => {
          console.log('[BrowserLiveView] First frame received - DCV stream active')
          setMode('dcv')
          setError(null)
          setTimeout(() => scaleDcvCanvas(), 200)
        },
        displayLayout: (_serverWidth: number, _serverHeight: number) => {
          setTimeout(() => scaleDcvCanvas(), 200)
        },
        error: (connError: any) => {
          console.error('[BrowserLiveView] DCV connection error:', connError)
          setError(`DCV error: ${connError?.message || connError}`)
        },
      },
    }

    window.dcv.connect(connectOptions)
      .then((conn: any) => {
        console.log('[BrowserLiveView] DCV connection established')
        connectionRef.current = conn
        setMode('dcv')
      })
      .catch((connErr: any) => {
        console.error('[BrowserLiveView] DCV connect failed:', connErr)
        setError(`DCV connection failed: ${connErr?.message || connErr}`)
        setMode('screenshot')
      })
  }, [scaleDcvCanvas])

  const connectToDCV = useCallback((liveViewUrl: string) => {
    if (!window.dcv) {
      setError('DCV SDK not available')
      setMode('screenshot')
      return
    }

    setMode('connecting')
    setError(null)

    const baseUrl = window.location.origin + '/dcv-sdk/dcvjs-umd'
    const workerPath = baseUrl + '/dcv/'
    if (window.dcv.setWorkerPath) {
      window.dcv.setWorkerPath(workerPath)
    }
    if (window.dcv.setBaseUrl) {
      window.dcv.setBaseUrl(baseUrl)
    }

    let authSuccessful = false

    authRef.current = window.dcv.authenticate(liveViewUrl, {
      promptCredentials: (_authType: any, callback: any) => {
        callback(null, null)
      },
      error: (_auth: any, authError: any) => {
        if (authSuccessful) return
        console.error('[BrowserLiveView] DCV authentication failed:', authError)
        const msg = authError?.message || authError?.toString() || 'Authentication failed'
        setError(`DCV auth failed: ${msg}`)
        setMode('screenshot')
        authRef.current = null
      },
      success: (_auth: any, result: any) => {
        authSuccessful = true
        console.log('[BrowserLiveView] DCV authentication successful')

        if (!result || !result[0]) {
          setError('No session data from DCV auth')
          setMode('screenshot')
          return
        }

        const { sessionId: dcvSessionId, authToken } = result[0]
        setTimeout(() => {
          connectToSession(liveViewUrl, dcvSessionId, authToken)
        }, 100)
      },
      httpExtraSearchParams: () => {
        const searchParams = new URL(liveViewUrl).searchParams
        return searchParams
      },
    })
  }, [connectToSession])

  const disconnectDCV = useCallback(() => {
    if (connectionRef.current) {
      try { connectionRef.current.close() } catch { /* ignore */ }
      connectionRef.current = null
    }
    if (authRef.current) {
      try { authRef.current.cancel() } catch { /* ignore */ }
      authRef.current = null
    }
  }, [])

  // Listen for early browser-session-starting event
  useEffect(() => {
    const handleSessionStarting = () => {
      if (!visible) {
        setVisible(true)
        setMode('connecting')
        loadDCVSDK()
      }
    }
    window.addEventListener('browser-session-starting', handleSessionStarting)
    return () => window.removeEventListener('browser-session-starting', handleSessionStarting)
  }, [visible, loadDCVSDK])

  // Listen for browser-live-view-ready events (DCV stream URL)
  useEffect(() => {
    let connectedSessionId: string | null = null

    const handleLiveViewReady = (e: Event) => {
      const { liveViewUrl, sessionId: evtSessionId } = (e as CustomEvent).detail
      if (!liveViewUrl) return

      if (connectedSessionId === evtSessionId) return

      console.log('[BrowserLiveView] Live view ready event received, sessionId:', evtSessionId)
      connectedSessionId = evtSessionId
      setSessionId(evtSessionId)
      setVisible(true)
      setError(null)

      disconnectDCV()

      if (!dcvLoaded && !window.dcv) {
        loadDCVSDK()
        const checkInterval = setInterval(() => {
          if (window.dcv) {
            clearInterval(checkInterval)
            connectToDCV(liveViewUrl)
          }
        }, 100)
        setTimeout(() => clearInterval(checkInterval), 10000)
      } else {
        connectToDCV(liveViewUrl)
      }
    }

    window.addEventListener('browser-live-view-ready', handleLiveViewReady)
    return () => {
      window.removeEventListener('browser-live-view-ready', handleLiveViewReady)
    }
  }, [dcvLoaded, loadDCVSDK, connectToDCV, disconnectDCV])

  // Listen for browser-frame events (screenshot fallback)
  useEffect(() => {
    const handleBrowserFrame = (e: Event) => {
      const { screenshotData, browserToolName } = (e as CustomEvent).detail
      if (screenshotData) {
        setScreenshot(screenshotData)
        setToolName(browserToolName)
        if (!visible) {
          setVisible(true)
        }
        if (mode !== 'dcv' && mode !== 'connecting') {
          setMode('screenshot')
        }
      }
    }

    window.addEventListener('browser-frame', handleBrowserFrame)
    return () => window.removeEventListener('browser-frame', handleBrowserFrame)
  }, [mode, visible])

  // Cleanup on unmount
  useEffect(() => {
    return () => { disconnectDCV() }
  }, [disconnectDCV])

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return
    e.preventDefault()
    setDragging(true)
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
  }, [position])

  useEffect(() => {
    if (!dragging) return
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      })
    }
    const handleMouseUp = () => setDragging(false)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging])

  // Resize handlers
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setResizing(true)
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    }
  }, [size])

  useEffect(() => {
    if (!resizing) return
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStart.current.x
      const dy = e.clientY - resizeStart.current.y
      setSize({
        width: Math.max(400, resizeStart.current.width + dx),
        height: Math.max(300, resizeStart.current.height + dy),
      })
    }
    const handleMouseUp = () => {
      setResizing(false)
      setTimeout(() => scaleDcvCanvas(), 100)
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing, scaleDcvCanvas])

  const handleClose = useCallback(() => {
    setVisible(false)
  }, [])

  const toggleExpanded = useCallback(() => {
    setExpanded(prev => !prev)
    setTimeout(() => scaleDcvCanvas(), 300)
  }, [scaleDcvCanvas])

  if (!visible) return null

  const statusLabel = mode === 'dcv'
    ? 'Live Stream'
    : mode === 'connecting'
    ? 'Connecting...'
    : mode === 'screenshot'
    ? 'Screenshots'
    : 'Waiting...'

  const StatusIcon = mode === 'dcv' ? Wifi : mode === 'connecting' ? Loader2 : WifiOff

  return (
    <div
      ref={panelRef}
      className={`fixed z-50 flex flex-col bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden ${
        dragging || resizing ? 'select-none' : ''
      } ${expanded ? 'inset-0' : ''}`}
      style={expanded ? {} : { top: position.y, left: position.x, width: size.width, height: size.height }}
    >
      {/* Header - draggable */}
      <div
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700 cursor-move flex-shrink-0"
        onMouseDown={handleMouseDown}
      >
        <Monitor className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium text-white flex-1 truncate">
          Browser Live View
          {sessionId && (
            <span className="ml-2 text-xs text-gray-400 font-normal">
              ({sessionId.slice(0, 12)}...)
            </span>
          )}
        </span>
        <div className="flex items-center gap-1.5" data-no-drag>
          <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
            mode === 'dcv' ? 'bg-green-900/50 text-green-400' :
            mode === 'connecting' ? 'bg-yellow-900/50 text-yellow-400' :
            'bg-gray-700 text-gray-400'
          }`}>
            <StatusIcon className={`w-3 h-3 ${mode === 'connecting' ? 'animate-spin' : ''}`} />
            {statusLabel}
          </span>
          <button
            onClick={toggleExpanded}
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title={expanded ? 'Restore' : 'Maximize'}
          >
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-red-600/30 text-gray-400 hover:text-red-400 transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="relative flex-1 overflow-hidden bg-gray-950">
        {error && (
          <div className="absolute top-0 left-0 right-0 z-10 px-3 py-1.5 bg-red-900/80 text-red-200 text-xs truncate">
            {error}
          </div>
        )}

        {/* DCV display container */}
        {(mode === 'dcv' || mode === 'connecting') && (
          <div
            id="dcv-live-wrapper"
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              id="dcv-live-display"
              ref={dcvContainerRef}
              style={{
                width: '1456px',
                height: '824px',
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
          </div>
        )}

        {mode === 'connecting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 z-10">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Connecting to DCV live stream...</span>
          </div>
        )}

        {mode === 'screenshot' && screenshot && (
          <img
            src={screenshot}
            alt="Browser screenshot"
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        )}

        {mode === 'none' && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Waiting for browser session...</span>
          </div>
        )}

        {mode === 'dcv' && toolName && (
          <div className="absolute bottom-2 right-2 z-10 bg-gray-800/80 rounded px-2 py-1 text-xs text-gray-300">
            {toolName}
          </div>
        )}
      </div>

      {/* Resize handle */}
      {!expanded && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeMouseDown}
        >
          <svg
            className="w-3 h-3 absolute bottom-0.5 right-0.5 text-gray-600"
            viewBox="0 0 12 12"
            fill="currentColor"
          >
            <circle cx="10" cy="10" r="1.5" />
            <circle cx="6" cy="10" r="1.5" />
            <circle cx="10" cy="6" r="1.5" />
          </svg>
        </div>
      )}
    </div>
  )
}
