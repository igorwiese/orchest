import { FetchError } from "@/types";

export const fetcher = async <T>(url: RequestInfo, params?: RequestInit) => {
  const response = await window.fetch(url, params);

  if (!response.ok) {
    const responseBody = await response.json();

    throw {
      code: response.status,
      message: response.statusText,
      body: responseBody,
    } as FetchError;
  }
  return response.json() as Promise<T>;
};
