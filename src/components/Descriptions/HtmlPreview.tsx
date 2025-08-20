/**
 * We have created this component to avoid style contamination with the admin panel.
 * With iframe wrap, the HTML is rendered in an isolated environment.
 */

import { ReactNode, useRef, useState } from "react";

interface HtmlPreviewProps {
  children: ReactNode;
}

export const HtmlPreview = ({ children }: HtmlPreviewProps) => {
  const style = `
    <style>
        img{
            max-width: 100% !important;
        }
        body {
            font-family: Ubuntu, Helvetica, Helvetica Neue;
            font-size: 16px;
            padding: 0;
            margin: 0;
        }
        body > p:first-child{
          margin-top: 0
        }
        
        body > p:last-child{
          margin-bottom: 0
        }
    </style>
  `;

  const ref = useRef<HTMLIFrameElement | null>(null);
  const [height, setHeight] = useState("0px");

  const onLoad = () => {
    if (
      ref.current &&
      ref?.current?.contentWindow?.document.body.scrollHeight
    ) {
      setHeight(
        ref?.current?.contentWindow?.document.body.scrollHeight + 50 + "px"
      );
    }
  };

  return (
    <iframe
      srcDoc={`${style} ${children}`}
      ref={ref}
      onLoad={onLoad}
      height={height}
      className="w-full"
    />
  );
};
