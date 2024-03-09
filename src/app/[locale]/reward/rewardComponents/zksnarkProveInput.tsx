import useZKsnark from "hooks/useZKsnark";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useDebounce } from "react-use";

const RewardZksnarkProveInput = forwardRef(
  (
    {
      hashLock,
      onProveSuccess,
    }: {
      hashLock: string | null;
      onProveSuccess: (_prove: any) => void;
    },
    ref: any,
  ) => {
    const inputRef = useRef(null);
    const [inputVal, setInputVal] = useState("");
    const [borderCls, setBorderCls] = useState("");
    const [tiptxt, setTiptxt] = useState("");
    const [loading, setLoading] = useState(false);
    const { calculateProof, calculatePublicSignals } = useZKsnark();

    useDebounce(
      async () => {
        if (inputVal && hashLock) {
          setLoading(true);
          const proveRes = await calculateProof(inputVal);
          const _hashLock = await calculatePublicSignals(inputVal);

          if (proveRes && hashLock === _hashLock) {
            setBorderCls("input-success");
            setTiptxt("Password correct, ZK proof generete successfully!");
            onProveSuccess(proveRes);
          } else {
            setBorderCls("input-error");
            setTiptxt("Password wrong");
            onProveSuccess(null);
          }
          setLoading(false);
        } else {
          setBorderCls("");
          setTiptxt("Input password to generate ZK proof!");
          onProveSuccess(null);
        }
      },
      500,
      [inputVal, hashLock],
    );

    const reset = () => {
      if (inputRef.current) {
        (inputRef.current as any).value = "";
      }
      setInputVal("");
      setBorderCls("");
      setTiptxt("");
      setLoading(false);
      // onProveSuccess(null);
    };

    useEffect(() => {
      if (ref.current) {
        ref.current.reset = reset;
      }
    }, [ref]);

    return (
      // `input-error` `input-success` 需要在这里触发编译到静态样式中
      <div className="w-full input-error input-success relative">
        <input
          type="text"
          ref={inputRef}
          className={`w-full input input-bordered ${borderCls}`}
          placeholder="Password"
          onChange={(e: any) => {
            const value = e.target.value;
            setInputVal(value);
          }}
        />
        {loading && (
          <span className="loading loading-sm loading-spin absolute top-3 right-3"></span>
        )}
        <div className="label">
          <span className="label-text-alt font-bold">{tiptxt}</span>
        </div>
      </div>
    );
  },
);

RewardZksnarkProveInput.displayName = "RewardZksnarkProveInput";

export default RewardZksnarkProveInput;
