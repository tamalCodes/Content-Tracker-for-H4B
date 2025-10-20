import { apiConnector } from "./apiConnector";
import {
  AUTH_EMAIL_STATUS_API,
  AUTH_ENTRY_API,
  AUTH_LOGIN_API,
} from "./apiList";

const isSuccessStatus = (status) => status >= 200 && status < 300;

export const checkEmailStatus = async (email) => {
  const response = await apiConnector("POST", AUTH_EMAIL_STATUS_API, {
    email,
  });

  if (!isSuccessStatus(response.status)) {
    throw new Error(response.data?.message || "Failed to verify email");
  }

  return response.data;
};

export const loginWithPassword = async ({ email, password }) => {
  const response = await apiConnector("POST", AUTH_LOGIN_API, {
    email,
    password,
  });

  if (!isSuccessStatus(response.status)) {
    throw new Error(response.data?.message || "Failed to sign in");
  }

  return response.data;
};

export const createEntryAccount = async (payload) => {
  const response = await apiConnector("POST", AUTH_ENTRY_API, payload);

  if (!isSuccessStatus(response.status)) {
    throw new Error(response.data?.message || "Failed to create account");
  }

  return response.data;
};
