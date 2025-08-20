"use client";

import { Section } from "@/components/Section";
import { PageContainer } from "@ant-design/pro-components";
import { TableMatches } from "./table-matches";
import { TableTrainings } from "./table-trainings";

export default function Page() {
  return (
    <PageContainer>
      <Section.DfSegmented
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
      />
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
