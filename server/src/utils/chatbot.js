const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const modelProduct = require('../models/product.model');
const modelMessageChatbot = require('../models/messageChatbot.model');
const modelFlashSale = require('../models/flashSale.model');
const productService = require('../services/product.service');

/**
 * AI tư vấn sản phẩm giày & hỗ trợ tìm kiếm, gợi ý theo nhu cầu khách hàng
 * @param {string} question - Câu hỏi người dùng
 * @param {string} userId - ID người dùng
 * @returns {Promise<string>} - Câu trả lời từ AI
 */
async function askShoeAssistant(question, userId) {
    try {
        // 🧠 1. Lấy lịch sử hội thoại gần nhất của user
        let conversationText = '';
        if (userId) {
            try {
                const recentMessages = await modelMessageChatbot.find({ userId })
                    .sort({ createdAt: -1 })
                    .limit(6)
                    .lean();
                const conversation = recentMessages.reverse();
                conversationText = conversation
                    .map((msg) => `${msg.sender === 'user' ? 'Khách hàng' : 'SneakerBot'}: ${msg.content}`)
                    .join('\n');
            } catch (dbErr) {
                console.warn('⚠️ Không lấy được lịch sử chat:', dbErr.message);
            }
        }

        // 🛍️ 2. Lấy danh sách sản phẩm active kèm phân loại danh mục chi tiết
        const now = new Date();
        const products = await modelProduct.find({ status: 'active' })
            .populate({
                path: 'category',
                populate: { path: 'parent', select: 'categoryName' },
            })
            .lean();

        let productData = 'Hiện tại cửa hàng đang cập nhật thêm sản phẩm mới.';

        if (products && products.length > 0) {
            const updatedProducts = await Promise.all(
                products.map(async (p) => {
                    let currentDiscount = p.discount || 0;
                    try {
                        const findFlashSale = await modelFlashSale.findOne({
                            productId: p._id,
                            startDate: { $lte: now },
                            endDate: { $gte: now },
                        });
                        if (findFlashSale) currentDiscount = findFlashSale.discount;
                    } catch (fsErr) {
                        console.warn('⚠️ Lỗi check FlashSale sản phẩm:', p._id);
                    }

                    // Danh mục phân cấp
                    let categoryNames = 'Khác';
                    if (Array.isArray(p.category) && p.category.length > 0) {
                        categoryNames = p.category
                            .map((c) => (c.parent ? `${c.parent.categoryName} > ${c.categoryName}` : c.categoryName))
                            .join(', ');
                    } else if (p.category && p.category.categoryName) {
                        categoryNames = p.category.parent
                            ? `${p.category.parent.categoryName} > ${p.category.categoryName}`
                            : p.category.categoryName;
                    }

                    // Màu sắc
                    const colorNames = Array.isArray(p.colors) && p.colors.length > 0
                        ? p.colors.map((c) => c.name).join(', ')
                        : 'Tiêu chuẩn';

                    // Kích cỡ & Tồn kho
                    const safeVariants = Array.isArray(p.variants) ? p.variants : [];
                    const stockDetails = safeVariants
                        .filter((v) => (v.stock || v.quantity || 0) > 0)
                        .map((v) => `Size ${v.size} (${v.stock || v.quantity} đôi)`)
                        .join(', ');

                    const finalPrice = Math.round(p.price * (1 - currentDiscount / 100));

                    return `- [ID: ${p._id}] Tên: "${p.name}" | Danh mục: [${categoryNames}] | Màu: [${colorNames}] | Giá bán: ${finalPrice.toLocaleString('vi-VN')} VNĐ ${currentDiscount > 0 ? `(Gốc: ${p.price.toLocaleString('vi-VN')} VNĐ - Giảm ${currentDiscount}%)` : ''} | Tình trạng: ${stockDetails ? `Còn hàng (${stockDetails})` : 'Tạm hết hàng'} | Đường dẫn: /product/${p._id}`;
                })
            );
            productData = updatedProducts.join('\n');
        }

        // 🧩 3. Định nghĩa cấu trúc Messages cho AI
        const messages = [
            {
                role: 'system',
                content: `Bạn là "SneakerBot" – Trợ lý AI tư vấn bán giày chuyên nghiệp, am hiểu sản phẩm và cực kỳ nhiệt tình của cửa hàng giày.

🎯 NHIỆM VỤ CỦA BẠN:
1. Tư vấn, tìm kiếm và gợi ý các mẫu giày chính xác dựa trên nhu cầu của khách hàng (theo giới tính Nam/Nữ/Trẻ em, theo môn thể thao: Bóng rổ, Chạy bộ, Pickleball, Tennis, Đi chơi/Sneaker, hoặc theo khoảng giá/ngân sách).
2. Khi khách hỏi tìm giày, hãy chọn ra 2-4 mẫu giày phù hợp nhất trong danh sách sản phẩm bên dưới.
3. VỚI MỖI MẪU GIÀY ĐƯỢC GỢI Ý, BẠN BẮT BUỘC PHẢI CHÈN LINK MARKDOWN XEM CHI TIẾT THEO CÚ PHÁP:
   👉 [Xem chi tiết Tên Giày](/product/ID_CUA_GIAY) (Ví dụ: [Xem chi tiết Giày Pickleball Peak](/product/6655a1b2c3d4e5f6))
4. Báo giá rõ ràng (kèm giá khuyến mãi nếu có), các màu sắc và size còn hàng.
5. Hỗ trợ tư vấn cách chọn size giày (ví dụ: form giày thể thao ôm chân, chân bè nên tăng 0.5 - 1 size...).
6. Giữ thái độ thân thiện, lịch sự, sử dụng emoji sống động (👟, 🔥, 🏀, ⚡, ✨).

📦 DANH SÁCH SẢN PHẨM THỰC TẾ TRONG KHO HÀNG:
${productData}

💬 LỊCH SỬ HỘI THOẠI TRƯỚC ĐÓ VỚI KHÁCH HÀNG:
${conversationText || 'Chưa có lịch sử trò chuyện.'}

⚠️ QUY TẮC PHÂN LOẠI CÔNG CỤ (Tool Call):
- Nếu khách yêu cầu tư vấn, tìm kiếm, gợi ý sản phẩm $\rightarrow$ Trả lời trực tiếp bằng văn bản theo danh sách sản phẩm trên, TUYỆT ĐỐI KHÔNG gọi tool.
- CHỈ gọi tool "countProductsByQuery" KHI VÀ CHỈ KHI khách hàng hỏi từ khóa thống kê số lượng (Ví dụ: "Shop có tất cả bao nhiêu đôi giày nam dưới 1 triệu?").`
            },
            { role: 'user', content: question }
        ];

        // 🚀 4. Gọi Groq lượt 1
        const completion = await groq.chat.completions.create({
            model: 'openai/gpt-oss-120b',
            messages: messages,
            tools: [{
                type: "function",
                function: {
                    name: "countProductsByQuery",
                    description: "CHỈ SỬ DỤNG khi người dùng yêu cầu THỐNG KÊ hoặc ĐẾM tổng số lượng sản phẩm (Ví dụ: 'có bao nhiêu đôi...', 'thống kê số lượng...'). KHÔNG dùng khi khách bảo tư vấn mẫu mã cụ thể.",
                    parameters: {
                        type: "object",
                        properties: {
                            priceMax: { type: "number", description: "Mức giá tối đa." },
                            gender: { type: "string", enum: ["nam", "nu", "treem"], description: "Giới tính sản phẩm." }
                        }
                    }
                }
            }],
            tool_choice: "auto",
            temperature: 0.4,
        });

        const choice = completion.choices[0];

        // 🛠️ 5. Xử lý nếu AI cần gọi Tool đếm dữ liệu
        if (choice.message.tool_calls) {
            const toolCall = choice.message.tool_calls[0];
            
            if (toolCall.function.name === "countProductsByQuery") {
                const args = JSON.parse(toolCall.function.arguments);
                const totalCount = await productService.countProductsByQuery(args);
                
                messages.push(choice.message);
                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: "countProductsByQuery",
                    content: JSON.stringify({ totalCount: totalCount })
                });

                const finalCompletion = await groq.chat.completions.create({
                    model: 'openai/gpt-oss-120b',
                    messages: messages,
                    temperature: 0.3
                });

                return finalCompletion.choices[0].message.content.trim();
            }
        }

        return choice.message.content.trim();

    } catch (error) {
        console.error('❌ Lỗi chi tiết tại askShoeAssistant:', error);
        return 'Dạ hệ thống tư vấn của SneakerBot đang bận một chút, bạn vui lòng thử lại sau giây lát nhé! 😊';
    }
}

module.exports = { askShoeAssistant };