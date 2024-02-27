export const isCidMsgValid = (msg: any): boolean => {
  return (
    typeof msg === "string" && msg !== "null" && /^APP_\d+_[a-z0-9]+$/.test(msg)
  );
};

export const getCidFromMsg = (msg: any): string => {
  if (isCidMsgValid(msg)) {
    return msg.split("_")[2];
  }
  return "";
};
