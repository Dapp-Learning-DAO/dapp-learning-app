import { LanguageIcon } from "@heroicons/react/24/outline";
import { useChangeLocale, useCurrentLocale } from "locales/client";

export const localesConf: {
  name: string;
  value: "en" | "cn";
}[] = [
  {
    name: "English",
    value: "en",
  },
  {
    name: "中文",
    value: "cn",
  },
];

export default function LocalesSelector() {
  const changeLocale = useChangeLocale();
  const locale = useCurrentLocale();

  return (
    <div className="dropdown dropdown-top">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm m-1">
        <LanguageIcon className="w-4" />
        <span className="uppercase font-normal">{locale}</span>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-36"
      >
        {localesConf.map((localItem) => (
          <li key={localItem.value}>
            <button
              className="btn btn-ghost"
              onClick={() => changeLocale(localItem.value)}
            >
              {localItem.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
