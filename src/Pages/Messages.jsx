import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import LoginRequiredModal from '@/Components/LoginRequiredModal';
import { logToDiscord } from '@/utils';

export default function Messages() {
    const [user, setUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messageInput, setMessageInput] = useState("");
    const [showLoginModal, setShowLoginModal] = useState(false);
    const scrollRef = useRef(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        base44.auth.me().then(u => {
            if (!u) {
                setShowLoginModal(true);
                return;
            }
            setUser(u);
        });
    }, []);

    const [searchParams] = useSearchParams();
    const initialRecipient = searchParams.get('to');

    // Fetch all messages where user is sender OR receiver
    // Note: In a real app with many messages, we'd want a better way to aggregate conversations.
    // Here we fetch recent messages to build the conversation list.
    const { data: allMessages, isLoading } = useQuery({
        queryKey: ['messages', user?.email],
        queryFn: async () => {
            if (!user) return [];
            // Fetch received
            const received = await base44.entities.DirectMessage.list({
                query: { receiver_email: user.email },
                sort: { created_date: -1 },
                limit: 200
            });
            // Fetch sent
            const sent = await base44.entities.DirectMessage.list({
                query: { sender_email: user.email },
                sort: { created_date: -1 },
                limit: 200
            });
            return [...received, ...sent].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        },
        enabled: !!user,
        refetchInterval: 5000
    });

    // Extract unique conversation partners
    const conversations = React.useMemo(() => {
        if (!allMessages || !user) return [];
        const partners = new Map();

        allMessages.forEach(msg => {
            const partnerEmail = msg.sender_email === user.email ? msg.receiver_email : msg.sender_email;
            if (!partners.has(partnerEmail)) {
                partners.set(partnerEmail, {
                    email: partnerEmail,
                    lastMessage: msg,
                    unread: msg.receiver_email === user.email && !msg.is_read
                });
            }
        });
        return Array.from(partners.values());
    }, [allMessages, user]);

    // Handle initial recipient from URL
    useEffect(() => {
        if (initialRecipient && user && !selectedUser) {
            setSelectedUser({ email: initialRecipient });
        }
    }, [initialRecipient, user]);

    // Fetch current conversation messages
    const currentMessages = React.useMemo(() => {
        if (!selectedUser || !allMessages) return [];
        return allMessages.filter(m =>
            (m.sender_email === user.email && m.receiver_email === selectedUser.email) ||
            (m.sender_email === selectedUser.email && m.receiver_email === user.email)
        ).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    }, [allMessages, selectedUser, user]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [currentMessages]);

    // Mark as read when opening conversation
    useEffect(() => {
        if (selectedUser && currentMessages.length > 0) {
            const unreadIds = currentMessages
                .filter(m => m.receiver_email === user.email && !m.is_read)
                .map(m => m.id);

            if (unreadIds.length > 0) {
                // Bulk update isn't available in SDK usually, do one by one or just latest
                // For efficiency in this demo, we'll just update the visible ones
                unreadIds.forEach(id => base44.entities.DirectMessage.update(id, { is_read: true }));
                queryClient.invalidateQueries(['messages']);
            }
        }
    }, [selectedUser, currentMessages.length]); // Simple dependency check

    const sendMessageMutation = useMutation({
        mutationFn: async () => {
            await base44.entities.DirectMessage.create({
                sender_email: user.email,
                receiver_email: selectedUser.email,
                content: messageInput,
                is_read: false
            });

            // Send notification
            await base44.entities.Notification.create({
                user_email: selectedUser.email,
                type: 'system',
                message: `New message from ${user.full_name || user.email}`,
                link: `/messages?to=${user.email}`,
                is_read: false
            });
        },
        onSuccess: () => {
            setMessageInput("");
            queryClient.invalidateQueries(['messages']);
            toast.success('Message sent!');
            logToDiscord('Message Sent', {
                type: 'message',
                user: user.full_name || user.username,
                email: user.email,
                description: `💬 Message sent to ${selectedUser.email}`,
                extra: { 'Recipient': selectedUser.email }
            });
        },
        onError: () => {
            toast.error('Failed to send message');
        }
    });

    const handleSend = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedUser) return;
        sendMessageMutation.mutate();
    };

    if (!user) return null;

    return (
        <>
        <LoginRequiredModal 
            isOpen={showLoginModal} 
            onClose={() => setShowLoginModal(false)}
            message="You must login first to access messages"
        />
        <div className="h-[calc(100vh-100px)] max-w-7xl mx-auto p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">

                {/* Sidebar / Conversation List */}
                <div className={`md:border-r border-zinc-800 flex flex-col h-full ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-zinc-800 bg-zinc-900/80">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">Messages</h2>
                            <Button size="icon" variant="ghost" className="text-zinc-400 hover:text-white">
                                <img src="https://img.icons8.com/3d-fluency/94/plus.png" className="w-5 h-5" alt="New" />
                            </Button>
                        </div>
                        <div className="relative">
                            <img src="https://img.icons8.com/3d-fluency/94/search.png" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" alt="Search" />
                            <Input placeholder="Search chats..." className="bg-zinc-950 border-zinc-800 pl-9 h-9" />
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {conversations.map(conv => (
                                <button
                                    key={conv.email}
                                    onClick={() => setSelectedUser({ email: conv.email })}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${selectedUser?.email === conv.email
                                        ? 'bg-fuchsia-500/10 border border-fuchsia-500/20'
                                        : 'hover:bg-zinc-800 border border-transparent'
                                        }`}
                                >
                                    <div className="relative">
                                        <Avatar className="w-10 h-10 border border-zinc-700">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.email}`} />
                                            <AvatarFallback><img src="https://img.icons8.com/3d-fluency/94/user-male-circle.png" className="w-full h-full" alt="User" /></AvatarFallback>
                                        </Avatar>
                                        {conv.unread && <span className="absolute top-0 right-0 w-3 h-3 bg-fuchsia-500 border-2 border-zinc-900 rounded-full" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className={`font-medium truncate ${selectedUser?.email === conv.email ? 'text-fuchsia-400' : 'text-zinc-200'}`}>
                                                {conv.email.split('@')[0]}
                                            </span>
                                            <span className="text-[10px] text-zinc-500">
                                                {formatDistanceToNow(new Date(conv.lastMessage.created_date), { addSuffix: false })}
                                            </span>
                                        </div>
                                        <p className={`text-xs truncate ${conv.unread ? 'text-zinc-100 font-medium' : 'text-zinc-500'}`}>
                                            {conv.lastMessage.sender_email === user.email && "You: "}
                                            {conv.lastMessage.content}
                                        </p>
                                    </div>
                                </button>
                            ))}
                            {conversations.length === 0 && (
                                <div className="text-center py-10 text-zinc-500 text-sm">
                                    No active conversations.
                                    <br />Start a chat from the community page!
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Chat Area */}
                <div className={`md:col-span-2 lg:col-span-3 flex flex-col h-full bg-zinc-950/30 ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    {selectedUser ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => setSelectedUser(null)}>
                                        <img src="https://img.icons8.com/3d-fluency/94/left.png" className="w-5 h-5" alt="Back" />
                                    </Button>
                                    <Avatar className="w-9 h-9 border border-zinc-700">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.email}`} />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold text-zinc-100">{selectedUser.email.split('@')[0]}</div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                            <span className="text-xs text-emerald-500 font-medium">Online</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                                    <img src="https://img.icons8.com/3d-fluency/94/menu.png" className="w-5 h-5" alt="Menu" />
                                </Button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800" ref={scrollRef}>
                                {currentMessages.map((msg, idx) => {
                                    const isMe = msg.sender_email === user.email;
                                    return (
                                        <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${isMe
                                                ? 'bg-fuchsia-600 text-white rounded-tr-none'
                                                : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700'
                                                }`}>
                                                <p className="leading-relaxed">{msg.content}</p>
                                                <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-fuchsia-200' : 'text-zinc-500'}`}>
                                                    {formatDistanceToNow(new Date(msg.created_date), { addSuffix: true })}
                                                    {isMe && (
                                                        msg.is_read ? <img src="https://img.icons8.com/3d-fluency/94/double-tick.png" className="w-3 h-3" alt="Read" /> : <img src="https://img.icons8.com/3d-fluency/94/checkmark.png" className="w-3 h-3" alt="Sent" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                                <form onSubmit={handleSend} className="flex items-center gap-3">
                                    <Input
                                        value={messageInput}
                                        onChange={e => setMessageInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="bg-zinc-950 border-zinc-700 focus:border-fuchsia-500 focus:ring-fuchsia-500/20 rounded-full h-11 pl-5"
                                        autoFocus
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={!messageInput.trim() || sendMessageMutation.isPending}
                                        className="rounded-full w-11 h-11 bg-fuchsia-600 hover:bg-fuchsia-700 text-white shrink-0 shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all hover:scale-105"
                                    >
                                        <img src="https://img.icons8.com/3d-fluency/94/paper-plane.png" className="w-5 h-5 ml-0.5" alt="Send" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-10">
                            <div className="w-24 h-24 rounded-full bg-zinc-900 border-2 border-dashed border-zinc-800 flex items-center justify-center mb-6 animate-pulse">
                                <img src="https://cdn3d.iconscout.com/3d/premium/thumb/message-3d-icon-png-download-5576258.png" className="w-10 h-10 opacity-20" alt="Empty" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-300 mb-2">Select a conversation</h3>
                            <p className="text-center max-w-sm">Choose a user from the sidebar or visit the community page to start a new chat.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
}
