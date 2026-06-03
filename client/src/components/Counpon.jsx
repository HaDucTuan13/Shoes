import { useEffect, useState } from 'react';
import { requestGetAllCoupon } from '../config/CounponRequest';

import dayjs from 'dayjs';
import { toast } from 'react-toastify';

function Counpon() {
    const [coupons, setCoupons] = useState([]);

    useEffect(() => {
        const fetchCoupons = async () => {
            const res = await requestGetAllCoupon();
            setCoupons(res.metadata);
        };
        fetchCoupons();
    }, []);

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('Đã sao chép mã');
    };

    const CouponCard = ({ coupons }) => (
        <div className="w-full bg-gray-100 p-4 rounded-lg">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden flex">
                {/* Red Left Border with Discount */}
                <div className="bg-red-600 flex items-center justify-center px-4 py-6 relative min-w-[80px]">
                    <div className="text-white text-center">
                        <div className="text-2xl font-bold leading-tight">{coupons.discount} %</div>
                    </div>
                    {/* Red border accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-700"></div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4">
                    <div className="space-y-2">
                        {/* Description */}
                        <h4 className="font-semibold text-gray-900 text-base leading-tight">{coupons.nameCoupon}</h4>

                        {/* Condition */}
                        <p className="text-sm text-gray-600">Tối thiểu {coupons.minPrice}đ</p>

                        {/* Code and Expiry in same line */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>
                                Mã: <span className="font-medium text-gray-700">{coupons.nameCoupon}</span>
                            </span>
                            <span>HSD: {dayjs(coupons.endDate).format('DD/MM/YYYY')}</span>
                        </div>
                    </div>

                    {/* Copy Button - positioned at bottom right */}
                    <div className="flex justify-end mt-3">
                        <button
                            onClick={() => handleCopyCode(coupons.nameCoupon)}
                            className="bg-gray-900 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors duration-200"
                        >
                            Sao chép mã
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className=" w-[90%] mx-auto p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Mã Giảm Giá</h2>

            {/* Grid layout for multiple coupons */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {coupons.map((coupon) => (
                    <CouponCard key={coupon._id} coupons={coupon} />
                ))}
            </div>
        </div>
    );
}

export default Counpon;
