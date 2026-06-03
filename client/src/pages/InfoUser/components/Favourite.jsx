import { useEffect, useState } from 'react';
import { requestGetFavouriteByUserId } from '../../../config/FavouriteRequest';
import CardBody from '../../../components/CardBody';

function Favourite() {
    const [favourite, setFavourite] = useState([]);

    useEffect(() => {
        const fetchFavourite = async () => {
            const res = await requestGetFavouriteByUserId();
            setFavourite(res.metadata);
        };
        fetchFavourite();
    }, []);

    return (
        <div>
            <h4 className="text-2xl font-bold text-gray-800 mb-6">Sản phẩm yêu thích</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
                {favourite.map((item) => (
                    <CardBody product={item.productId} key={item._id} />
                ))}
            </div>
        </div>
    );
}

export default Favourite;
