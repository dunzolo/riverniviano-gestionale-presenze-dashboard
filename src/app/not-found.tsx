"use client";

import { Result } from "antd";

const Page = () => {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Spiacenti, la pagina che hai visitato non esiste."
    />
  );
};

export default Page;
