"use client";
import {
  useState,
  useEffect,
  forwardRef,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useForm, Controller } from "react-hook-form";
import Validate from "utils/validate";
import TokenAmountInput from "components/TokenAmountInput";
import TokenSelector from "components/TokenSelector";
import { IRewardCreateForm } from "types/rewardTypes";
import AddressListInput from "components/AddressListInput";
import { ITokenConf } from "types/tokenTypes";
import { useDebounce } from "react-use";
import useZKsnark from "hooks/useZKsnark";
import { keccak256 } from "viem";
import { MerkleTree } from "merkletreejs";
import { hashToken } from "utils/getMerkleTree";

const defaultValues: IRewardCreateForm = {
  isValid: false,
  name: "Lucky RedPacket",
  enablePassword: false,
  password: "",
  lockBytes: null,
  mode: true,
  tokenType: 1,
  members: [],
  merkleRoot: null,
  tokenAmount: 0,
  tokenAmountParsed: 0n,
  duration: 1,
  durationUnit: 1 * 60 * 60 * 24,
  number: 1,
  tokenObj: null,
};

const RewardCreateForm = forwardRef(
  (
    {
      editDisabled = false,
      onChange,
    }: {
      editDisabled: boolean;
      onChange: (_v: IRewardCreateForm) => void;
    },
    ref: any
  ) => {
    const [enablePassword, setEnablePassword] = useState(false);
    const [tokenObj, setTokenObj] = useState<ITokenConf | null>(null);
    const [changeCount, setChangeCount] = useState(0);
    const { calculatePublicSignals } = useZKsnark();

    const {
      register,
      getValues,
      watch,
      control,
      reset,
      resetField,
      trigger,
      setValue,
      setError,
      clearErrors,
      handleSubmit,
      unregister,
      formState: { errors, isValid, isValidating, dirtyFields, touchedFields },
    } = useForm<IRewardCreateForm>({
      mode: "onChange",
      criteriaMode: "all",
      disabled: !!editDisabled,
      defaultValues,
    });

    const tokenAmountValidate = (
      value: string | number,
      formValues: IRewardCreateForm
    ) => {
      clearErrors("tokenAmount");
      const amount = value;
      if (dirtyFields.tokenAmount) {
        if (isNaN(amount as number) || !isAmountValid(amount)) {
          setError("tokenAmount", {
            type: "custom",
            message: "Token Amount is invalid.",
          });
          return false;
        } else if (Number(amount) <= 0) {
          setError("tokenAmount", {
            type: "custom",
            message: "TokenAmount should greater than 0",
          });
          return false;
        }
      }
      if (formValues.members.length > 0) {
        if (Number(amount) / formValues.number <= 0.1) {
          setError("tokenAmount", {
            type: "custom",
            message: "At least 0.1 for each user",
          });
          return false;
        }
      }
      return true;
    };

    // convert password to public signal
    const passwordWatchData = watch("password");
    useDebounce(
      async () => {
        if (
          passwordWatchData &&
          Validate.isValidZKpasswordInput(passwordWatchData)
        ) {
          const outputHash = await calculatePublicSignals(
            passwordWatchData as string
          );
          setValue("lockBytes", outputHash);
        } else {
          setValue("lockBytes", null);
        }
        setChangeCount((prev) => prev + 1);
      },
      500,
      [calculatePublicSignals, setValue, passwordWatchData]
    );

    // generate merkle root
    const membersWatchData = watch("members");
    useDebounce(
      () => {
        if (membersWatchData.length > 0) {
          const merkleTree = new MerkleTree(
            membersWatchData?.map((address) => hashToken(address)),
            keccak256,
            { sortPairs: true }
          );
          const merkleRoot = merkleTree.getHexRoot();
          setValue("merkleRoot", merkleRoot);
          console.log("handleMerkleTree root:", merkleRoot);
        } else {
          setValue("merkleRoot", null);
        }
        setChangeCount((prev) => prev + 1);
      },
      500,
      [membersWatchData, setValue]
    );

    const handleFormChange = async (data: IRewardCreateForm | null) => {
      if (!data) data = getValues();
      data.isValid = isValid;
      onChange(data);
    };

    useDebounce(
      () => {
        handleFormChange(null);
      },
      500,
      [changeCount]
    );

    return (
      <form ref={ref} onChange={() => setChangeCount((prev) => prev + 1)}>
        <div className="pb-4" ref={ref}>
          <div className="flex flex-col justify-center gap-1 pb-2 mt-3">
            <strong>Name</strong>
            <input
              type="text"
              className="input input-bordered"
              defaultValue={defaultValues.name}
              {...register("name", {
                validate: (value, formValues) => {
                  if (!value) {
                    setError("name", {
                      type: "custom",
                      message: "Name is Empty",
                    });
                    return false;
                  }
                  clearErrors("name");
                  return true;
                },
              })}
            />
            {errors.name && (
              <span className="mt-2 text-error text-xs font-bold">
                {errors.name.message}
              </span>
            )}
          </div>
          <div className="flex flex-col justify-center gap-1 pb-2 mt-3">
            <div className="flex">
              <span className="flex-1">
                <strong>Password</strong>
                <span className="text-sm text-slate-500 ml-4">
                  (set claim password)
                </span>
              </span>
              <label className="label cursor-pointer">
                <span
                  className={`label-text pr-2 ${
                    enablePassword ? "text-primary" : "text-slate-500"
                  }`}
                >
                  {enablePassword ? "using password" : "no password"}
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  {...register("enablePassword", {
                    onChange: (e) => {
                      setValue("enablePassword", e.target.checked);
                      setEnablePassword(e.target.checked);
                    },
                  })}
                />
              </label>
            </div>
            <input
              type="text"
              className="input input-bordered"
              {...register("password", {
                required: enablePassword,
                disabled: editDisabled || !enablePassword,
                maxLength: 40,
                validate: (value, formValues) => {
                  if (formValues.enablePassword) {
                    if (!value) {
                      setError("password", {
                        type: "required",
                        message: "Password is Empty",
                      });
                      return false;
                    } else {
                      if (!Validate.isValidZKpasswordInput(value)) {
                        setError("password", {
                          type: "custom",
                          message:
                            "Password is invalid, only support a-z A-Z 0-9 ,.!? ",
                        });
                        return false;
                      }
                    }
                  }
                  clearErrors("password");
                  return true;
                },
              })}
            />
            {errors.password && (
              <span className="mt-2 text-error text-xs font-bold">
                {errors.password.message}
              </span>
            )}
            {enablePassword && (
              <div className="py-4 text-sm">
                You are creating a ZK (Zero-Knowledge) redpacket! <br />
                Before claimers can claim, the contract will verify through ZK
                proof that the password is correct.{" "}
                <span className="font-bold">
                  This operation may lead to an increase in gas fees.
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-1 pb-2 mt-3">
            <strong className="mb-4">Members</strong>
            <Controller
              name="members"
              control={control}
              rules={{
                required: true,
                validate: (value, formValues) => {
                  if (value.length == 0) {
                    setError("members", {
                      type: "custom",
                      message: "No Members",
                    });
                    return false;
                  } else if (formValues.number > value.length) {
                    setError("number", {
                      type: "custom",
                      message: "Number shuold not greater Members",
                    });
                  }
                  clearErrors("members");
                  return true;
                },
                onChange: (_addressList) => {},
              }}
              render={({ field, fieldState, formState }) => (
                <AddressListInput
                  {...field}
                  onAddressChange={async (_addressList) => {
                    setValue("members", _addressList);
                    field.onChange(_addressList);
                    await trigger(["members", "tokenAmount"]);
                    setChangeCount((prev) => prev + 1);
                  }}
                />
              )}
            />

            {errors.members && (
              <span className="mt-2 text-error text-xs font-bold">
                {errors.members.message}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between my-3">
            <strong>Use Random Mode</strong>
            <label className="cursor-pointer label">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                defaultChecked={true}
                {...register("mode", {
                  required: true,
                  onChange: (e) => {
                    setValue("mode", e.target.checked);
                  },
                })}
              />
            </label>
          </div>
          <div className="flex flex-col justify-center gap-1 pb-2 mt-3">
            <strong>Red Packet Number</strong>
            <input
              className="input input-bordered"
              {...register("number", {
                required: true,
                validate: (value, formValues) => {
                  if (typeof value !== "undefined") {
                    if (isNaN(value)) {
                      setError("number", {
                        type: "custom",
                        message: "Red Packet Number Is invalid",
                      });
                      return false;
                    }
                    if (value <= 0) {
                      setError("number", {
                        type: "custom",
                        message: "Red Packet Number should greater than 0",
                      });
                      return false;
                    }
                    if (
                      formValues.members.length > 0 &&
                      value > formValues.members.length
                    ) {
                      setError("number", {
                        type: "custom",
                        message:
                          "Red Packet Number should not greater than members number",
                      });
                      return false;
                    }
                  }
                  // check amount Input
                  // setValue("isValid", validateAmountInput());

                  clearErrors(["number"]);
                  return true;
                },
                onChange(e) {
                  setValue("number", Number(e.target.value));
                },
              })}
              type="text"
            />
            {errors.number && (
              <span className="mt-2 text-error text-xs font-bold">
                {errors.number.message}
              </span>
            )}
          </div>
          <div className="flex flex-col justify-center gap-1 border-b-2 pb-2 mt-3">
            <strong>Duration</strong>
            <div className=" flex ">
              <input
                className="outline-none border-none bg-transparent text-xl w-full"
                type="text"
                min={1}
                {...register("duration", {
                  required: true,
                  validate: (value, formValues) => {
                    clearErrors("duration");
                    if (value <= 0) {
                      setError("duration", {
                        type: "custom",
                        message: "duration should greater than 0",
                      });
                      return false;
                    } else if (parseInt(`${value}`) != value) {
                      setError("duration", {
                        type: "custom",
                        message: "duration must be Integer",
                      });
                      return false;
                    }
                    return true;
                  },
                  onChange(e) {
                    setValue("duration", Number(e.target.value));
                  },
                })}
                defaultValue={1}
              />
              <select
                defaultValue={defaultValues.durationUnit}
                className="select select-bordered"
                {...register("durationUnit", {
                  onChange(e) {
                    setValue("durationUnit", Number(e.target.value));
                  },
                })}
              >
                <option key={"day"} value={60 * 60 * 24}>
                  Day
                </option>
                <option key={"hour"} value={60 * 60 * 1}>
                  Hour
                </option>
                <option key={"mins"} value={60}>
                  Minute
                </option>
              </select>
            </div>
            {errors.duration && (
              <span className="mt-2 text-error text-xs font-bold">
                {errors.duration.message}
              </span>
            )}
          </div>
          <div className="flex flex-col justify-center gap-1 pb-2 mt-3">
            <strong>Token</strong>
            <TokenSelector
              {...register("tokenObj", {
                required: true,
              })}
              editDisabled={editDisabled}
              onSelect={async (_token) => {
                // @todo set 0 if WETH(ETH)
                setValue("tokenType", 1);
                setValue("tokenObj", _token);
                setTokenObj(_token);
                await trigger(["tokenObj", "tokenType"]);
                setChangeCount((prev) => prev + 1);
              }}
            />
            {errors.tokenType && (
              <span className="mt-2 text-error text-xs font-bold">
                {errors.tokenType.message}
              </span>
            )}
            {errors.tokenObj && (
              <span className="mt-2 text-error text-xs font-bold">
                {errors.tokenObj.message}
              </span>
            )}
          </div>
          <div className="flex flex-col justify-center gap-1 pb-2 mt-3">
            <strong>Token Amount</strong>
            <TokenAmountInput
              {...register("tokenAmount", {
                required: true,
                validate: tokenAmountValidate,
              })}
              editDisabled={editDisabled}
              tokenObj={tokenObj}
              onAmountChange={async ({ amount, amountParsed }) => {
                setValue("tokenAmount", amount);
                setValue("tokenAmountParsed", amountParsed);
                await trigger("tokenAmountParsed");
                // setChangeCount((prev) => prev + 1);
              }}
            />
            {errors.tokenAmount && (
              <span className="mt-2 text-error text-xs font-bold">
                {errors.tokenAmount.message}
              </span>
            )}
          </div>
        </div>
      </form>
    );
  }
);

RewardCreateForm.displayName = "RewardCreateForm";

export default RewardCreateForm;

function isAmountValid(amount: string | number) {
  const regex = /^(-)?\d+(\.\d{0,18})?$/;
  return regex.test(`${amount}`);
}
