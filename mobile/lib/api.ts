import Constants from 'expo-constants';

/** Resolve API host: same machine as Expo Metro when possible. */
function resolveApiBaseUrl() {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  if (host && host !== '127.0.0.1' && host !== 'localhost') {
    return `http://${host}:5270`;
  }
  return 'http://127.0.0.1:5270';
}

export const API_BASE_URL = resolveApiBaseUrl();

export type AuthUser = {
  token: string;
  userId: number;
  email: string;
  displayName: string;
};

type AuthApiResponse = {
  token: string;
  userId: number;
  email: string;
  displayName: string;
  message?: string;
};

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string };
    if (data?.message) return data.message;
  } catch {
    // ignore
  }
  return `Помилка сервера (${res.status})`;
}

export async function registerUser(input: {
  email: string;
  password: string;
  displayName: string;
}): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as AuthApiResponse;
  return {
    token: data.token,
    userId: data.userId,
    email: data.email,
    displayName: data.displayName,
  };
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as AuthApiResponse;
  return {
    token: data.token,
    userId: data.userId,
    email: data.email,
    displayName: data.displayName,
  };
}
