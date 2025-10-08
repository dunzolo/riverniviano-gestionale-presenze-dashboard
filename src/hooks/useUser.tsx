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
  // lista dei ruoli associati all'utente
  role_names: string[];
}

export const useUser = () => {
  const { data, isLoading, mutate } = useSWR(route.userMe, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  return { user: data?.data, authenticated: !!data?.data, isLoading, mutate };
};
