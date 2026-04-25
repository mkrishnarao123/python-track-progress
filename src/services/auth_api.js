import { apiClient } from "./api";



function normalizeAuthUser(data, fallbackPayload) {
  return {
    id: data?.id || data?.user?.id || `user-${Date.now()}`,
    username: data?.username || data?.user?.username || fallbackPayload?.username || '',
    name: data?.name || data?.fullName || data?.user?.name || data?.user?.fullName || fallbackPayload?.fullName || fallbackPayload?.username || '',
    mobileNumber: data?.mobileNumber || data?.user?.mobileNumber || fallbackPayload?.mobileNumber || '',
  };
}

function normalizeToken(data) {
  return data?.token || data?.accessToken || data?.access_token || data?.data?.token || '';
}

export async function mockSignup(payload) {
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

export async function mockLogin(payload) {
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
