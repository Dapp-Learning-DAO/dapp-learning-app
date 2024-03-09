"use client";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { debounce } from "lodash";
import React, {
  ChangeEvent,
  MouseEventHandler,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { shortAddress } from "utils/index";
import { isAddress } from "viem";
// import Papa from 'papaparse';

// mock address List
// 0x1fae896f3041d7e8Bf5Db08cAd6518b0Eb82164a,0x17670B6512e68574eb5398d5117266F9D45aE637,0x0Eb330289A532a3da281717519b368c145De7fbA,0x0B1a5Fe4222b13ff1EbB0551b151d773D8Bae1b0

const AddressListInput = forwardRef(
  (
    {
      onAddressChange,
      onChange,
      disabled,
      ...rest
    }: {
      onAddressChange: (_addressList: `0x${string}`[]) => void;
      onChange?: (_addressList: `0x${string}`[]) => void;
      disabled?: boolean | undefined;
    },
    ref: any,
  ) => {
    const [addresses, setAddresses] = useState(new Set<string>());
    const [textareaVal, setTextareaVal] = useState("");
    const [errorTxt, setErrorTxt] = useState("");
    const [mode, setMode] = useState(0);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleInputAddAddress = debounce(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorTxt("");
        let input = e.target.value.trim();
        if (isAddress(input)) {
          if (addresses.has(input)) {
            setErrorTxt(`Address already exsist`);
            return;
          }
          setAddresses((prev) => {
            const newSet = new Set(prev);
            newSet.add(input);
            return newSet;
          });
          e.target.value = "";
        } else {
          setErrorTxt(`Invalid address`);
          return;
        }
      },
      500,
    );

    const handleTextareaChange = debounce(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        setErrorTxt("");
        setTextareaVal(e.target.value);
      },
      200,
    );

    const processTextarea = useCallback(() => {
      let newSet = new Set(addresses);
      const addrs = textareaVal
        .trim()
        .split(/[\n,;]+/)
        .filter(Boolean);
      for (let i = 0; i < addrs.length; i++) {
        const addr = addrs[i];
        if (!addr) continue;
        if (isAddress(addr)) {
          if (addresses.has(addr)) {
            // setErrorTxt(`${addr} already exsist`);
            continue;
          }
          newSet.add(addr);
        } else {
          setErrorTxt(`${addr} is a invalid address`);
          continue;
        }
      }

      if (textareaRef.current) {
        textareaRef.current.value = "";
        setTextareaVal("");
      }
      setAddresses(newSet);
    }, [textareaVal, addresses]);

    const handleRemoveAddress = (_address: string) => {
      if (disabled) return;
      setAddresses((prev) => {
        const newSet = new Set(prev);
        newSet.delete(_address);
        return newSet;
      });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result?.toString();
          if (file.name.endsWith(".json")) {
            const json = JSON.parse(text!);
            const validAddresses = json.filter((addr: string) =>
              isAddress(addr),
            );
            setAddresses(validAddresses);
          } else if (file.name.endsWith(".csv")) {
            // Papa.parse(text!, {
            //   complete: (results) => {
            //     const validAddresses = results.data.filter((row: string[]) => isAddress(row[0]));
            //     setAddresses(validAddresses.map((row: string[]) => row[0]));
            //   }
            // });
          }
        };
        reader.readAsText(file);
      }
    };

    useEffect(() => {
      const _addressList = Array.from(addresses).sort() as `0x${string}`[];
      onAddressChange(_addressList);
      if (onChange) onChange(_addressList);
    }, [addresses]); // eslint-disable-line

    return (
      <div ref={ref} {...rest} className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div role="tablist" className="tabs">
            <a
              role="tab"
              className={`tab ${
                mode == 0 ? "text-base-content" : "text-slate-500"
              }`}
              onClick={() => setMode(0)}
            >
              single input
            </a>
            <a
              role="tab"
              className={`tab ${
                mode == 1 ? "text-base-content" : "text-slate-500"
              }`}
              onClick={() => setMode(1)}
            >
              multiple input
            </a>
            {/* <a
              role="tab"
              className={`tab  ${
                mode == 2 ? "text-base-content" : "text-slate-500"
              }`}
              onClick={() => setMode(2)}
            >
              import file
            </a> */}
          </div>
          <div className="text-slate-500 text-sm">
            total <span className="font-bold">{addresses.size}</span>
          </div>
        </div>
        {mode == 0 && (
          <>
            <input
              placeholder="input address and press enter"
              className="textarea textarea-bordered flex-1"
              onChange={handleInputAddAddress}
              disabled={disabled}
            />
            <div className="my-1 min-h-3 text-error font-bold text-sm">
              {errorTxt}
            </div>
          </>
        )}
        {mode == 1 && (
          <>
            <div className="relative">
              <textarea
                ref={textareaRef}
                placeholder="input address and press enter"
                className="block w-full textarea textarea-bordered flex-1 pb-12 mr-4"
                onChange={handleTextareaChange}
                disabled={disabled}
              />
              {errorTxt ? (
                <div className="my-1 min-h-3 text-error font-bold text-sm">
                  {errorTxt}
                </div>
              ) : (
                <div className="my-1 min-h-3 text-slate-500 text-sm">
                  Enter a list of addresses, separated by{" "}
                  <span className="font-bold">
                    comma, semicolon, or new line
                  </span>
                  .
                </div>
              )}
            </div>
            <div className="flex justify-end items-center my-2 mr-4">
              {textareaVal && (
                <button
                  className="btn btn-sm btn-link text-slate-500 normal-case no-underline mr-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (textareaRef.current) {
                      textareaRef.current.value = "";
                      setTextareaVal("");
                    }
                  }}
                >
                  Clear
                </button>
              )}
              <button
                className={`text-sm underline ${!textareaVal ? "text-slate-500" : "text-primary"}`}
                disabled={!textareaVal}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  processTextarea();
                }}
              >
                Confirm
              </button>
            </div>
          </>
        )}

        {mode == 2 && (
          <label>
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="btn">Choose File</span>
          </label>
        )}

        <div
          className={`overflow-y-auto min-h-40 max-h-[30vh] rounded-xl border p-4 ${
            addresses.size === 0 ? "bg-base-200" : ""
          }`}
        >
          {Array.from(addresses)
            .sort()
            .map((address, index) => (
              <div
                key={index}
                className="badge badge-xl w-full rounded-none py-4 pl-4 pr-10 relative overflow-hidden mb-1"
              >
                <span className="hidden sm:inline">{address}</span>
                <span className="inline sm:hidden">
                  {shortAddress(address)}
                </span>
                <div
                  className="absolute px-1 py-2 right-0 bg-error cursor-pointer"
                  onClick={(e: any) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveAddress(address);
                  }}
                >
                  <XCircleIcon className="w-5 text-white" />
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  },
);
AddressListInput.displayName = "AddressListInput";

export default AddressListInput;
