import { request } from './request';
import { apiClient } from './axiosClient';

const apiUser = '/api/users';

export const requestLogin = async (data) => {
    const res = await request.post(`${apiUser}/login`, data);
    return res.data;
};

export const requestRegister = async (data) => {
    const res = await request.post(`${apiUser}/register`, data);
    return res.data;
};

export const requestAuth = async () => {
    const res = await apiClient.get(`${apiUser}/auth`);
    return res.data;
};

export const requestRefreshToken = async () => {
    const res = await request.get(`${apiUser}/refresh-token`);
    return res.data;
};

export const requestLogout = async () => {
    const res = await apiClient.post(`${apiUser}/logout`);
    return res.data;
};

export const requestLoginGoogle = async (data) => {
    const res = await apiClient.post(`${apiUser}/login-google`, data);
    return res.data;
};

export const requestGetAllUser = async () => {
    const res = await apiClient.get(`${apiUser}/admin/users`);
    return res.data;
};

export const requestUpdateUserAdmin = async (id, data) => {
    const res = await apiClient.put(`${apiUser}/admin/users/${id}`, data);
    return res.data;
};

export const requestDeleteUserAdmin = async (id) => {
    const res = await apiClient.delete(`${apiUser}/admin/users/${id}`);
    return res.data;
};

export const requestUpdateUser = async (data) => {
    const res = await apiClient.put(`${apiUser}/update`, data);
    return res.data;
};

export const requestUploadAvatar = async (data) => {
    const res = await apiClient.post(`${apiUser}/upload-avatar`, data);
    return res.data;
};

export const requestChatbot = async (data) => {
    const res = await apiClient.post(`${apiUser}/chatbot`, data);
    return res.data;
};

export const requestGetMessageChatbot = async () => {
    const res = await apiClient.get(`${apiUser}/message-chatbot`);
    return res.data;
};

export const requestForgotPassword = async (data) => {
    const res = await apiClient.post(`${apiUser}/forgot-password`, data);
    return res.data;
};

export const requestResetPassword = async (data) => {
    const res = await apiClient.post(`${apiUser}/reset-password`, data);
    return res.data;
};

export const requestGetDashboard = async () => {
    const res = await apiClient.get(`${apiUser}/admin/dashboard`);
    return res.data;
};

export const requestGetDashboardAdmin = async () => {
    const res = await apiClient.get(`${apiUser}/admin`);
    return res.data;
};
