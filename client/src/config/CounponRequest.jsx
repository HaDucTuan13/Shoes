import { request } from './request';
import { apiClient } from './axiosClient';

const apiCoupon = '/api/coupon';

export const requestCreateCoupon = async (data) => {
    const res = await apiClient.post(apiCoupon + '/create', data);
    return res.data;
};

export const requestGetAllCoupon = async () => {
    const res = await request.get(apiCoupon + '/all');
    return res.data;
};

export const requestUpdateCoupon = async (data) => {
    const res = await apiClient.put(apiCoupon + '/update', data);
    return res.data;
};

export const requestDeleteCoupon = async (id) => {
    const res = await apiClient.delete(apiCoupon + '/delete', {
        data: {
            id,
        },
    });
    return res.data;
};

export const requestFindByIdCoupon = async (id) => {
    const res = await apiClient.post(apiCoupon + '/findById', {
        id,
    });
    return res.data;
};
