const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const Product = require('../models/product.model');
const MessageChatbot = require('../models/messageChatbot.model');

/**
 * AI tư vấn sản phẩm giày (có ngữ cảnh hội thoại)
 * @param {string} question - Câu hỏi người dùng
 * @param {string} userId - ID người dùng
 * @returns {Promise<string>} - Câu trả lời từ AI
 */
async function askShoeAssistant(question, userId) {
    try {
        // 🧠 Lấy 5 tin nhắn gần nhất để hiểu ngữ cảnh hội thoại
        const recentMessages = await MessageChatbot.find({ userId }).sort({ createdAt: -1 }).limit(5).lean();

        // Sắp xếp lại đúng thứ tự thời gian
        const conversation = recentMessages.reverse();

        // Chuyển đổi hội thoại thành dạng text
        const conversationText = conversation
            .map((msg) => `${msg.sender === 'user' ? 'Người dùng' : 'Bot'}: ${msg.content}`)
            .join('\n');

        // 🛍️ Lấy danh sách sản phẩm để AI tư vấn
        const products = await Product.find({ status: 'active' });
        if (!products.length) return 'Hiện tại chưa có sản phẩm nào trong cửa hàng.';

        const productData = products
            .map(
                (p) => `
Tên: ${p.name}
Giá: ${p.price.toLocaleString('vi-VN')}đ
Giảm giá: ${p.discount}%
Màu: ${(p.colors || []).map((c) => c.name).join(', ') || 'Không có'}
Size có sẵn: ${(p.variants || []).map((v) => v.size).join(', ') || 'Không có'}
Mô tả: ${p.description ? p.description.substring(0, 80) + '...' : 'Không có'}
========================`,
            )
            .join('\n');

        // 🧩 Prompt gửi cho AI
        const trainingPrompt = `
Bạn là "SneakerBot" – chatbot bán giày thân thiện, chuyên tư vấn sản phẩm.
Dưới đây là danh sách sản phẩm hiện có:

${productData}

Lịch sử trò chuyện gần đây:
${conversationText}

Người dùng vừa nói: "${question}"

Hãy:
1. Hiểu ngữ cảnh trò chuyện trước đó.
2. Gợi ý sản phẩm phù hợp theo nội dung, màu, giá, size.
3. Nếu người dùng hỏi tiếp, hãy phản hồi tự nhiên, thân thiện, không lặp lại toàn bộ thông tin.
4. KHÔNG tạo đơn hàng, chỉ tư vấn sản phẩm.
`;

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'Bạn là SneakerBot – chuyên viên tư vấn giày dép, thân thiện và hiểu biết sản phẩm.',
                },
                { role: 'user', content: trainingPrompt },
            ],
            temperature: 0.7,
            max_tokens: 800,
        });

        const answer = completion.choices[0].message.content.trim();
        return answer;
    } catch (error) {
        console.error('❌ Lỗi askShoeAssistant:', error);
        return 'Xin lỗi, có lỗi xảy ra khi tư vấn sản phẩm. Vui lòng thử lại.';
    }
}

module.exports = { askShoeAssistant };
