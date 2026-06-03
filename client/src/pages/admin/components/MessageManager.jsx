import { useState, useEffect, useRef } from 'react';
import { Input, Avatar, Badge, Button, Empty, Tag, Tooltip, Divider } from 'antd';
import { Search, Send, MessageCircle, User, Clock, CheckCheck, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import {
    requestCreateMessage,
    requestGetAllConversation,
    requestGetMessageByConversationIdAdmin,
    requestUpdateMessageIsRead,
} from '../../../config/MessageRequest';
import { useStore } from '../../../hooks/useStore';

const { TextArea } = Input;

// Mock data - replace with real API later

function MessageManager() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const { dataUser, newMessage, userOnlineStatus } = useStore();

    const fetchConversations = async () => {
        const res = await requestGetAllConversation();
        setUsers(res.metadata);
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            const fetchMessages = async () => {
                const res = await requestGetMessageByConversationIdAdmin(selectedUser._id);
                const data = {
                    conversationId: selectedUser._id,
                    sender: selectedUser.user._id,
                };
                await requestUpdateMessageIsRead(data);
                setMessages(res.metadata.messages);
            };
            fetchMessages();
        }
    }, [selectedUser]);

    useEffect(() => {
        if (newMessage) {
            setMessages((prev) => [...prev, newMessage]);
            fetchConversations();
        }
    }, [newMessage]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (userOnlineStatus) {
            setUsers((prev) =>
                prev.map((conv) => {
                    if (conv.user?._id === userOnlineStatus.userId) {
                        return {
                            ...conv,
                            user: {
                                ...conv.user,
                                isOnline: userOnlineStatus.isOnline,
                            },
                        };
                    }
                    return conv;
                })
            );

            if (selectedUser?.user?._id === userOnlineStatus.userId) {
                setSelectedUser((prev) => ({
                    ...prev,
                    user: {
                        ...prev.user,
                        isOnline: userOnlineStatus.isOnline,
                    },
                }));
            }
        }
    }, [userOnlineStatus]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        // Mark messages as read
        setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, lengthIsRead: 0 } : u)));
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !selectedUser) return;

        const data = {
            conversationId: selectedUser._id,
            content: inputMessage,
        };

        setInputMessage('');
        inputRef.current?.focus();

        const res = await requestCreateMessage(data);

        if (res) {
            setMessages((prev) => [...prev, res]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // const filteredUsers = users.filter((user) => user.fullName.toLowerCase().includes(searchQuery.toLowerCase()));

    const getTimeDisplay = (time) => {
        const now = dayjs();
        const messageTime = dayjs(time);
        const diffInMinutes = now.diff(messageTime, 'minute');
        const diffInHours = now.diff(messageTime, 'hour');
        const diffInDays = now.diff(messageTime, 'day');

        if (diffInMinutes < 1) return 'Vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes} phút`;
        if (diffInHours < 24) return `${diffInHours} giờ`;
        if (diffInDays < 7) return `${diffInDays} ngày`;
        return messageTime.format('DD/MM/YYYY');
    };

    // Xác định tin nhắn này là của admin hay khách
    const isAdminMessage = (message) => {
        return message.sender === 'admin' || message.sender?._id === dataUser._id || message.sender === dataUser._id;
    };

    return (
        <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 p-6">
            <div className="h-full  mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">Quản lý tin nhắn</h2>
                            <p className="text-gray-500 mt-1 ">Chat và hỗ trợ khách hàng</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div
                    className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
                    style={{ height: 'calc(100% - 120px)' }}
                >
                    <div className="flex h-full">
                        {/* Sidebar - User List */}
                        <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
                            {/* Search */}
                            <div className="p-4 border-b border-gray-200 bg-white">
                                <Input
                                    placeholder="Tìm kiếm người dùng..."
                                    prefix={<Search size={18} className="text-gray-400" />}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="rounded-lg"
                                    size="large"
                                />
                            </div>

                            {/* User List */}
                            <div className="flex-1 overflow-y-auto">
                                {users.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Empty description="Không tìm thấy người dùng" />
                                    </div>
                                ) : (
                                    users.map((conversation) => {
                                        const user = conversation.user;
                                        const lastMessage = conversation.lastMessage;
                                        return (
                                            <motion.div
                                                key={conversation._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                onClick={() => handleSelectUser(conversation)}
                                                className={`p-4 cursor-pointer transition-all border-b border-gray-100 ${
                                                    selectedUser?._id === conversation._id
                                                        ? 'bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-l-[#FF3B2F]'
                                                        : 'hover:bg-gray-100'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="relative flex-shrink-0">
                                                        <Avatar size={48} src={user?.avatar}>
                                                            {user?.fullName?.[0]}
                                                        </Avatar>
                                                        <span
                                                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${
                                                                user?.isOnline ? 'bg-green-400' : 'bg-gray-300'
                                                            }`}
                                                        ></span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-semibold text-gray-800 truncate">
                                                                {user?.fullName}
                                                            </span>
                                                            <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                                                {getTimeDisplay(lastMessage?.createdAt)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm text-gray-500 truncate flex-1">
                                                                {lastMessage?.content}
                                                            </p>
                                                            {conversation.lengthIsRead > 0 && (
                                                                <Badge
                                                                    count={conversation.lengthIsRead}
                                                                    className="ml-2"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 flex flex-col">
                            {selectedUser ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-gray-200 bg-white">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <Avatar size={48} src={selectedUser.user?.avatar}>
                                                        {selectedUser.user?.fullName}
                                                    </Avatar>
                                                    <span
                                                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${
                                                            selectedUser.user?.isOnline ? 'bg-green-400' : 'bg-gray-300'
                                                        }`}
                                                    ></span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-800">
                                                        {selectedUser.user?.fullName}
                                                    </h3>
                                                    <div className="flex items-center gap-1">
                                                        <Circle
                                                            size={8}
                                                            className={
                                                                selectedUser.user?.isOnline
                                                                    ? 'text-green-400 fill-green-400'
                                                                    : 'text-gray-300 fill-gray-300'
                                                            }
                                                        />
                                                        <span className="text-xs text-gray-500">
                                                            {selectedUser.user?.isOnline
                                                                ? 'Đang hoạt động'
                                                                : 'Không hoạt động'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Tag color="blue">Khách hàng</Tag>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
                                        <AnimatePresence>
                                            {messages.map((message) => (
                                                <motion.div
                                                    key={message._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`mb-4 flex ${
                                                        isAdminMessage(message) ? 'justify-end' : 'justify-start'
                                                    }`}
                                                >
                                                    <div
                                                        className={`flex gap-2 max-w-[70%] ${
                                                            isAdminMessage(message) ? 'flex-row-reverse' : 'flex-row'
                                                        }`}
                                                    >
                                                        {!isAdminMessage(message) && (
                                                            <Avatar
                                                                size={32}
                                                                src={selectedUser.user?.avatar}
                                                                className="flex-shrink-0 mt-auto"
                                                            >
                                                                {selectedUser.user?.fullName?.[0]}
                                                            </Avatar>
                                                        )}
                                                        <div>
                                                            <div
                                                                className={`px-4 py-3 rounded-2xl shadow-sm ${
                                                                    isAdminMessage(message)
                                                                        ? 'bg-gradient-to-br from-[#FF3B2F] to-[#FF6F4A] text-white'
                                                                        : 'bg-white border border-gray-200 text-gray-800'
                                                                }`}
                                                            >
                                                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                                    {message.content}
                                                                </p>
                                                            </div>
                                                            <div
                                                                className={`flex items-center gap-1.5 mt-1 px-2 ${
                                                                    isAdminMessage(message)
                                                                        ? 'justify-end'
                                                                        : 'justify-start'
                                                                }`}
                                                            >
                                                                <Clock size={10} className="text-gray-400" />
                                                                <span className="text-xs text-gray-400">
                                                                    {dayjs(message.createdAt).format('HH:mm')}
                                                                </span>
                                                                {isAdminMessage(message) && (
                                                                    <CheckCheck
                                                                        size={14}
                                                                        className={
                                                                            message.isRead === true
                                                                                ? 'text-blue-500'
                                                                                : 'text-gray-400'
                                                                        }
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                        {isAdminMessage(message) && (
                                                            <Avatar
                                                                size={32}
                                                                className="flex-shrink-0 mt-auto"
                                                                style={{ backgroundColor: '#FF3B2F' }}
                                                            >
                                                                <User size={16} />
                                                            </Avatar>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {/* Typing Indicator */}
                                        {isTyping && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex gap-2 mb-4"
                                            >
                                                <Avatar size={32} src={selectedUser.user?.avatar}>
                                                    {selectedUser.user?.fullName?.[0]}
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

                                    {/* Input Area */}
                                    <div className="p-4 border-t border-gray-200 bg-white">
                                        <div className="flex gap-3">
                                            <TextArea
                                                ref={inputRef}
                                                value={inputMessage}
                                                onChange={(e) => setInputMessage(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Nhập tin nhắn..."
                                                autoSize={{ minRows: 1, maxRows: 4 }}
                                                className="flex-1 rounded-xl border-gray-300 focus:border-[#FF3B2F] hover:border-[#FF3B2F]"
                                            />
                                            <Button
                                                type="primary"
                                                size="large"
                                                icon={<Send size={20} />}
                                                onClick={handleSendMessage}
                                                disabled={!inputMessage.trim()}
                                                className="!bg-gradient-to-br from-[#FF3B2F] to-[#FF6F4A] border-0 hover:shadow-lg transition-all !px-8 disabled:opacity-50"
                                            >
                                                Gửi
                                            </Button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 text-center">
                                            Nhấn Enter để gửi, Shift + Enter để xuống dòng
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                                    <div className="text-center">
                                        <div className="w-24 h-24 bg-gradient-to-br from-[#FF3B2F] to-[#FF6F4A] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                            <MessageCircle className="text-white" size={48} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                            Chọn một cuộc trò chuyện
                                        </h3>
                                        <p className="text-gray-500">Chọn người dùng từ danh sách để bắt đầu chat</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MessageManager;
