import { request } from './request';
import { apiClient } from './axiosClient';

const apiFlashSale = '/api/flashSale';

export const requestCreateFlashSale = async (data) => {
    const res = await apiClient.post(`${apiFlashSale}/create`, data);
    return res.data;
};

export const requestGetAllFlashSale = async () => {
    const res = await apiClient.get(`${apiFlashSale}/all`);
    return res.data;
};

export const requestGetFlashSaleByDate = async () => {
    const res = await request.get(`${apiFlashSale}/date`);
    return res.data;
};

export const requestUpdateFlashSale = async (id, data) => {
    const res = await apiClient.put(`${apiFlashSale}/update/${id}`, data);
    return res.data;
};

export const requestDeleteFlashSale = async (id) => {
    const res = await apiClient.delete(`${apiFlashSale}/delete/${id}`);
    return res.data;
};
