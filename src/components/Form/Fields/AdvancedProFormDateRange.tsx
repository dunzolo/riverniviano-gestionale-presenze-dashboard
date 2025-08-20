import dayjs from "@/lib/dayjs";
import {
  ProFormDateRangePicker,
  ProFormDateTimeRangePicker,
  ProFormFieldProps,
} from "@ant-design/pro-components";

interface AdvancedProFormDateRangeProps extends ProFormFieldProps {
  format?: string;
  disableBeforeNow?: boolean;
  isDateTimeRange?: boolean;
}

export const AdvancedProFormDateRange = ({
  disableBeforeNow = false,
  isDateTimeRange = false,
  fieldProps,
  ...formItemProps
}: AdvancedProFormDateRangeProps) => {
  // Prendiamo la formattazione sulla base della lingua
  // https://day.js.org/docs/en/display/format#list-of-localized-formats
  const format = isDateTimeRange
    ? dayjs.Ls["it"].formats.LLL // "YYYY-MM-DD HH:mm"
    : dayjs.Ls["it"].formats.L; // "YYYY-MM-DD"

  const disabledDate = (current?: dayjs.Dayjs) => {
    return (
      disableBeforeNow &&
      current &&
      current <= dayjs().endOf("day").subtract(1, "day")
    );
  };

  const range = (length: number) => Array.from({ length }, (v, i) => i);

  const disabledTime = (date: dayjs.Dayjs) => {
    if (date && disableBeforeNow) {
      const dateSelected = dayjs(date);
      const dateNow = dayjs();

      const isToday =
        dateSelected.format("YYYY-MM-DD") === dateNow.format("YYYY-MM-DD");

      if (isToday) {
        return {
          disabledHours: () => range(dateNow.hour()),
          disabledMinutes: () => range(dateNow.minute()),
        };
      }
    }
  };

  if (!isDateTimeRange) {
    return (
      <ProFormDateRangePicker
        format={format}
        {...formItemProps}
        fieldProps={{
          style: { width: "100%" },
          disabledTime,
          disabledDate,
          ...fieldProps,
        }}
      />
    );
  }

  return (
    <ProFormDateTimeRangePicker
      format={format}
      {...formItemProps}
      fieldProps={{
        style: { width: "100%" },
        disabledTime,
        disabledDate,
        ...fieldProps,
      }}
    />
  );
};
