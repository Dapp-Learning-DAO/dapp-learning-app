import { BoltIcon } from "@heroicons/react/24/outline";

export default function RedpacketZkTag() {
  return (
    <div className="tooltip tooltip-bottom" data-tip="This is a ZK Redpacket!">
      <div className="badge badge-warning px-2 ml-2 rounded-sm font-normal cursor-pointer">
        <BoltIcon className="w-4" />
        ZK
      </div>
    </div>
  );
}
