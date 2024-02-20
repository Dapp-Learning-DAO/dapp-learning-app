import { useCallback, useEffect, useState } from "react";
import { buildPoseidon } from "circomlibjs";
import Vkey from "../../public/zksnark/verification_key.json";
import { keccak256, toHex } from "viem";

export default function useZKsnark() {
  const [snarkjsInited, setSnarkjsInited] = useState(false);

  const calculateProof = useCallback(
    async (input) => {
      if (!snarkjsInited) return null;
      const proveRes = await snarkjs.groth16.fullProve(
        { in: keccak256(toHex(input)) },
        "../../public/zksnark/datahash.wasm",
        "../../public/zksnark/circuit_final.zkey",
      );
      console.log("calculateProof proveRes", proveRes);
      console.log(Vkey);

      const res = await snarkjs.groth16.verify(
        Vkey,
        proveRes.publicSignals,
        proveRes.proof,
      );

      if (res) {
        console.log("calculateProof verify passed!");

        // @remind 必须使用 exportSolidityCallData 方法转换，否则calldata顺序不对
        const proof = convertCallData(
          await snarkjs.groth16.exportSolidityCallData(
            proveRes.proof,
            proveRes.publicSignals,
          ),
        );

        return {
          proof: proof,
          publicSignals: proveRes.publicSignals,
        };
      } else {
        console.error("calculateProof verify faild.");
        return null;
      }
    },
    [snarkjsInited],
  );

  const calculatePublicSignals = useCallback(
    async (input) => {
      if (!snarkjsInited) return "";
      const poseidon = await buildPoseidon();
      const hash = poseidon.F.toString(poseidon([keccak256(toHex(input))]));
      return toHex(BigInt(hash), { size: 32 });
    },
    [snarkjsInited],
  );

  useEffect(() => {
    if (typeof snarkjs !== "undefined") {
      setSnarkjsInited(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "/zksnark/snarkjs.min.js";
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => {
      console.log("snarkjs Script loaded successfully!");
      setSnarkjsInited(true);
    };
    script.onerror = () => {
      console.error("snarkjs Error loading the script.");
      setSnarkjsInited(false);
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return { snarkjsInited, calculateProof, calculatePublicSignals };
}

function convertCallData(calldata) {
  const argv = calldata.replace(/["[\]\s]/g, "").split(",");

  const a = [argv[0], argv[1]];
  const b = [
    [argv[2], argv[3]],
    [argv[4], argv[5]],
  ];
  const c = [argv[6], argv[7]];

  let input = [];
  // const input = [argv[8], argv[9]];
  for (let i = 8; i < argv.length; i++) {
    input.push(argv[i]);
  }

  return { a, b, c, input };
}
