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
  const token = sessionStorage.getItem('authToken');
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
  const token = sessionStorage.getItem('authToken');
  // PUT to /pythonlearn/restart with user id in the body
  const payload = { id: userId };

  const response = await apiClient.put('/pythonlearn/restart', payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return response;
}


