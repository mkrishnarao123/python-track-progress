import { apiClient } from "./api";
import { getAuthToken } from "../utils/authUtils";

function normalizeAuthUser(data) {
  return {
    id: data.user_details.id,
    username: data.user_details.username,
    name: data.user_details.fullName,
    mobileNumber: data.user_details.mobileNumber,
  };
}

function normalizeToken(data) {
  return data?.token || data?.accessToken || data?.access_token || data?.data?.token || '';
}

export async function signup(payload) {
  const response = await apiClient.post('/auth/user', payload);
  const responseData = response?.data || {};

  return {
    ...response,
    data: {
      id: responseData.id || responseData.user?.id || `user-${Date.now()}`,
      username: responseData.username || payload.username,
      fullName: responseData.fullName || responseData.name || payload.fullName,
      mobileNumber: responseData.mobileNumber || payload.mobileNumber,
    },
  };
}

export async function login(payload) {
  const response = await apiClient.post('/auth/login', payload);
  const responseData = response?.data || {};
  const token = normalizeToken(responseData);

  if (!token) {
    throw new Error('Login API did not return a token');
  }

  return {
    ...response,
    data: {
      token,
      user: normalizeAuthUser(responseData, payload),
    },
  };
}

function normalizeAllUsers(data) {
  const list = Array.isArray(data) ? data : data?.users || data?.data || [];

  return list.map((item, index) => ({
    id: item?.id || item?._id || `user-${index}`,
    fullName: item?.fullName || item?.fullname || item?.name || '',
    username: item?.username || item?.userName || '',
    restart: Boolean(item?.restart),
  }));
}

export async function fetchAllUsers() {
  const token = getAuthToken();
  const response = await apiClient.get('/auth/all-users', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const responseData = response?.data || {};

  return {
    ...response,
    data: normalizeAllUsers(responseData),
  };
}

export async function restartUser(userId) {
  const token = getAuthToken();
  const payload = { id: userId };

  const response = await apiClient.put(`/pythonlearn/restart/${userId}`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return response;
}


