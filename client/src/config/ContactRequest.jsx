import { request } from './request';
import { apiClient } from './axiosClient';

const apiContact = '/api/contact';

export const requestCreateContact = async (data) => {
    const res = await apiClient.post(`${apiContact}/create`, data);
    return res.data;
};

export const requestGetContacts = async () => {
    const res = await apiClient.get(`${apiContact}/all`);
    return res.data;
};

export const requestUpdateContact = async (id, data) => {
    const res = await apiClient.put(`${apiContact}/update/${id}`, data);
    return res.data;
};
