import { useState, useEffect, useRef } from 'react';
import { Badge, Avatar, Input, Button, Tooltip } from 'antd';
import { MessageCircle, Send, X, Minimize2, Maximize2, User, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { useStore } from '../../hooks/useStore';

import { requestCreateMessage, requestGetMessageByConversationIdAdmin } from '../../config/MessageRequest';

const { TextArea } = Input;

function ModalChat() {
    const { dataUser, dataConversation, newMessage } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (dataConversation) {
            const fetchMessages = async () => {
                const res = await requestGetMessageByConversationIdAdmin(dataConversation);
                setMessages(res.metadata.messages);
            };
            fetchMessages();
        }
    }, [dataConversation]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: 1,
                    text: 'Xin chào! Chúng tôi có thể giúp gì cho bạn?',
                    sender: 'admin',
                    timestamp: new Date(),
                },
            ]);
        }
    }, [isOpen, messages.length]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (newMessage) {
            setMessages((prev) => [...prev, newMessage]);
        }
    }, [newMessage]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const newMessage = {
            id: Date.now(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputMessage('');
        inputRef.current?.focus();

        const data = {
            conversationId: dataConversation,
            content: inputMessage,
        };

        await requestCreateMessage(data);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadCount(0);
        }
    };

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    // Xác định tin nhắn này là của user hiện tại hay admin
    const isUserMessage = (message) => {
        return message.sender === 'user' || message.sender === dataUser?._id || message.sender?._id === dataUser?._id;
    };

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <Tooltip title="Chat với chúng tôi" placement="left">
                            <Badge count={unreadCount} offset={[-5, 5]}>
                                <Button
                                    type="primary"
                                    shape="circle"
                                    size="large"
                                    onClick={toggleChat}
                                    className="!w-16 !h-16 !bg-gradient-to-br from-[#FF3B2F] to-[#FF6F4A] border-0 shadow-2xl hover:shadow-[#FF3B2F]/50 hover:scale-110 transition-all duration-300"
                                    icon={<MessageCircle size={28} />}
                                />
                            </Badge>
                        </Tooltip>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-50 w-[380px] md:w-[420px] shadow-2xl rounded-2xl overflow-hidden"
                    >
                        <div className="bg-white rounded-2xl border border-gray-200">
                            <div className="bg-gradient-to-r from-[#FF3B2F] to-[#FF6F4A] p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar
                                            size={48}
                                            className="border-2 border-white"
                                            style={{ backgroundColor: '#fff', color: '#FF3B2F' }}
                                        >
                                            <User size={24} />
                                        </Avatar>
                                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></span>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Hỗ trợ khách hàng</h3>
                                        <p className="text-white/90 text-xs">Đang hoạt động</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="text"
                                        shape="circle"
                                        icon={isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                                        onClick={toggleMinimize}
                                        className="!text-white hover:!bg-white/20"
                                    />
                                    <Button
                                        type="text"
                                        shape="circle"
                                        icon={<X size={20} />}
                                        onClick={toggleChat}
                                        className="!text-white hover:!bg-white/20"
                                    />
                                </div>
                            </div>

                            {!isMinimized && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}>
                                    <div className="h-[400px] overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
                                        {messages.map((message) => (
                                            <motion.div
                                                key={message.id || message._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`mb-4 flex ${
                                                    isUserMessage(message) ? 'justify-end' : 'justify-start'
                                                }`}
                                            >
                                                <div
                                                    className={`flex gap-2 max-w-[75%] ${
                                                        isUserMessage(message) ? 'flex-row-reverse' : 'flex-row'
                                                    }`}
                                                >
                                                    {!isUserMessage(message) && (
                                                        <Avatar
                                                            size={32}
                                                            className="flex-shrink-0 mt-auto"
                                                            style={{ backgroundColor: '#FF3B2F' }}
                                                        >
                                                            <User size={16} />
                                                        </Avatar>
                                                    )}
                                                    <div>
                                                        <div
                                                            className={`px-4 py-3 rounded-2xl shadow-sm ${
                                                                isUserMessage(message)
                                                                    ? 'bg-gradient-to-br from-[#FF3B2F] to-[#FF6F4A] text-white'
                                                                    : 'bg-white border border-gray-200 text-gray-800'
                                                            }`}
                                                        >
                                                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                                {message.content || message.text}
                                                            </p>
                                                        </div>
                                                        <div
                                                            className={`flex items-center gap-1 mt-1 px-2 ${
                                                                isUserMessage(message) ? 'justify-end' : 'justify-start'
                                                            }`}
                                                        >
                                                            <Clock size={10} className="text-gray-400" />
                                                            <span className="text-xs text-gray-400">
                                                                {dayjs(message.timestamp || message.createdAt).format(
                                                                    'HH:mm',
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {isUserMessage(message) && (
                                                        <Avatar
                                                            size={32}
                                                            className="flex-shrink-0 mt-auto"
                                                            style={{ backgroundColor: '#1890ff' }}
                                                        >
                                                            {dataUser?.fullName?.[0] || 'U'}
                                                        </Avatar>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}

                                        {isTyping && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex gap-2 mb-4"
                                            >
                                                <Avatar size={32} style={{ backgroundColor: '#FF3B2F' }}>
                                                    <User size={16} />
                                                </Avatar>
                                                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl">
                                                    <div className="flex gap-1">
                                                        <span
                                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: '0ms' }}
                                                        ></span>
                                                        <span
                                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: '150ms' }}
                                                        ></span>
                                                        <span
                                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: '300ms' }}
                                                        ></span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        <div ref={messagesEndRef} />
                                    </div>

                                    <div className="p-4 bg-white border-t border-gray-200">
                                        <div className="flex gap-2">
                                            <TextArea
                                                ref={inputRef}
                                                value={inputMessage}
                                                onChange={(e) => setInputMessage(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Nhập tin nhắn..."
                                                autoSize={{ minRows: 1, maxRows: 3 }}
                                                className="flex-1 rounded-xl border-gray-300 focus:border-[#FF3B2F] hover:border-[#FF3B2F]"
                                            />
                                            <Button
                                                type="primary"
                                                shape="circle"
                                                size="large"
                                                icon={<Send size={20} />}
                                                onClick={handleSendMessage}
                                                disabled={!inputMessage.trim()}
                                                className="!bg-gradient-to-br from-[#FF3B2F] to-[#FF6F4A] border-0 hover:shadow-lg transition-all flex-shrink-0 disabled:opacity-50"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 text-center">
                                            Nhấn Enter để gửi, Shift + Enter để xuống dòng
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default ModalChat;
