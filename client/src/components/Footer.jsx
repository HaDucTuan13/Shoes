import { Twitter, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#111827] text-gray-300 py-12">
            <div className="w-[80%] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Cột 1 */}
                <div>
                    <h3 className="text-white font-semibold mb-4 text-lg">Giới thiệu</h3>
                    <p className="text-sm mb-6">
                        UrbanShoes là cửa hàng trực tuyến chuyên cung cấp giày chất lượng, phong cách hiện đại và giá cả hợp lý.
                    </p>
                    <div className="flex space-x-3">
                        <a href="#" className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700">
                            <Twitter size={18} />
                        </a>
                        <a href="#" className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700">
                            <Facebook size={18} />
                        </a>
                        <a href="#" className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700">
                            <Instagram size={18} />
                        </a>
                    </div>
                </div>

                {/* Cột 2 */}
                <div>
                    <h3 className="text-white font-semibold mb-4 text-lg">Thông tin liên hệ</h3>
                    <ul className="space-y-3 text-sm">
                        <li>📍 123 Nam Từ Liêm, Hà Nội, Việt Nam</li>
                        <li>📞 +84 123 456 789</li>
                        <li>✉️ support@urbanshoes.com</li>
                        <li>🕒 Làm việc: 08:00 - 22:00 (T2 - CN)</li>
                        <li>Chúng tôi luôn sẵn sàng hỗ trợ bạn.</li>
                    </ul>
                </div>

                {/* Cột 3 */}
                <div>
                    <h3 className="text-white font-semibold mb-4 text-lg">Hỗ trợ khách hàng</h3>
                    <p className="text-sm mb-6">
                        Liên hệ với chúng tôi để được tư vấn về size, đổi trả sản phẩm, hoặc giải đáp thắc mắc nhanh chóng.
                    </p>
                </div>

                {/* Cột 4 */}
                <div>
                    <h3 className="text-white font-semibold mb-4 text-lg">Theo dõi chúng tôi</h3>
                    <p className="text-sm mb-4">
                        Kết nối với UrbanShoes trên Facebook, Instagram và Twitter để cập nhật xu hướng giày mới nhất.
                    </p>
                </div>
            </div>
        </footer>
    );
}
