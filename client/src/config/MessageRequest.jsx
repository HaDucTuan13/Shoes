import { request } from './request';
import { apiClient } from './axiosClient';

const apiMessage = '/api/message';
const apiConversation = '/api/conversation';

export const requestGetConversationByUserId = async (data) => {
    const res = await apiClient.get(`${apiConversation}/get-conversation-by-user-id`, data);
    return res.data;
};

export const requestGetAllConversation = async (data) => {
    const res = await apiClient.get(`${apiConversation}/get-all-conversation`, data);
    return res.data;
};

export const requestGetMessageByConversationIdAdmin = async (conversationId) => {
    const res = await apiClient.get(`${apiConversation}/get-message-by-conversation-id/${conversationId}`);
    return res.data;
};

export const requestCreateMessage = async (data) => {
    const res = await apiClient.post(`${apiMessage}/create`, data);
    return res.data;
};

export const requestGetMessageByConversationId = async (conversationId) => {
    const res = await apiClient.get(`${apiMessage}/get-message-by-conversation-id/${conversationId}`);
    return res.data;
};

export const requestUpdateMessageIsRead = async (data) => {
    const res = await apiClient.post(`${apiMessage}/update-message-is-read`, data);
    return res.data;
};
