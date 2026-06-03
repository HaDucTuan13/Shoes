import { request } from './request';
import { apiClient } from './axiosClient';

const apiCart = '/api/cart';

export const requestAddToCart = async (data) => {
    const res = await apiClient.post(`${apiCart}/add-to-cart`, data);
    return res.data;
};

export const requestGetCart = async () => {
    const res = await apiClient.get(`${apiCart}/get-cart`);
    return res.data;
};

export const requestUpdateCartQuantity = async (data) => {
    const res = await apiClient.put(`${apiCart}/update-quantity`, data);
    return res.data;
};

export const requestRemoveItemFromCart = async (data) => {
    const res = await apiClient.delete(`${apiCart}/remove-item`, { data });
    return res.data;
};

export const requestApplyCoupon = async (data) => {
    const res = await apiClient.post(`${apiCart}/apply-coupon`, data);
    return res.data;
};

export const requestUpdateInfoCart = async (data) => {
    const res = await apiClient.put(`${apiCart}/update-info-cart`, data);
    return res.data;
};
