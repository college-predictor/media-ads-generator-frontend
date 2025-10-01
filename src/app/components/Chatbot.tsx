'use client';
import React, { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const Chatbot = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

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
                const data = JSON.parse(event.data || '{}');
                addMessage(data.message || event.data, 'bot');
            };

            wsRef.current.onclose = () => {
                setIsConnected(false);
                setIsConnecting(false);
                addMessage('Disconnected from chatbot', 'bot');
            };

            wsRef.current.onerror = () => {
                setIsConnected(false);
                setIsConnecting(false);
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
            <div className="flex items-center justify-between p-4 border-b border-blue-200 bg-blue-50">
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
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                        <p>No messages yet. {user ? 'Connect to start chatting!' : 'Sign in to start chatting!'}</p>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                            <p className="text-sm">{message.text}</p>
                            <p className="text-xs opacity-75 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                        </div>
                    </div>
                ))}
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