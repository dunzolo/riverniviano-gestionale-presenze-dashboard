import { Item, Values } from "@/types";
import { TablePaginationConfig } from "antd";
import { FilterValue } from "antd/es/table/interface";
import axios, { CreateAxiosDefaults } from "axios";
import { useState } from "react";

export interface TableParams {
  pagination?: TablePaginationConfig;
  sort?: string;
  filters?: Record<string, FilterValue>;
}

// const baseURL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;
const axiosConfig: CreateAxiosDefaults = {
  // baseURL,
  timeout: 60 * 1000 * 5, // 5 minute
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
};

export const api = axios.create(axiosConfig);
export const fetcher = (url: string, params?: Values) =>
  api.get(url, { params }).then((res) => res.data);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error?.response?.status === 401 &&
      window.location.pathname !== "/auth/login"
    ) {
      window.location.pathname = `/auth/login`;
    }
    return Promise.reject(error);
  }
);

export const useApi = (defaultIsLoading = true) => {
  const [isLoading, setIsLoading] = useState(defaultIsLoading);
  const [data, setData] = useState<Item | undefined>(undefined);
  const [error, setError] = useState(null);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const makeRequest = (
    url: string,
    method: any = "get",
    params: any = null
  ) => {
    setIsLoading(true);
    setError(null);

    const data = method === "get" ? { params: params } : { data: params };

    // Serve per mantenere anche i campi vuoti
    // Axios di default rimuove i campi undefined
    const dataFormatted = JSON.parse(
      JSON.stringify(data, function (_, value) {
        return value === undefined ? null : value;
      })
    );

    return api
      .request({ method, url, ...dataFormatted })
      .then(({ data }) => {
        setData(data);

        return Promise.resolve(data);
      })
      .catch((error) => {
        setError(error);
        setData(undefined);
        return Promise.reject(error.response.data.errors);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const resetData = () => {
    setData(undefined);
  };

  return {
    makeRequest,
    tableParams,
    setTableParams,
    isLoading,
    setIsLoading,
    resetData,
    data,
    error,
  };
};
