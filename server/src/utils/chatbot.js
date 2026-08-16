const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const modelProduct = require('../models/product.model');
const modelMessageChatbot = require('../models/messageChatbot.model');
const modelFlashSale = require('../models/flashSale.model');
const productService = require('../services/product.service');

/**
 * AI tư vấn sản phẩm giày & hỗ trợ thống kê dữ liệu
 * @param {string} question - Câu hỏi người dùng
 * @param {string} userId - ID người dùng
 * @returns {Promise<string>} - Câu trả lời từ AI
 */
async function askShoeAssistant(question, userId) {
    try {
        // 🧠 1. Lấy lịch sử hội thoại
        let conversationText = '';
        try {
            const recentMessages = await modelMessageChatbot.find({ userId })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();
            const conversation = recentMessages.reverse();
            conversationText = conversation
                .map((msg) => `${msg.sender === 'user' ? 'Người dùng' : 'Bot'}: ${msg.content}`)
                .join('\n');
        } catch (dbErr) {
            console.warn('⚠️ Không lấy được lịch sử chat:', dbErr.message);
        }

        // 🛍️ 2. Lấy danh sách sản phẩm active
        const products = await modelProduct.find({ status: 'active' }).lean();
        let productData = 'Hiện tại shop chưa cập nhật sản phẩm.';
        
        if (products && products.length > 0) {
            const updatedProducts = await Promise.all(
                products.map(async (p) => {
                    let currentDiscount = p.discount || 0;
                    try {
                        const findFlashSale = await modelFlashSale.findOne({ productId: p._id });
                        if (findFlashSale) currentDiscount = findFlashSale.discount;
                    } catch (fsErr) {
                        console.warn('⚠️ Lỗi check FlashSale sản phẩm:', p._id);
                    }

                    const safeVariants = Array.isArray(p.variants) ? p.variants : [];
                    const stockDetails = safeVariants
                        .map((v) => {
                            const currentStock = v.quantity !== undefined ? v.quantity : (v.stock !== undefined ? v.stock : 0);
                            return `Size ${v.size} (Còn: ${currentStock} đôi)`;
                        })
                        .join(', ');

                    const finalPrice = p.price * (1 - currentDiscount / 100);

                    return `Tên: ${p.name} | Giá bán: ${finalPrice}đ | Kho: ${stockDetails || 'Hết hàng'}`;
                })
            );
            productData = updatedProducts.join('\n');
        }

        // 🧩 3. Định nghĩa cấu trúc Messages
        const messages = [
            {
                role: 'system',
                content: `Bạn là "SneakerBot" – chatbot tư vấn bán giày nhiệt tình, am hiểu kho hàng. Hôm nay là ngày 12 tháng 6 năm 2026.
                
Dưới đây là danh sách sản phẩm thực tế tại cửa hàng để bạn tư vấn:
${productData}

Lịch sử cuộc trò chuyện:
${conversationText}

QUY TẮC PHÂN LOẠI CÂU HỎI (QUAN TRỌNG NHẤT):
1. Nếu khách hỏi "Tư vấn", "Tìm giúp", "Gợi ý", "Có mẫu nào..." (Ví dụ: tư vấn cho tôi đôi giày chạy bộ giá dưới 500k): Bạn PHẢI trả lời trực tiếp dựa trên danh sách sản phẩm phía trên. Liệt kê tên giày, giá cả và tư vấn nhiệt tình. TUYỆT ĐỐI KHÔNG được gọi công cụ "countProductsByQuery".
2. Bạn chỉ được phép gọi công cụ "countProductsByQuery" KHI VÀ CHỈ KHI khách hàng hỏi đích danh từ khóa đếm hoặc thống kê tổng số lượng (Ví dụ: "thống kê cho tôi có bao nhiêu đôi...", "đếm xem shop có bao nhiêu mã giày nam dưới 500k...").`
            },
            { role: 'user', content: question }
        ];

        // 🚀 4. Gọi Groq lượt 1
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: messages,
            tools: [{
                type: "function",
                function: {
                    name: "countProductsByQuery",
                    // Viết lại mô tả cực kỳ rõ ràng để AI không nhận diện nhầm câu hỏi tư vấn thông thường
                    description: "CHỈ SỬ DỤNG khi người dùng yêu cầu THỐNG KÊ hoặc ĐẾM tổng số lượng sản phẩm (Ví dụ: 'có bao nhiêu đôi...', 'thống kê số lượng...'). KHÔNG dùng khi khách bảo tư vấn mẫu mã cụ thể.",
                    parameters: {
                        type: "object",
                        properties: {
                            priceMax: { type: "number", description: "Mức giá tối đa." },
                            gender: { type: "string", enum: ["nam", "nu"], description: "Giới tính sản phẩm." }
                        }
                    }
                }
            }],
            tool_choice: "auto",
            temperature: 0.3,
        });

        const choice = completion.choices[0];

        // 🛠️ 5. Xử lý chuẩn quy trình nếu AI cần gọi Tool đếm dữ liệu
        if (choice.message.tool_calls) {
            const toolCall = choice.message.tool_calls[0];
            
            if (toolCall.function.name === "countProductsByQuery") {
                const args = JSON.parse(toolCall.function.arguments);
                const totalCount = await productService.countProductsByQuery(args);
                
                // Đẩy lịch sử tool call đúng chuẩn kỹ thuật của Groq API
                messages.push(choice.message);
                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: "countProductsByQuery",
                    content: JSON.stringify({ totalCount: totalCount })
                });

                // Gọi lượt 2 để AI tự tổng hợp câu trả lời thống kê tự nhiên
                const finalCompletion = await groq.chat.completions.create({
                    model: 'llama-3.3-70b-versatile',
                    messages: messages,
                    temperature: 0.3
                });

                return finalCompletion.choices[0].message.content.trim();
            }
        }

        // Trả về văn bản tư vấn thông thường (Tìm giày chạy bộ dưới 500k...)
        return choice.message.content.trim();

    } catch (error) {
        console.error('❌ Lỗi chi tiết tại askShoeAssistant:', error);
        return 'Dạ hệ thống tư vấn của em đang bận một chút, anh/chị vui lòng thử lại sau giây lát nhé!';
    }
}

module.exports = { askShoeAssistant };