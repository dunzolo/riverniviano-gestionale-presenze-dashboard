import { useValueEnum } from "@/hooks/useValueEnum";
import { GameCompetition } from "@/utils/enum";
import { Tag } from "antd";

export const MatchCompetitionTag = ({
  value,
  component: Component = Tag,
}: {
  value: GameCompetition;
  component?: any;
}) => {
  const { valueEnum } = useValueEnum();
  const map = {
    [GameCompetition.Friendly]: Component === Tag ? "default" : "#D9D9D9",
    [GameCompetition.League]: "purple",
    [GameCompetition.Tournament]: "blue",
  };

  return (
    <Component
      color={map[value]}
      text={valueEnum.gameCompetitions[value]}
      style={{ fontSize: 12 }}
    >
      {Component === Tag ? valueEnum.gameCompetitions[value] : null}
    </Component>
  );
};
