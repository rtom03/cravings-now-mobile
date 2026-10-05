import { Groups, BrandProducts, Product } from "@/types/brands";
import { CreateOrderPayload, CreateOrderResponse } from "@/types/order";
import * as SecureStore from "expo-secure-store";

export const BASE_URL = "http://192.168.1.179:8000/api";
// export const BASE_URL = "http://192.168.15.131:8000/api";

// export const BASE_URL = "http://172.20.10.2:8000/api";
// export const BASE_URL = "http://192.168.88.48:8000/api";

// types/type.ts (add alongside existing types)
type AddressType = "HOME" | "WORK" | "OFFICE" | "OTHER";

type CreateAddressInput = {
  name?: string;
  description?: string;
  type: AddressType;
  latitude: number;
  longitude: number;
};

type CreateAddressResponse = {
  address: {
    id: string;
    name: string | null;
    description: string | null;
    type: AddressType;
    latitude: string;
    longitude: string;
  };
};

type UpdateAddressInput = Partial<CreateAddressInput> & { id: string };

type Address = {
  id: string;
  name: string | null;
  description: string | null;
  type: AddressType;
  latitude: string;
  longitude: string;
};

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
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);
  if (response.status === 204) {
    return undefined as T;
  }

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

//customer addresses
export async function createAddress(
  input: CreateAddressInput,
): Promise<CreateAddressResponse> {
  return apiFetch<CreateAddressResponse>("/user/customer/addresses", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

async function getAddresses(): Promise<{ addresses: Address[] }> {
  return apiFetch("/customer/addresses");
}

async function updateAddress({
  id,
  ...input
}: UpdateAddressInput): Promise<{ address: Address }> {
  return apiFetch(`/user/customer/addresses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

async function deleteAddress(id: string): Promise<void> {
  return apiFetch(`/user/customer/addresses/${id}`, {
    method: "DELETE",
  });
}

//customer order
const createOrder = (
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> => {
  return apiFetch("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Idempotency-Key": payload.idempotencyKey },
  });
};

export {
  getGroups,
  getProductsByGroupName,
  getProducts,
  getAddresses,
  updateAddress,
  deleteAddress,
  createOrder,
};
