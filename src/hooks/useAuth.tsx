"use client";

import { AxiosPromise } from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import { api } from "./useApi";
import { useUser } from "./useUser";

type SignInFunction = (email: string, password: string) => AxiosPromise;

type UpdatePasswordFunction = (
  password: string,
  password_confirmation: string
) => AxiosPromise;

export interface ContextProps {
  signIn: SignInFunction;
  signOut: () => Promise<void>;
  updatePassword: UpdatePasswordFunction;
  redirectToHome: () => void;
}

const AuthContext = React.createContext<ContextProps | undefined>(undefined);

// const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;

export const route = {
  csrfCookie: `/api/auth/csrf-cookie`,
  signIn: `/api/auth/login`,
  signOut: `/api/auth/logout`,
  updatePassword: `/api/auth/update-password`,
  userMe: `/api/auth/user`,
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const { mutate } = useUser();

  const csrf = () => api.get(route.csrfCookie);

  const signIn: SignInFunction = (email, password) => {
    return csrf().then(() =>
      api.post(route.signIn, { email, password }).then(() => {
        return mutate();
      })
    );
  };

  const signOut = () => {
    csrf().then(() =>
      api.post(route.signOut).then(() => {
        mutate();
      })
    );

    return Promise.resolve();
  };

  const redirectToHome = () => {
    return router.push("/");
  };

  const updatePassword = (password: string, password_confirmation: string) => {
    return csrf().then(() =>
      api
        .post(route.updatePassword, { password, password_confirmation })
        .then(() => {
          return mutate();
        })
    );
  };

  const context = {
    signIn,
    signOut,
    redirectToHome,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={context}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context)
    throw new Error("useAuth should only be used inside <AuthProvider />");

  return context;
};
