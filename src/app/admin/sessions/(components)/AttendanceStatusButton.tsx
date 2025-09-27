"use client";

import { useValueEnum } from "@/hooks/useValueEnum";
import { AttendanceStatus } from "@/utils/enum";
import {
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Button } from "antd";

export type AttendanceStatusButtonsProps = {
  value?: AttendanceStatus | null;
  onChange?: (status: AttendanceStatus) => void;
  size?: "small" | "middle" | "large";
  disabled?: boolean;
};

const STATUS_ICONS: Record<AttendanceStatus, React.ReactNode> = {
  [AttendanceStatus.Present]: <CheckOutlined />,
  [AttendanceStatus.Absent]: <CloseOutlined />,
  [AttendanceStatus.Injury]: <ExclamationCircleOutlined />,
  [AttendanceStatus.Late]: <ClockCircleOutlined />,
};

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.Present]: "#52c41a", // verde
  [AttendanceStatus.Absent]: "#ff4d4f", // rosso
  [AttendanceStatus.Injury]: "#999", // grigio
  [AttendanceStatus.Late]: "#f4de50", // arancio
};

const STATUS_COLORS_TEXT: Record<AttendanceStatus, string> = {
  [AttendanceStatus.Present]: "white",
  [AttendanceStatus.Absent]: "white",
  [AttendanceStatus.Injury]: "white",
  [AttendanceStatus.Late]: "black",
};

export function AttendanceStatusButtons({
  value,
  onChange,
  size = "small",
  disabled,
}: AttendanceStatusButtonsProps) {
  const { valueEnum } = useValueEnum();

  return (
    <div className="flex gap-2">
      {(Object.keys(valueEnum.attendanceStatus) as AttendanceStatus[]).map(
        (status) => {
          const active = value === status;
          const color = STATUS_COLORS[status];
          const style = active
            ? {
                backgroundColor: color,
                borderColor: color,
                color: STATUS_COLORS_TEXT[status],
              }
            : {
                borderColor: color,
                color: STATUS_COLORS[status],
              };

          return (
            // <Button
            //   key={status}
            //   size={size}
            //   type="default"
            //   disabled={disabled}
            //   style={style}
            //   icon={STATUS_ICONS[status]}
            //   onClick={() => onChange?.(status)}
            //   aria-pressed={active}
            // >
            //   {valueEnum.attendanceStatus[status]}
            // </Button>

            <Button
              key={status}
              size={size}
              type="default"
              disabled={disabled}
              style={style}
              icon={STATUS_ICONS[status]}
              onClick={() => onChange?.(status)}
              aria-pressed={active}
            />
          );
        }
      )}
    </div>
  );
}
