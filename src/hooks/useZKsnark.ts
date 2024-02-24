import { useCallback } from "react";
import { buildPoseidon } from "circomlibjs";
import { keccak256, toHex } from "viem";
import Vkey from "../../public/zksnark/verification_key.json";
import { groth16 } from "snarkjs";

export default function useZKsnark() {
  const calculateProof = useCallback(async (input: string) => {
    const proveRes = await groth16.fullProve(
      { in: keccak256(toHex(input)) },
      `/zksnark/datahash.wasm`,
      `/zksnark/circuit_final.zkey`
    );
    console.log("calculateProof proveRes", proveRes);
    console.log(Vkey);

    const res = await groth16.verify(
      Vkey,
      proveRes.publicSignals,
      proveRes.proof
    );

    if (res) {
      console.log("calculateProof verify passed!");

      // @remind 必须使用 exportSolidityCallData 方法转换，否则calldata顺序不对
      const proof = convertCallData(
        await groth16.exportSolidityCallData(
          proveRes.proof,
          proveRes.publicSignals
        )
      );

      return {
        proof: proof,
        publicSignals: proveRes.publicSignals,
      };
    } else {
      console.error("calculateProof verify faild.");
      return null;
    }
  }, []);

  const calculatePublicSignals = useCallback(async (input: string) => {
    const poseidon = await buildPoseidon();
    const hash = poseidon.F.toString(poseidon([keccak256(toHex(input))]));
    return toHex(BigInt(hash), { size: 32 });
  }, []);

  return { calculateProof, calculatePublicSignals };
}

function convertCallData(calldata: string) {
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
