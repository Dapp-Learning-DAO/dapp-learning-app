import { useEffect } from "react";

class EventEmitter extends EventTarget {}
export const eventEmitter = new EventEmitter();

export function emitCustomEvent(eventName: string, data: any) {
  const event = new CustomEvent(eventName, { detail: data });
  eventEmitter.dispatchEvent(event);
}

export function useCustomEvent({
  customEventName,
  onChange,
}: {
  customEventName: string;
  onChange: (_data: any) => void;
}) {
  useEffect(() => {
    const eventHandler = (event: any) => {
      console.log("useCustomEvent", event); // 使用 event.detail 访问发送的数据
      onChange(event.detail);
    };

    eventEmitter.addEventListener(customEventName, eventHandler);

    return () => {
      eventEmitter.removeEventListener(customEventName, eventHandler);
    };
  }, [customEventName, onChange]);
}
