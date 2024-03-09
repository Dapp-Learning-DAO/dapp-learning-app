import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function useRouteParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  function setRouteParams(
    params: { [key: string]: string },
    scroll: boolean = false,
    originSearchString?: string,
  ) {
    let searchString: string =
      typeof originSearchString === "undefined"
        ? searchParams.toString()
        : originSearchString;
    for (let [key, value] of Object.entries(params)) {
      if (searchString.indexOf(`${key}=${searchParams.get(`${key}`)}`) > -1) {
        searchString = `${searchString.replace(
          `${key}=${searchParams.get(`${key}`)}`,
          `${key}=${value}`,
        )}`;
      } else {
        searchString = `${searchString}&${key}=${value}`;
      }
    }
    router.replace(`${pathname}?${searchString}`, { scroll });
    console.log(`setRouteParams`, params, searchString);
  }

  function removeRouteParam(key: string) {
    let searchString: string = searchParams.toString();
    let _param = `${key}=${searchParams.get(`${key}`)}`;
    if (`${searchParams}`.indexOf(`&${_param}`) > -1) {
      searchString = `${searchParams.toString().replace(`&${_param}`, "")}`;
    } else if (`${searchParams}`.indexOf(`${_param}`) > -1) {
      searchString = `${searchParams.toString().replace(`${_param}`, "")}`;
    }
    router.replace(`${pathname}?${searchString}`, { scroll: false });
    console.log(`removeRouteParam ${key}`, searchString);
  }

  return {
    setRouteParams,
    removeRouteParam,
  };
}
