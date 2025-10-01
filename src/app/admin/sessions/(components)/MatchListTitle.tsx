import { useValueEnum } from "@/hooks/useValueEnum";
import { GameCompetition } from "@/utils/enum";
import { TrophyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface ListTitleProps {
  data: any;
}
export const MatchListTitle = ({ data }: ListTitleProps) => {
  const { valueEnum } = useValueEnum();
  const { date, hour } = data;

  const Title = () => {
    const { opponent, competition, tournament_name, league_round } = data.game;

    if (competition == GameCompetition.League) {
      return (
        <div className="font-thin">
          {`${league_round}a `}
          {valueEnum.gameCompetitions[GameCompetition.League]} - Partita vs{" "}
          {opponent}
        </div>
      );
    }

    if (competition == GameCompetition.Tournament) {
      return (
        <div className="font-thin">
          {valueEnum.gameCompetitions[GameCompetition.Tournament]} "
          {tournament_name}" - Partita vs {opponent}
        </div>
      );
    }
    return <span className="font-thin">Partita vs {opponent}</span>;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center">
        <strong>{dayjs(date).format("D")}</strong>
        <strong>{dayjs(date).format("MMM").toUpperCase()}</strong>
      </div>
      <div className="flex flex-col">
        <Title />
        <div className="flex items-center gap-2 text-gray-400">
          <TrophyOutlined />
          <span className="font-light">
            {dayjs(date).format("dddd")},{" "}
            {dayjs(hour, "HH:mm:ss").format("HH:mm")}
          </span>
        </div>
      </div>
    </div>
  );
};
