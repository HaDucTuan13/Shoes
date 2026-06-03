import { request } from './request';
import { apiClient } from './axiosClient';

const apiPayment = '/api/payment';

export const requestCreatePayment = async (data) => {
    const res = await apiClient.post(`${apiPayment}/create`, data);
    return res.data;
};

export const requestGetPaymentById = async (id) => {
    const res = await apiClient.get(`${apiPayment}/detail/${id}`);
    return res.data;
};

export const requestGetAllOrder = async () => {
    const res = await apiClient.get(`${apiPayment}/all`);
    return res.data;
};

export const requestUpdateOrderStatus = async (orderId, status) => {
    const res = await apiClient.put(`${apiPayment}/update-status/${orderId}`, { status });
    return res.data;
};

export const requestGetOrderHistory = async () => {
    const res = await apiClient.get(`${apiPayment}/order-history`);
    return res.data;
};
