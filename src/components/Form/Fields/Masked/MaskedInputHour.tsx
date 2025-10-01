import {
  ProForm,
  ProFormItem,
  ProFormItemProps,
} from "@ant-design/pro-components";
import { MaskedInput } from "antd-mask-input";
import { MaskType } from "antd-mask-input/build/main/lib/MaskedInput";
import IMask from "imask";
import { useContext, useMemo } from "react";

interface MaskedInputHourProps extends ProFormItemProps {
  maxHour?: number;
}

export const MaskedInputHour = ({
  maxHour = 24,
  ...props
}: MaskedInputHourProps) => {
  const modeContext = useContext(ProForm.EditOrReadOnlyContext);
  const form = ProForm.useFormInstance();

  const mask = useMemo<MaskType>(() => {
    return [
      {
        mask: "HOURS:MINUTES",
        blocks: {
          HOURS: {
            mask: IMask.MaskedRange,
            from: 0,
            to: maxHour,
          },
          MINUTES: {
            mask: IMask.MaskedRange,
            from: 0,
            to: 59,
          },
        },
      },
    ];
  }, [maxHour]);

  return (
    <ProFormItem {...props}>
      {modeContext.mode === "read" ? (
        form.getFieldValue(props.name)
      ) : (
        <MaskedInput mask={mask} placeholder="oo:mm" />
      )}
    </ProFormItem>
  );
};
