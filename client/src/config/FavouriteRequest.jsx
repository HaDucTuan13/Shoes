import { request } from './request';
import { apiClient } from './axiosClient';

const apiFavourite = '/api/favourite';

export const requestCreateFavourite = async (data) => {
    const res = await apiClient.post(`${apiFavourite}/create`, data);
    return res.data;
};

export const requestGetFavouriteByUserId = async () => {
    const res = await apiClient.get(`${apiFavourite}/get-favourite-by-user-id`);
    return res.data;
};

export const requestGetAllFavourite = async () => {
    const res = await apiClient.get(`${apiFavourite}/get-all-favourite`);
    return res.data;
};
