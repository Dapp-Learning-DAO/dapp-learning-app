"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import Link from "next/link";
import ApproveBtn from "components/ApproveBtn";
import RewardCreateForm from "./RewardCreateForm";
import AlertBox, { showAlertMsg } from "components/AlertBox";
import AutoSwitchNetwork from "components/AutoSwitchNetwork";
import useRedpacketContract from "hooks/useRedpacketContract";
import { ZERO_BYTES32 } from "constant/index";
import { IRewardCreateForm } from "types/rewardTypes";
import { pinJSONToIPFS } from "utils/fetchIPFS";
import { emitCustomEvent } from "hooks/useCustomEvent";
import { REWARD_LIST_REFRESH_EVENT } from "hooks/useRedpacketsLists";
import { REWARD_MSG_PRE } from "config/constants";

export default function CreateRedpacketPage() {
  const { address, chain } = useAccount();
  const formRef = useRef(null);
  const alertBoxRef = useRef(null);
  const approveBtnRef = useRef(null);
  const redPacketContract = useRedpacketContract();

  const [ts, setTs] = useState(Math.floor(new Date().getTime() / 1000));
  const [selectedTokenAddr, setSelectedTokenAddr] = useState<string>("");
  const [isApproved, setIsApproved] = useState(false);
  const [exceptedAllowance, setExceptedAllowance] = useState(0n);
  const [formData, setFormData] = useState<IRewardCreateForm | null>(null);
  const [ipfsCid, setIpfsCid] = useState<string | null>(null);
  // const [showConfetti, setShowConfetti] = useState(false);
  const [submitClicked, setSubmitClicked] = useState(false);

  const {
    data: createWriteSimRes,
    error: createWriteSimError,
    isSuccess: simIsSuccess,
    isLoading: simWriteLoading,
    refetch: refetchsim,
  } = useSimulateContract({
    chainId: chain?.id,
    address: redPacketContract?.address as `0x${string}`,
    abi: redPacketContract?.abi,
    functionName: "create_red_packet",
    args: [
      formData?.merkleRoot,
      formData?.lockBytes ? formData?.lockBytes : ZERO_BYTES32,
      formData?.number,
      formData?.mode,
      formData
        ? formData?.duration * Number(formData?.durationUnit)
        : 24 * 60 * 60,
      `${REWARD_MSG_PRE}_${ts}_${ipfsCid ? ipfsCid : ""}`,
      formData?.name,
      formData?.tokenType,
      formData?.tokenObj?.address,
      formData?.tokenAmountParsed,
    ],
    query: {
      enabled: !!(
        redPacketContract &&
        redPacketContract?.address &&
        formData &&
        isApproved &&
        formData.isValid &&
        formData.merkleRoot
      ),
    },
  });

  const {
    data: createTx,
    writeContractAsync: writeCreateRepacket,
    isPending: writeIsLoading,
    isError: writeIsError,
    error: writeError,
    reset: writeReset,
  } = useWriteContract();

  useEffect(() => {
    if (writeError) {
      const msg = "create write contract error: " + JSON.stringify(writeError);
      console.error(msg);
      // showAlertMsg(alertBoxRef, msg, "error");
    } else if (createWriteSimError) {
      console.error("create simulation error: ", createWriteSimError);
    }
  }, [writeError, createWriteSimError]);

  const {
    data: txRes,
    isError: txIsError,
    isLoading: txIsLoading,
  } = useWaitForTransactionReceipt({
    hash: createTx as `0x${string}`,
  });

  const reset = useCallback(() => {
    setSubmitClicked(false);
    setFormData(null);
    setIpfsCid(null);
    writeReset();
  }, [writeReset]);

  useEffect(() => {
    if (txRes || txIsError) {
      (approveBtnRef?.current as any)?.refresh();
      reset();
    }
    if (txRes) {
      showAlertMsg(alertBoxRef, "Create Successfully!", "success");
      console.log("CreationSuccess", txRes);
      showCongrats();
      emitCustomEvent(REWARD_LIST_REFRESH_EVENT, 30 * 1000);
    }
  }, [txRes, txIsError, reset]);

  const submitLoading = simWriteLoading || writeIsLoading || txIsLoading;
  const submitDisabled =
    !createWriteSimRes ||
    !createWriteSimRes?.request ||
    !writeCreateRepacket ||
    writeIsError ||
    !isApproved ||
    !formData?.isValid;

  useEffect(() => {
    if (formData) {
      if (typeof formData.tokenAmountParsed !== "undefined") {
        setExceptedAllowance(formData.tokenAmountParsed);
      }
      if (formData.tokenObj) {
        setSelectedTokenAddr(formData?.tokenObj?.address);
      }
    }
  }, [formData]);

  const handleSubmit = async (_e: any) => {
    if (submitClicked || submitDisabled || submitLoading) return;
    if (!formRef.current) return;
    setSubmitClicked(true);

    // console.warn("createWriteSimRes", createWriteSimRes);
    if (
      createWriteSimRes &&
      createWriteSimRes?.request &&
      typeof writeCreateRepacket == "function"
    ) {
      try {
        const ipfsHash = await beforeSendCreationTx(formData);
        // ipfsHash is change, shuold update calldata
        await refetchsim();
      } catch (error) {
        console.error("beforeSendCreationTx error", error);
        showAlertMsg(alertBoxRef, "Create Reward faild.", "error");
        setSubmitClicked(false);
        return;
      }
    } else {
      showAlertMsg(alertBoxRef, "transaction is not ready, please try later.");
      setSubmitClicked(false);
    }
  };

  const beforeSendCreationTx = async (form: IRewardCreateForm) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await pinJSONToIPFS({
          dataBody: form?.members,
          filename: form?.merkleRoot as string,
        });
        console.warn("save packet address list to IPFS", res);
        if (res?.IpfsHash) {
          setIpfsCid(res.IpfsHash);
          resolve(res.IpfsHash);
        } else {
          reject("no cid");
        }
      } catch (error) {
        console.error("save packet error:", error);
        setIpfsCid("");
        reject(error);
      }
    });
  };

  // after click submit, and ipfs data uploaded,
  // will resim the contract write func
  useEffect(() => {
    if (
      !submitClicked ||
      !ipfsCid ||
      !simIsSuccess
    )
      return;
    try {
      console.warn("Create redpacket tx request", createWriteSimRes!.request)
      writeCreateRepacket?.(createWriteSimRes!.request);
    } catch (error) {
      console.error("writeCreateRepacket error", error);
      showAlertMsg(alertBoxRef, "Create Reward faild.", "error");
      setTimeout(() => {
        reset();
      }, 1000);
    }
  }, [
    submitClicked,
    ipfsCid,
    simIsSuccess,
    createWriteSimRes,
    writeCreateRepacket,
    reset,
  ]);

  const showCongrats = () => {
    // setShowConfetti(true);
    (document as any)
      .querySelector("#redpacket_create_success_modal")
      .showModal();
  };

  useEffect(() => {
    const dialog = (document as any).querySelector(
      "#redpacket_create_success_modal"
    );
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape") {
        event.preventDefault(); // 阻止ESC键默认行为
      }
    };

    if (dialog) {
      dialog.addEventListener("keydown", handleKeyDown);

      // Cleanup
      return () => {
        dialog.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, []);

  return (
    <>
      <div className="container m-auto max-w-xl">
        <AutoSwitchNetwork forceSwitch={true} />
        <div className={`px-8 pt-8`}>
          <div className="pb-4">
            <div className="flex justify-center items-center text-3xl font-bold text-center">
              Create RedPacket
            </div>
            <RewardCreateForm
              ref={formRef}
              editDisabled={submitClicked || writeIsLoading || !!createTx}
              onChange={(data: IRewardCreateForm) => {
                console.log("onFormChange", data);
                setFormData(data);
              }}
            />
            <AlertBox ref={alertBoxRef} />
            <div className="mb-4 md:grid md:grid-cols-2 md:gap-8 md:p-8">
              <ApproveBtn
                ref={approveBtnRef}
                tokenAddr={selectedTokenAddr as `0x${string}`}
                exceptedAllowance={exceptedAllowance}
                onApprovalChange={setIsApproved}
                onError={() => {
                  showAlertMsg(alertBoxRef, "Approve faild.", "error");
                }}
              />

              <button
                className="mb-4 btn btn-primary btn-block md:flex-1"
                disabled={submitClicked || submitDisabled || submitLoading}
                onClick={handleSubmit}
              >
                {(submitClicked || submitLoading) && (
                  <div className="loading loading-spinner loading-md inline-block mr-2"></div>
                )}
                {submitClicked || submitLoading ? "Loading" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* <ConfettiMask show={showConfetti} /> */}
      <dialog id="redpacket_create_success_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-xl text-center">
            Create Reward Successfully!
          </h3>
          <div className="modal-action w-full gap-4">
            <Link className="w-full" href="/reward">
              <button className="btn btn-block btn-primary">Confirm</button>
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
