import { useState, useRef, useEffect } from 'react';
import { Button, Input, Spin, Avatar, Badge, Tooltip, Typography } from 'antd';
import { SendOutlined, RobotOutlined, CloseOutlined, MessageOutlined } from '@ant-design/icons';
import { useStore } from '../hooks/useStore';
import { useNavigate } from 'react-router-dom';
import { requestChatbot, requestGetMessageChatbot } from '../config/UserRequest';

const { Text } = Typography;

const WELCOME_MESSAGE = {
    _id: 'welcome',
    sender: 'bot',
    content: `Xin chào! 👋 Mình là **SneakerBot** – trợ lý tư vấn chọn giày thông minh của cửa hàng.

👟 Mình có thể giúp bạn:
- Tìm mẫu giày theo môn thể thao (Bóng rổ, Chạy bộ, Pickleball...)
- Gợi ý giày theo giới tính (Nam, Nữ, Trẻ em) & ngân sách
- Kiểm tra size còn hàng & tư vấn chọn size chân chuẩn
- Xem các mẫu giày đang có Flash Sale giảm sâu 🔥

Bạn cần tìm mẫu giày như thế nào? Cứ nhắn cho mình nhé! 😊`,
    timestamp: new Date(),
};

const QUICK_SUGGESTIONS = [
    '🔥 Mẫu giày đang giảm giá hot nhất?',
    '🏀 Tư vấn giày bóng rổ nam',
    '👟 Giày chạy bộ dưới 1 triệu',
    '🎾 Tư vấn giày chơi pickleball',
    '📏 Cách đo và chọn size giày chuẩn',
];

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const { dataUser } = useStore();
    const navigate = useNavigate();

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest',
            });
        }, 100);
    };

    useEffect(() => {
        const fetchMessageChatbot = async () => {
            try {
                const res = await requestGetMessageChatbot();
                if (res.metadata && res.metadata.length > 0) {
                    setMessages(res.metadata);
                } else {
                    setMessages([WELCOME_MESSAGE]);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
                setMessages([WELCOME_MESSAGE]);
            }
        };
        if (!dataUser._id) return;
        fetchMessageChatbot();
    }, [dataUser._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!isLoading) scrollToBottom();
    }, [isLoading]);

    useEffect(() => {
        if (isOpen && messages.length > 0) scrollToBottom();
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) setUnreadCount(0);
    }, [isOpen]);

    const handleSend = async (customText) => {
        const textToSend = (typeof customText === 'string' ? customText : inputValue).trim();
        if (!textToSend) return;

        if (!dataUser._id) {
            const shouldLogin = window.confirm(
                '🔐 Bạn cần đăng nhập để trò chuyện với trợ lý AI. Bạn có muốn đăng nhập ngay bây giờ không?',
            );
            if (shouldLogin) navigate('/login');
            return;
        }

        const userMessage = {
            _id: Date.now().toString(),
            sender: 'user',
            content: textToSend,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setTimeout(() => scrollToBottom(), 50);

        try {
            const res = await requestChatbot({ question: textToSend });
            const botMessage = {
                _id: (Date.now() + 1).toString(),
                sender: 'bot',
                content: res.metadata,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
            setTimeout(() => scrollToBottom(), 100);
            if (!isOpen) setUnreadCount((prev) => prev + 1);
        } catch (error) {
            const errorMessage = {
                _id: (Date.now() + 1).toString(),
                sender: 'bot',
                content: '❌ Xin lỗi, hệ thống AI đang quá tải hoặc gặp sự cố. Bạn vui lòng thử lại sau giây lát nhé!',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
            setTimeout(() => scrollToBottom(), 100);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Render formatted markdown text with clickable links and bold tags
    const renderFormattedMessage = (content) => {
        if (!content) return null;
        const lines = content.split('\n');

        return lines.map((line, lineIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={lineIdx} className="h-2" />;

            // Ignore markdown table divider line (|---|---|)
            if (/^\|[-|\s]+\|$/.test(trimmed)) return null;

            // Header styling
            const isH3 = trimmed.startsWith('### ');
            const isH2 = trimmed.startsWith('## ');
            const isH1 = trimmed.startsWith('# ');
            const cleanLine = isH3 ? trimmed.slice(4) : isH2 ? trimmed.slice(3) : isH1 ? trimmed.slice(2) : line;

            // Markdown Link & Bold splitting
            const parts = cleanLine.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);

            return (
                <div
                    key={lineIdx}
                    className={`my-0.5 ${
                        isH1 || isH2 || isH3
                            ? 'font-bold text-gray-900 mt-2 mb-1 text-sm'
                            : 'leading-relaxed text-sm'
                    }`}
                >
                    {parts.map((part, partIdx) => {
                        if (!part) return null;

                        // Markdown Link: [text](url)
                        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                        if (linkMatch) {
                            const [, linkText, linkUrl] = linkMatch;
                            return (
                                <button
                                    key={partIdx}
                                    type="button"
                                    onClick={() => {
                                        if (linkUrl.startsWith('/')) {
                                            navigate(linkUrl);
                                        } else {
                                            window.open(linkUrl, '_blank');
                                        }
                                    }}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded border border-red-200 transition-colors mx-1 cursor-pointer my-0.5 shadow-2xs"
                                >
                                    <span>👉 {linkText}</span>
                                </button>
                            );
                        }

                        // Bold text: **bold**
                        const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
                        if (boldMatch) {
                            return (
                                <strong key={partIdx} className="font-semibold text-gray-900">
                                    {boldMatch[1]}
                                </strong>
                            );
                        }

                        return <span key={partIdx}>{part}</span>;
                    })}
                </div>
            );
        });
    };

    return (
        <div className="fixed bottom-24 right-6 z-50">
            {isOpen ? (
                <div className="bg-white rounded-2xl shadow-2xl w-[380px] sm:w-[420px] h-[520px] max-h-[85vh] flex flex-col border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#FF3B2F] via-[#FF5722] to-[#FF8A65] text-white p-4 relative shadow-md">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Avatar
                                    size={42}
                                    icon={<RobotOutlined />}
                                    className="bg-white/20 border-2 border-white/40 shadow-sm"
                                />
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="font-bold text-base tracking-wide text-white">SneakerBot AI</h3>
                                        <span className="bg-white/20 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded text-white">
                                            Trợ lý
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-xs text-white/90">Sẵn sàng tư vấn 24/7</span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                type="text"
                                icon={<CloseOutlined />}
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 rounded-full"
                                size="middle"
                            />
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-smooth text-sm">
                        {messages.map((message, index) => (
                            <div
                                key={message._id || index}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                            >
                                <div
                                    className={`flex items-start gap-2.5 max-w-[85%] ${
                                        message.sender === 'user' ? 'flex-row-reverse' : ''
                                    }`}
                                >
                                    {message.sender === 'bot' && (
                                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-[#FF3B2F] font-bold text-xs border border-red-200">
                                            🤖
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <div
                                            className={`rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${
                                                message.sender === 'user'
                                                    ? 'bg-[#FF3B2F] text-white rounded-br-none'
                                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                                            }`}
                                        >
                                            {message.sender === 'user' ? (
                                                <p className="whitespace-pre-wrap">{message.content}</p>
                                            ) : (
                                                renderFormattedMessage(message.content)
                                            )}
                                        </div>
                                        <Text
                                            className={`text-[10px] mt-1 ${
                                                message.sender === 'user'
                                                    ? 'text-right text-gray-400'
                                                    : 'text-left text-gray-400'
                                            }`}
                                        >
                                            {formatTime(message.timestamp || message.createdAt)}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex items-start gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-[#FF3B2F] font-bold text-xs border border-red-200">
                                        🤖
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm rounded-bl-none">
                                        <div className="flex items-center gap-2">
                                            <Spin size="small" />
                                            <Text className="text-gray-500 text-xs font-medium">
                                                SneakerBot đang tìm kiếm giày phù hợp...
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-1" />
                    </div>

                    {/* Quick Suggestions */}
                    {messages.length <= 3 && !isLoading && (
                        <div className="px-3 py-2 bg-gray-100 border-t border-gray-200 overflow-x-auto flex gap-1.5 no-scrollbar">
                            {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(suggestion)}
                                    className="whitespace-nowrap text-xs bg-white hover:bg-red-50 text-gray-700 hover:text-[#FF3B2F] px-2.5 py-1 rounded-full border border-gray-200 hover:border-red-300 transition-colors shadow-2xs flex-shrink-0"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-200">
                        <div className="flex gap-2 items-center">
                            <Input.TextArea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Hỏi SneakerBot (vd: Tìm giày bóng rổ dưới 1tr)..."
                                autoSize={{ minRows: 1, maxRows: 3 }}
                                className="flex-1 rounded-xl border-gray-300 focus:border-[#FF3B2F] text-sm"
                                disabled={isLoading}
                                autoFocus
                            />
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={() => handleSend()}
                                disabled={isLoading || !inputValue.trim()}
                                className="!bg-[#FF3B2F] hover:!bg-[#e02d22] border-0 rounded-xl h-10 w-10 flex items-center justify-center flex-shrink-0 shadow-sm"
                            />
                        </div>
                        <div className="flex items-center justify-between mt-1 px-1">
                            <span className="text-[10px] text-gray-400">
                                Nhấn Enter để gửi
                            </span>
                            {!dataUser._id && (
                                <span className="text-[10px] text-orange-500 font-medium">
                                    Cần đăng nhập để trò chuyện
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <Tooltip title="Tư vấn chọn giày cùng AI" placement="left">
                    <div className="relative">
                        <button
                            onClick={() => setIsOpen(true)}
                            className="w-14 h-14 rounded-full bg-gradient-to-r from-[#FF3B2F] to-[#FF6F4A] hover:scale-105 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-white"
                        >
                            <RobotOutlined className="text-white text-2xl" />
                        </button>
                        {unreadCount > 0 && (
                            <Badge
                                count={unreadCount}
                                className="absolute -top-1 -right-1"
                                style={{ backgroundColor: '#ff4d4f' }}
                            />
                        )}
                        <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                </Tooltip>
            )}
        </div>
    );
}

export default Chatbot;