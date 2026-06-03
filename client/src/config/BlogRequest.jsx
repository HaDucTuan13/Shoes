import { request } from './request';
import { apiClient } from './axiosClient';

const apiBlog = '/api/blog';

export const requestUploadImage = async (data) => {
    const res = await apiClient.post(`${apiBlog}/upload-image`, data);
    return res.data;
};

export const requestCreateBlog = async (data) => {
    const res = await apiClient.post(`${apiBlog}/create`, data);
    return res.data;
};

export const requestGetAllBlog = async () => {
    const res = await request.get(`${apiBlog}/get-all`);
    return res.data;
};

export const requestDeleteBlog = async (id) => {
    const res = await apiClient.post(`${apiBlog}/delete`, { id });
    return res.data;
};

export const requestUpdateBlog = async (id, data) => {
    // Backend expects POST /update with data containing id inside body
    const res = await apiClient.post(`${apiBlog}/update`, data);
    return res.data;
};

export const requestGetBlogById = async (id) => {
    const res = await request.get(`${apiBlog}/get-by-id`, {
        params: {
            id,
        },
    });
    return res.data;
};
