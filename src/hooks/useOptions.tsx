import useSWR from "swr";
import { fetcher } from "./useApi";

interface Options {
  siteName?: string;
  maxFileSize?: number;
  availableExtensions?: string[];
  defaultStorage?: string;
  app_env?: string;
}

export const useOptions = () => {
  const { data, isLoading } = useSWR<{ data: Options }>(
    "/api/options",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1000 * 60 * 60 * 24, // 24 ore
    }
  );

  return {
    ...data?.data,
    isLoading,
  };
};
