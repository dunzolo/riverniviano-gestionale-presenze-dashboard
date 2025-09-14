"use client";

import { PageContainer } from "@ant-design/pro-components";
import { TableTrainings } from "./table-trainings";

export default function Page() {
  return (
    <PageContainer>
      <TableTrainings />
      {/* <Section.DfSegmented
        keyName="sessions"
        defaultActiveKey="training"
        items={[
          {
            key: "training",
            label: "Allenamenti",
            children: <TableTrainings />,
          },
          { key: "matches", label: "Partite", children: <TableMatches /> },
        ]}
      /> */}
      {/* <Section.Tabs
        keyName="sessions"
        items={[
          {
            key: "trainings",
            label: "Allenamenti",
            destroyInactiveTabPane: true,
            children: <TableTrainings />,
          },
          {
            key: "matches",
            label: "Partite",
            children: <TableMatches />,
          },
        ]}
      /> */}
    </PageContainer>
  );
}
