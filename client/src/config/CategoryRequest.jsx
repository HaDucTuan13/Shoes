import { request } from './request';
import { apiClient } from './axiosClient';

const apiCategory = '/api/category';

export const requestCreateCategory = async (data) => {
    const res = await apiClient.post(`${apiCategory}/create`, data);
    return res.data;
};

export const requestGetAllCategory = async () => {
    const res = await request.get(`${apiCategory}/all`);
    return res.data;
};

export const requestUpdateCategory = async (data) => {
    const res = await apiClient.post(`${apiCategory}/update`, data);
    return res.data;
};

export const requestDeleteCategory = async (id) => {
    const res = await apiClient.delete(`${apiCategory}/delete/${id}`);
    return res.data;
};
