import { useEffect, useState } from "react";

function useTheme() {
  const [theme, setTheme] = useState<string | null>("");

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme"));
    const observerCallback = (
      mutationsList: MutationRecord[],
      observer: MutationObserver,
    ) => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          setTheme(document.documentElement.getAttribute("data-theme"));
        }
      }
    };

    const observer = new MutationObserver(observerCallback);
    const config = { attributes: true };
    observer.observe(document.documentElement, config);

    return () => {
      observer.disconnect();
    };
  }, []);

  return theme;
}

export default useTheme;
