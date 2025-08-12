"use client";

import { AuthForm } from "@/components/Form/AuthForm";
import { Section } from "@/components/Section";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { ProFormText } from "@ant-design/pro-components";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const { user, mutate } = useUser();
  const { updatePassword } = useAuth();

  const causer = user?.need_password_update as "first_login" | "expired";

  /**
   * Al primo caricamento di pagina carichiamo l'utente corrente
   */
  useEffect(() => {
    mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = ({ password, password_confirmation }: any) => {
    return updatePassword(password, password_confirmation).then(() => {
      router.push("/");
    });
  };

  const title = {
    first_login: "Cambia la tua password",
    expired: "Password scaduta!",
  };

  const description = {
    first_login:
      "Al primo accesso per ragioni di sicurezza è necessario cambiare la password.",
    expired:
      "La tua password risulta scaduta ed è necessario aggiornarla per ragioni di sicurezza.",
  };

  return (
    <>
      <div>
        <h2 className="text-xl font-bold leading-9">{title[causer]}</h2>
        <p className="text-xs leading-5 text-gray-500">{description[causer]}</p>
      </div>
      <AuthForm onFinish={onSubmit} submitLabel="Cambia password">
        <Section.Grid>
          <ProFormText.Password
            label="Nuova Password"
            placeholder="Nuova Password"
            name="password"
          />
          <ProFormText.Password
            label="Conferma Nuova Password"
            placeholder="Conferma Nuova Password"
            name="password_confirmation"
          />
        </Section.Grid>
      </AuthForm>
    </>
  );
}
