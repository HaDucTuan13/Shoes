import { request } from './request';
import { apiClient } from './axiosClient';

const apiWarranty = '/api/warranty';

export const requestGetWarrantyByUserId = async () => {
    const res = await apiClient.get(`${apiWarranty}/history`);
    return res.data;
};

export const requestSubmitReturn = async (data) => {
    const res = await apiClient.post(`${apiWarranty}/request`, data);
    return res.data;
};

export const requestGetWarrantyByAdmin = async () => {
    const res = await apiClient.get(`${apiWarranty}/admin`);
    return res.data;
};

export const requestUpdateWarrantyStatus = async (warrantyId, status) => {
    const res = await apiClient.put(`${apiWarranty}/admin/${warrantyId}`, { status });
    return res.data;
};
