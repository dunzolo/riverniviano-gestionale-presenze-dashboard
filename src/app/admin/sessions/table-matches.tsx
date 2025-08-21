import { CrudDataTable } from "@/components/CrudDataTable";
import { MatchCompetitionTag } from "@/containers/matches/MatchCompetitionTag";
import { useValueEnum } from "@/hooks/useValueEnum";
import { GameCompetition, SessionType } from "@/utils/enum";
import { Badge } from "antd";
import { SessionForm } from "./form";

export const TableMatches = () => {
  const { valueEnum } = useValueEnum();

  return (
    <CrudDataTable
      paged={false}
      form={(props) => (
        <SessionForm sessionType={SessionType.Match} {...props} />
      )}
      url="/api/sessions"
      params={{ type: SessionType.Match }}
      actionOnSave="list"
      columns={[
        {
          width: 100,
          title: "Data",
          dataIndex: "date",
          valueType: "proDate",
          search: true,
          sorter: true,
        },
        {
          width: 100,
          title: "Stagione",
          dataIndex: ["season_team", "season", "name"],
          valueType: "apiSelect",
          fieldProps: {
            url: "/api/seasons/all",
            name: "season_id",
            mode: "multiple",
          },
          search: true,
        },
        {
          width: 100,
          title: "Categoria",
          dataIndex: ["season_team", "team", "name"],
          valueType: "apiSelect",
          fieldProps: {
            url: "/api/teams/all",
            name: "team_id",
            mode: "multiple",
          },
          search: true,
        },
        {
          title: "Etichetta",
          dataIndex: ["season_team", "label"],
          search: true,
        },
        {
          title: "Allenatore",
          dataIndex: ["user", "full_name"],
          valueType: "apiSelect",
          fieldProps: {
            url: "/api/users/all",
            name: "user_id",
            mode: "multiple",
          },
          search: true,
        },
        {
          title: "Avversario",
          dataIndex: ["game", "opponent"],
          search: true,
        },
        {
          title: "Gruppo",
          dataIndex: ["game", "category"],
          valueEnum: valueEnum.gameCategories,
          fieldProps: {
            mode: "multiple",
          },
          search: true,
        },
        {
          title: "Competizione",
          dataIndex: ["game", "competition"],
          valueEnum: valueEnum.gameCompetitions,
          search: true,
          fieldProps: {
            mode: "multiple",
            optionItemRender: (item: Record<string, any>) => {
              return (
                <MatchCompetitionTag component={Badge} value={item.value} />
              );
            },
          },
          render: (dom, item) => {
            const competition = item.game.competition;
            const tournamentName = item.game.tournament_name;

            if (competition === GameCompetition.Tournament) {
              return (
                <div>
                  <MatchCompetitionTag value={competition} />
                  {tournamentName && <span>{tournamentName}</span>}
                </div>
              );
            }

            if (competition === GameCompetition.League) {
              return (
                <div>
                  <MatchCompetitionTag value={competition} />
                  {item.game.league_round && (
                    <span>{`- ${item.game.league_round}a giornata`}</span>
                  )}
                </div>
              );
            }

            if (competition === GameCompetition.Friendly) {
              return <MatchCompetitionTag value={competition} />;
            }

            return dom;
          },
        },
      ]}
    />
  );
};
