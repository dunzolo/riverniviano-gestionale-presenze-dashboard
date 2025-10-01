import dayjs from "dayjs";

interface ListTitleProps {
  date: string;
  title: string;
  icon: any;
}
export const TrainingListTitle = ({
  date,
  title,
  icon: Icon,
}: ListTitleProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center">
        <strong>{dayjs(date).format("D")}</strong>
        <strong>{dayjs(date).format("MMM").toUpperCase()}</strong>
      </div>
      <div className="flex flex-col">
        <span className="font-thin">{title}</span>
        <div className="flex items-center gap-2 text-gray-400">
          <Icon />
          <span className="font-light">{dayjs(date).format("dddd")}</span>
        </div>
      </div>
    </div>
  );
};
