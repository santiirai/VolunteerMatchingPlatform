import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Search, MessageCircle, MoreVertical, Phone, Video, Loader2 } from 'lucide-react';

export default function ChatInterface({ currentUser, startChatWith }) {
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const pollingInterval = useRef(null);

    // Handle initial chat user (e.g. from "Message" button in other tabs)
    useEffect(() => {
        if (startChatWith) {
            setSelectedUser(startChatWith);
            // If this user isn't in conversations list yet, we might want to add them temporarily
            // But fetchConversations will run and might not have them if no messages exist yet.
            // visual logic handles this by showing selectedUser even if not in list on left?
            // Yes, because sidebar checks selectedUser?.id === conv.id
        }
    }, [startChatWith]);

    // Fetch conversations on mount
    useEffect(() => {
        fetchConversations();
        // Poll for new conversations/unread counts
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    // Fetch messages when selected user changes
    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser.id);
            // Poll for new messages in active chat
            pollingInterval.current = setInterval(() => fetchMessages(selectedUser.id), 3000);
        }
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [selectedUser]);

    // Scroll to bottom of chat
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('authToken');
            
            const baseUrl = currentUser.role === 'ORGANIZATION' ? '/api' : '/api/volunteer';

            const response = await fetch(`${baseUrl}/messages/conversations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setConversations(data.data);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            setLoading(false);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const token = localStorage.getItem('authToken');
            const baseUrl = currentUser.role === 'ORGANIZATION' ? '/api' : '/api/volunteer';

            const response = await fetch(`${baseUrl}/messages/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data.data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        setSending(true);
        try {
            const token = localStorage.getItem('authToken');
            const baseUrl = currentUser.role === 'ORGANIZATION' ? '/api' : '/api/volunteer';

            const response = await fetch(`${baseUrl}/messages/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiverId: selectedUser.id,
                    content: newMessage
                })
            });

            if (response.ok) {
                setNewMessage('');
                fetchMessages(selectedUser.id);
                fetchConversations(); // Update last message in sidebar
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-200px)] min-h-[500px] surface overflow-hidden">
            {/* Sidebar - Conversations */}
            <div className={`w-full md:w-80 glass flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.length > 0 ? (
                        conversations.map(conv => (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedUser(conv)}
                                className={`w-full p-4 flex items-center space-x-3 hover:bg-white transition-colors border-b border-gray-100 text-left ${selectedUser?.id === conv.id ? 'bg-white border-l-4 border-l-purple-600' : ''
                                    }`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {conv.name[0]}
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full border-2 border-white">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-semibold text-gray-900 truncate">{conv.name}</h4>
                                        <span className="text-xs text-gray-500">
                                            {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                                        {conv.lastMessage}
                                    </p>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No conversations yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col surface ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 glass flex items-center justify-between z-10">
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="md:hidden p-2 -ml-2 text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {selectedUser.name[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{selectedUser.name}</h3>
                                    {/* <p className="text-xs text-green-600 flex items-center">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                        Online
                                    </p> */}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-400">
                                {/* <button className="p-2 hover:bg-gray-100 rounded-full"><Phone className="w-5 h-5" /></button>
                                <button className="p-2 hover:bg-gray-100 rounded-full"><Video className="w-5 h-5" /></button> */}
                                <button className="p-2 hover:bg-gray-100 rounded-full"><MoreVertical className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {messages.map((msg) => {
                                const isSenderMe = msg.sender.id === currentUser.user?.id || msg.sender.id === parseInt(localStorage.getItem('userId')); // Careful with types

                                return (
                                    <div key={msg.id} className={`flex ${isSenderMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl p-4 ${isSenderMe
                                            ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-br-none'
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                            }`}>
                                            <p className="text-sm">{msg.content}</p>
                                            <div className={`text-[10px] mt-1 text-right ${isSenderMe ? 'text-purple-200' : 'text-gray-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 glass">
                            <form onSubmit={handleSendMessage} className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
                                >
                                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Your Messages</h3>
                        <p className="max-w-xs text-center">Select a conversation from the sidebar to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
