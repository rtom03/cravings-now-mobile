import { Groups, BrandProducts, Product } from "@/types/brands";
// export const BASE_URL = "http://192.168.1.179:8000/api";

export const BASE_URL = "http://172.20.10.2:8000/api";
// export const BASE_URL = "http://192.168.88.48:8000/api";

// types/type.ts (add alongside existing types)
import * as SecureStore from "expo-secure-store";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export const apiFetch = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = await SecureStore.getItemAsync("authToken");

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    await SecureStore.deleteItemAsync("authToken");
    throw new Error("AUTHENTICATION_REQUIRED");
  }

  if (response.status === 403) {
    throw new Error("FORBIDDEN");
  }

  if (!response.ok) {
    const message = data?.message ?? response.statusText;
    throw new ApiError(response.status, message);
  }

  return data.data || data;
};

// export class ApiError extends Error {
//   status: number;
//   constructor(status: number, message: string) {
//     super(message);
//     this.status = status;
//     this.name = "ApiError";
//   }
// }

// export const apiFetch = async <T>(
//   url: string,
//   options: RequestInit = {},
// ): Promise<T> => {
//   // --- "request interceptor" ---
//   // Guard before the request even goes out: if we have a user but their
//   // token has expired, clear the stale state first. credentials: "include"
//   // means the actual auth is the httpOnly cookie, so this doesn't block
//   // the request — it just keeps client-side user state honest so the UI
//   // doesn't show someone as "logged in" with a dead session.
//   // const { user, clearUser } = useUserStore.getState();
//   // if (user && !isTokenValid(user.token)) {
//   //   clearUser();
//   // }
//   const response = await fetch(`${BASE_URL}${url}`, {
//     ...options,
//     credentials: "include",
//     headers: {
//       "Content-Type": "application/json",
//       ...options.headers,
//     },
//   });

//   const data = await response.json().catch(() => null);

//   if (response.status === 401) {
//     // useUserStore.getState().clearUser();
//     throw new Error("AUTHENTICATION_REQUIRED");
//   }

//   if (response.status === 403) {
//     throw new Error("FORBIDDEN");
//   }

//   if (!response.ok) {
//     const message = await response
//       .json()
//       .then((data) => data?.message ?? response.statusText)
//       .catch(() => response.statusText);
//     throw new ApiError(response.status, message);
//   }

//   return data.data || data;
// };

///GROUPS

const getGroups = async (): Promise<Groups[]> => {
  try {
    return apiFetch("/admin/groups");
  } catch (error: any) {
    throw new Error(error?.message || "Something went wrong");
  }
};

///PRODUCTS

const getProductsByGroupName = async (id: string): Promise<BrandProducts> => {
  try {
    return await apiFetch(`/admin/groups/products/${id}`); // ← await added
  } catch (error: any) {
    throw new Error(error?.message || "Something went wrong");
  }
};

const getProducts = async (): Promise<Product> => {
  try {
    return await apiFetch("/products/");
  } catch (error: any) {
    throw new Error(error?.message || "Something went wrong");
  }
};

const createOrder = (data: any) => {};

export { getGroups, getProductsByGroupName, getProducts };
