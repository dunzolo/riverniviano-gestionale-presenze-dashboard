"use client";

import { Item } from "@/types";
import useSWR from "swr";
import { fetcher } from "./useApi";
import { route } from "./useAuth";

export interface User extends Item {
  // lista di funzionalità che sono abilitate per l'utente corrente
  functionalities: string[];
  // lista di permessi associati all'utente corrente
  permissions: string[];
}

export const useUser = () => {
  const { data, isLoading, mutate } = useSWR(
    "user-me",
    () => fetcher(route.userMe),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );
  return { user: data?.data, authenticated: !!data?.data, isLoading, mutate };
};
