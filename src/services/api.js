export async function mockLogin({ email, password }) {
  await new Promise((resolve) => setTimeout(resolve, 1100));

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  return {
    token: 'demo-auth-token',
    user: {
      name: email.split('@')[0] || 'Traveler',
      email,
    },
  };
}

export async function mockSignup(payload) {
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (!payload.email || !payload.username || !payload.password) {
    throw new Error('Please fill all required signup fields');
  }

  return {
    id: `user-${Date.now()}`,
    ...payload,
  };
}
