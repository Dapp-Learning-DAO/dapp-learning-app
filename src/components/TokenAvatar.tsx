import Image from "next/image";
import { chainsConf } from "provider/Web3Providers";
import { getTokenIcon } from "utils/getTokenIcon";
import Avatar from "./Avatar";
import { Token } from "config/tokens";

const TokenAvatar = ({
  tokenData,
  chainId,
  size,
}: {
  tokenData?: Token;
  chainId: number;
  size: number;
}) => (
  <div className="relative" style={{ width: size, height: size }}>
    <Avatar
      url={getTokenIcon(tokenData?.address as string, chainId as number)}
      address={tokenData?.address}
      size={size}
    />
    {tokenData && <ChainAvatar chainId={chainId} size={size} />}
  </div>
);

const ChainAvatar = ({ chainId, size }: { chainId: number; size: number }) => {
  if (!chainId) return <></>;
  const chainConf = chainsConf.find((_c) => _c.id == chainId);
  if (!chainConf) return <></>;

  const imgSize = Math.max(20, size / 3);

  return (
    <div
      className="absolute border border-white"
      style={{
        background: chainConf.iconBackground,
        bottom: -4,
        right: -4,
        width: imgSize,
        height: imgSize,
        borderWidth: 1.5,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {chainConf.iconUrl && (
        <Image
          alt={chainConf.name ?? "Chain icon"}
          src={chainConf.iconUrl}
          width={24}
          height={24}
        />
      )}
    </div>
  );
};

export default TokenAvatar;
