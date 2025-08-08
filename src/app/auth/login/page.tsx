"use client";

import { AuthForm } from "@/app/components/Form/AuthForm";
import { Section } from "@/app/components/Section";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Values } from "@/types";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { ProFormInstance, ProFormText } from "@ant-design/pro-components";
import { useParams } from "next/navigation";
import { ReactElement, RefObject, useRef } from "react";

const Page = () => {
  const { signIn, redirectToHome } = useAuth();
  const params = useParams<{ guard: string }>();
  const ref = useRef<any>(undefined) as RefObject<ProFormInstance>;

  const onSubmit = (data: Values) => {
    const { email, password } = data;
    return signIn(email, password)
      .then(() => {
        redirectToHome();
      })
      .catch((err) => {
        if (err?.response?.data?.message === "Too Many Attempts.")
          ref.current?.setFields([
            { name: "email", errors: ["Too Many Attempts."] },
          ]);
        return Promise.reject(err);
      });
  };

  return (
    <>
      <div>
        <h2 className="text-xl font-bold leading-9">Accedi</h2>
        <p className="text-xs leading-5 text-gray-500">
          Inserisci le tue credenziali per accedere al portale
        </p>
      </div>
      <AuthForm formRef={ref} onFinish={onSubmit} submitLabel="Accedi">
        <Section.Grid>
          <ProFormText
            name="email"
            placeholder={"Username"}
            fieldProps={{
              prefix: <UserOutlined className="prefixIcon" />,
            }}
          />
          <ProFormText.Password
            name="password"
            placeholder={"Password"}
            fieldProps={{
              prefix: <LockOutlined className="prefixIcon" />,
            }}
          />
        </Section.Grid>
      </AuthForm>
    </>
  );
};

Page.getLayout = (page: ReactElement) => <AuthProvider>{page}</AuthProvider>;
export default Page;
