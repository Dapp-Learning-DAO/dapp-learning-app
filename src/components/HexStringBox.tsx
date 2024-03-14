import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";

const HexStringBox = ({
  hexString,
  maxWidth = 400,
  fontSize = 14,
  copyable,
}: {
  hexString: `0x${string}` | string | undefined;
  maxWidth?: number;
  fontSize?: number;
  copyable?: boolean;
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const shortenAddress = (str: `0x${string}` | string | undefined) => {
    if (!str || !maxWidth) return str;
    const strlen = str.length * fontSize;
    if (strlen < maxWidth) {
      return str;
    }
    return `${str.slice(0, 6)}...${str.slice(-4)}`;
  };

  const onCopy = () => {
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  return (
    <span className="inline-flex items-center space-x-2">
      <span>{shortenAddress(hexString)}</span>
      {copyable && (
        <>
          <CopyToClipboard text={hexString as string} onCopy={onCopy}>
            <button className={`btn btn-sm btn-ghost py-0 px-1`}>
              {copySuccess ? (
                <CheckIcon className="h-4 w-4 text-success" />
              ) : (
                <ClipboardIcon className="h-4 w-4" />
              )}
            </button>
          </CopyToClipboard>
        </>
      )}
    </span>
  );
};

export default HexStringBox;
