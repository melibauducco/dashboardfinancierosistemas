import { useState, useEffect, useRef } from 'react';
import './ChatWidget.css';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    text: string;
    timestamp: Date;
}

const WEBHOOK_URL = 'https://n8n-n8n.hqzrjg.easypanel.host/webhook/a3a9081e-8839-4696-b18b-9087988a74be';
const SESSION_KEY = 'ia_chat_session_id';

function generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sessionId] = useState(getOrCreateSessionId);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSend = async () => {
        const trimmedMessage = inputValue.trim();
        if (!trimmedMessage || isSending) return;

        // Add user message
        const userMessage: Message = {
            id: 'msg_' + Date.now(),
            role: 'user',
            text: trimmedMessage,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsSending(true);

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    userMessage: trimmedMessage,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Extraer el texto de respuesta - manejar diferentes formatos de n8n
            let replyText = 'Respuesta recibida.';

            if (Array.isArray(data) && data.length > 0) {
                // Formato: [{ "output": "..." }]
                replyText = data[0].output || data[0].reply || data[0].message || data[0].text || replyText;
            } else if (typeof data === 'object' && data !== null) {
                // Formato: { "output": "..." } o { "reply": "..." }
                replyText = data.output || data.reply || data.message || data.text || replyText;
            } else if (typeof data === 'string') {
                // Formato: string directo
                replyText = data;
            }

            // Add assistant response
            const assistantMessage: Message = {
                id: 'msg_' + Date.now(),
                role: 'assistant',
                text: replyText,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error sending message:', error);

            // Add error message
            const errorMessage: Message = {
                id: 'msg_' + Date.now(),
                role: 'system',
                text: 'Ha ocurrido un error al conectar con el asistente IA. Inténtalo de nuevo más tarde.',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* Chat Bubble */}
            <button
                className={`chat-bubble ${isOpen ? 'chat-bubble--open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <h3 className="chat-title">Asistente IA Financiero</h3>
                            <p className="chat-subtitle">Pregunta lo que quieras sobre tus métricas de gastos</p>
                        </div>
                        <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="chat-welcome">
                                <div className="chat-welcome-icon">🤖</div>
                                <p>¡Hola! Soy tu asistente IA financiero.</p>
                                <p>Pregúntame sobre gastos, presupuestos o cualquier métrica del dashboard.</p>
                            </div>
                        )}

                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`chat-message chat-message--${message.role}`}
                            >
                                <div className="chat-message-bubble">
                                    <p className="chat-message-text">{message.text}</p>
                                    <span className="chat-message-time">{formatTime(message.timestamp)}</span>
                                </div>
                            </div>
                        ))}

                        {isSending && (
                            <div className="chat-message chat-message--assistant">
                                <div className="chat-message-bubble chat-typing">
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chat-input-container">
                        <textarea
                            ref={inputRef}
                            className="chat-input"
                            placeholder="Escribe tu mensaje..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isSending}
                            rows={1}
                        />
                        <button
                            className="chat-send-btn"
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isSending}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
