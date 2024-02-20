import { forwardRef, useCallback, useEffect, useState } from "react";

const AlertBox = forwardRef(
  (
    {
      onHide,
      style,
    }: {
      onHide?: () => void;
      style?: React.CSSProperties;
    },
    ref: any,
  ) => {
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState("info");
    const [alertTxt, setAlertTxt] = useState("");

    const reset = useCallback(() => {
      setShowAlert(false);
      setAlertType("");
      setAlertTxt("");
      if (onHide) onHide();
    }, [onHide]);

    const openAlert = useCallback(
      ({
        type,
        txt,
        duration = 2000,
      }: {
        show: boolean;
        type: "info" | "warning" | "error" | "success";
        txt: string;
        duration?: number;
      }) => {
        setShowAlert(true);
        setAlertType(type);
        setAlertTxt(txt);
        if (duration > 0) {
          setTimeout(() => {
            reset();
          }, duration);
        }
      },
      [reset],
    );

    useEffect(() => {
      if (ref && ref.current) {
        ref.current.open = openAlert;
        ref.current.reset = reset;
      }
    }, [ref, openAlert, reset]);

    return (
      <div ref={ref} className={showAlert ? "" : "hidden"} style={style}>
        {alertType == "info" && (
          <div className="alert flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-info shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>{alertTxt}</span>
          </div>
        )}
        {alertType == "error" && (
          <div className="alert alert-error flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{alertTxt}</span>
          </div>
        )}
        {alertType == "success" && (
          <div className="alert alert-success flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{alertTxt}</span>
          </div>
        )}
        {alertType == "warning" && (
          <div className="alert alert-warning flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{alertTxt}</span>
          </div>
        )}
      </div>
    );
  },
);
AlertBox.displayName = "AlertBox";

export const showAlertMsg = (
  alertBoxRef: any,
  msg: string,
  type: string = "info",
  duration: number = 2000,
) => {
  if (alertBoxRef.current) {
    (alertBoxRef.current as any).open({
      txt: msg,
      type: type,
      duration,
    });
  }
};

export default AlertBox;
