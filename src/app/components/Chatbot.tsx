'use client';
import React, { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TemplateCard from './template_card';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    category?: string;
    templates?: TemplateData[];
}

interface TemplateData {
    id: string;
    title: string;
    description: string;
    image_url: string;
}

const Chatbot = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
    const [selectedTemplatesByMessage, setSelectedTemplatesByMessage] = useState<Record<string, string>>({});

    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Subscribe to Firebase Auth state and get uid
    useEffect(() => {
        const auth = getAuth();
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setAuthLoading(false);
        });
        return () => unsub();
    }, []);

    // Disconnect if user signs out
    useEffect(() => {
        if (!user && isConnected) {
            disconnectWebSocket();
        }
    }, [user, isConnected]);

    useEffect(() => {
        return () => {
            // cleanup on unmount
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const connectWebSocket = () => {
        if (isConnecting || isConnected) return;

        setIsConnecting(true);

        const uid = user?.uid;
        if (!uid) {
            setIsConnecting(false);
            addMessage('Please sign in to connect.', 'bot');
            return;
        }

        try {
            const wsUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chatbot/ws/${uid}`;
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                setIsConnected(true);
                setIsConnecting(false);
                addMessage('Connected to chatbot!', 'bot');
            };

            wsRef.current.onmessage = (event) => {
                // Expect server to send:
                // { loading: true, loading_message: string } to show loader
                // { loading: false } to hide loader (optional)
                // { message: string } for actual bot message
                console.log('WebSocket received:', event.data);
                try {
                    const data = JSON.parse(event.data || '{}');
                    console.log('Parsed data:', data);

                    if (data && typeof data === 'object') {
                        if (data.loading === true) {
                            setMsgLoading(true);
                            setLoadingMessage(data.loading_message || 'Loading...');
                            return;
                        }

                        if (data.loading === false) {
                            setMsgLoading(false);
                            setLoadingMessage(null);
                            
                            // Handle template suggestions without message
                            if (data.category === 'template_suggestion' && data.templates) {
                                console.log('Adding template suggestion:', {
                                    category: data.category,
                                    templates: data.templates
                                });
                                addBotMessage('Here are some template suggestions:', data.category, data.templates);
                                return;
                            }
                            
                            if (data.message) {
                                console.log('Adding bot message with templates:', {
                                    message: data.message,
                                    category: data.category,
                                    templates: data.templates
                                });
                                addBotMessage(data.message, data.category, data.templates);
                            }
                            return;
                        }

                        // Handle template suggestions at root level
                        if (data.category === 'template_suggestion' && data.templates) {
                            setMsgLoading(false);
                            setLoadingMessage(null);
                            console.log('Adding template suggestion at root level:', {
                                category: data.category,
                                templates: data.templates
                            });
                            addBotMessage('Here are some template suggestions:', data.category, data.templates);
                            return;
                        }

                        if (data.message) {
                            setMsgLoading(false);
                            setLoadingMessage(null);
                            console.log('Adding bot message with templates:', {
                                message: data.message,
                                category: data.category,
                                templates: data.templates
                            });
                            addBotMessage(data.message, data.category, data.templates);
                            return;
                        }
                    }

                    // Fallback: treat raw text as message
                    console.log('Fallback: treating as raw text message');
                    addMessage(event.data, 'bot');
                } catch (error) {
                    // Non-JSON payload
                    console.log('JSON parse error:', error);
                    setMsgLoading(false);
                    setLoadingMessage(null);
                    addMessage(event.data, 'bot');
                }
            };

            wsRef.current.onclose = () => {
                setIsConnected(false);
                setIsConnecting(false);
                setMsgLoading(false);
                setLoadingMessage(null);
                addMessage('Disconnected from chatbot', 'bot');
            };

            wsRef.current.onerror = () => {
                setIsConnected(false);
                setIsConnecting(false);
                setMsgLoading(false);
                setLoadingMessage(null);
                addMessage('Connection error. Please try again.', 'bot');
            };
        } catch {
            setIsConnecting(false);
            addMessage('Failed to connect. Please check your connection.', 'bot');
        }
    };

    const disconnectWebSocket = () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsConnected(false);
        setMsgLoading(false);
        setLoadingMessage(null);
    };

    const addMessage = (text: string, sender: 'user' | 'bot') => {
        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            sender,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
    };

    const addBotMessage = (text: string, category?: string, templates?: TemplateData[]) => {
        console.log('addBotMessage called with:', { text, category, templates });
        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            sender: 'bot',
            timestamp: new Date(),
            category,
            templates,
        };
        console.log('Created message:', newMessage);
        setMessages((prev) => [...prev, newMessage]);
    };

    const handleTemplateCardClick = (cardId: string, messageId: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ template_id: cardId }));
            addMessage(`Selected template: ${cardId}`, 'user');
            
            // Mark this template as selected for this message
            setSelectedTemplatesByMessage(prev => ({
                ...prev,
                [messageId]: cardId
            }));
        }
    };

    const sendMessage = () => {
        if (!inputValue.trim() || !isConnected) return;

        addMessage(inputValue, 'user');

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ message: inputValue }));
        }

        setInputValue('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-blue-200 bg-blue-50 ">
                <h2 className="text-xl font-semibold text-blue-900">Chatbot</h2>
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-blue-700">
                        {isConnecting
                            ? 'Connecting...'
                            : isConnected
                            ? 'Connected'
                            : authLoading
                            ? 'Checking auth...'
                            : user
                            ? 'Disconnected'
                            : 'Sign in required'}
                    </span>
                    {!isConnected ? (
                        <button
                            onClick={connectWebSocket}
                            disabled={isConnecting || !user || authLoading}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isConnecting ? 'Connecting...' : 'Connect'}
                        </button>
                    ) : (
                        <button
                            onClick={disconnectWebSocket}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                            Disconnect
                        </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !msgLoading && (
                    <div className="text-center text-gray-500 mt-8">
                        <p>No messages yet. {user ? 'Connect to start chatting!' : 'Sign in to start chatting!'}</p>
                    </div>
                )}

                {messages.map((message) => (
                    <div key={message.id}>
                        <div
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                                }`}
                            >
                                <div className="text-sm prose prose-sm max-w-none">
                                    {message.sender === 'bot' ? (
                                        <div className="markdown-content text-gray-800">
                                            <ReactMarkdown 
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                                                    h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                                    h2: ({children}) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                                                    h3: ({children}) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                                                    ul: ({children}) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                                                    ol: ({children}) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                                                    li: ({children}) => <li className="mb-1">{children}</li>,
                                                    code: ({children}) => <code className="bg-gray-300 text-gray-800 px-1 py-0.5 rounded text-xs">{children}</code>,
                                                    pre: ({children}) => <pre className="bg-gray-300 text-gray-800 p-2 rounded text-xs overflow-x-auto mb-2">{children}</pre>,
                                                    strong: ({children}) => <strong className="font-bold">{children}</strong>,
                                                    em: ({children}) => <em className="italic">{children}</em>,
                                                    a: ({href, children}) => <a href={href} className="text-blue-600 hover:text-blue-800 underline hover:no-underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                                                    blockquote: ({children}) => <blockquote className="border-l-4 border-gray-400 text-gray-600 pl-3 my-2">{children}</blockquote>
                                                }}
                                            >
                                                {message.text}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="text-white">{message.text}</p>
                                    )}
                                </div>
                                <p className="text-xs opacity-75 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                            </div>
                        </div>
                        
                        {/* Template Cards Grid */}
                        {(() => {
                            console.log('Checking template rendering for message:', {
                                id: message.id,
                                category: message.category,
                                hasTemplates: !!message.templates,
                                templatesLength: message.templates?.length,
                                selectedTemplate: selectedTemplatesByMessage[message.id]
                            });
                            
                            if (message.category === 'template_suggestion' && message.templates) {
                                const selectedTemplateId = selectedTemplatesByMessage[message.id];
                                
                                // If a template is selected, show only that template
                                if (selectedTemplateId) {
                                    const selectedTemplate = message.templates.find(t => t.id === selectedTemplateId);
                                    if (selectedTemplate) {
                                        console.log('Rendering selected template:', selectedTemplate);
                                        return (
                                            <div className="mt-4 mb-4">
                                                <TemplateCard
                                                    key={selectedTemplate.id}
                                                    id={selectedTemplate.id}
                                                    title={selectedTemplate.title}
                                                    description={selectedTemplate.description}
                                                    image_url={selectedTemplate.image_url}
                                                    onClick={(cardId) => handleTemplateCardClick(cardId, message.id)}
                                                />
                                            </div>
                                        );
                                    }
                                }
                                
                                // Otherwise, show all templates
                                console.log('Rendering all template cards:', message.templates);
                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mb-4">
                                        {message.templates.map((template) => {
                                            console.log('Rendering template card:', template);
                                            return (
                                                <TemplateCard
                                                    key={template.id}
                                                    id={template.id}
                                                    title={template.title}
                                                    description={template.description}
                                                    image_url={template.image_url}
                                                    onClick={(cardId) => handleTemplateCardClick(cardId, message.id)}
                                                />
                                            );
                                        })}
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                ))}

                {msgLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-200 text-gray-800 flex items-center space-x-2">
                            <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm">{loadingMessage ?? 'Loading...'}</p>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-blue-200 p-4">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                            isConnected ? 'Type your message...' : user ? 'Connect to start chatting' : 'Sign in to start chatting'
                        }
                        disabled={!isConnected}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!isConnected || !inputValue.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;