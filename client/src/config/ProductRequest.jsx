import { request } from './request';
import { apiClient } from './axiosClient';

const apiProduct = '/api/product';

export const requestUploadImage = async (data) => {
    const res = await apiClient.post(`${apiProduct}/upload-image`, data);
    return res.data;
};

export const requestCreateProduct = async (data) => {
    const res = await apiClient.post(`${apiProduct}/create`, data);
    return res.data;
};

export const requestGetAllProduct = async () => {
    const res = await request.get(`${apiProduct}/all`);
    return res.data;
};

export const requestUpdateProduct = async (id, data) => {
    const res = await apiClient.put(`${apiProduct}/update/${id}`, data);
    return res.data;
};

export const requestDeleteProduct = async (id) => {
    const res = await apiClient.delete(`${apiProduct}/delete/${id}`);
    return res.data;
};

export const requestGetProductByCategory = async (category) => {
    const res = await request.get(`${apiProduct}/category/${category}`);
    return res.data;
};

export const requestGetProductById = async (id) => {
    const res = await request.get(`${apiProduct}/product/${id}`);
    return res.data;
};

export const requestSearchProduct = async (query) => {
    const res = await request.get(`${apiProduct}/search/${query}`);
    return res.data;
};

export const requestFilterProduct = async (filters) => {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    if (filters.category && filters.category !== 'all') {
        queryParams.append('category', filters.category);
    }
    if (filters.priceMin) {
        queryParams.append('priceMin', filters.priceMin);
    }
    if (filters.priceMax) {
        queryParams.append('priceMax', filters.priceMax);
    }
    if (filters.size && filters.size !== 'all') {
        queryParams.append('size', filters.size);
    }
    if (filters.color && filters.color !== 'all') {
        queryParams.append('color', filters.color);
    }
    if (filters.sortBy) {
        queryParams.append('sortBy', filters.sortBy);
    }
    if (filters.sortOrder) {
        queryParams.append('sortOrder', filters.sortOrder);
    }
    if (filters.page) {
        queryParams.append('page', filters.page);
    }
    if (filters.limit) {
        queryParams.append('limit', filters.limit);
    }

    const res = await request.get(`${apiProduct}/filter?${queryParams.toString()}`);
    return res.data;
};
