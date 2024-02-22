"use client";
import { useState, useEffect, forwardRef } from "react";
import { useForm, Controller } from "react-hook-form";
import Validate from "utils/validate";
import { useDebounce } from "react-use";
import TokenAmountInput from "components/TokenAmountInput";
import TokenSelector from "components/TokenSelector";
import { IRewardCreateForm } from "types/rewardTypes";
import { debounce } from "lodash";
import AddressListInput from "components/AddressListInput";

const defaultValues: IRewardCreateForm = {
  name: "Lucky RedPacket",
  enablePassword: false,
  password: "",
  mode: true,
  tokenType: 1,
  members: [],
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
    const [debounceFormData, setDebounceFormData] = useState(defaultValues);

    const {
      register,
      getValues,
      watch,
      control,
      formState,
      reset,
      resetField,
      trigger,
      setValue,
      setError,
      clearErrors,
      formState: { errors, isValid },
    } = useForm<IRewardCreateForm>({
      // mode: "onChange",
      disabled: !!editDisabled,
      defaultValues,
    });

    const watchEnablePasswrod = watch("enablePassword");
    useEffect(() => {
      if (!watchEnablePasswrod) resetField("password");
    }, [watchEnablePasswrod, resetField]);

    const handleFormChange = debounce(() => {
      const data = getValues();
      setDebounceFormData(data);
      if (isValid) onChange(data);
    }, 500);

    return (
      <form onChange={handleFormChange}>
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
                      type: "required",
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
              <Controller
                name="enablePassword"
                control={control}
                render={({ field, fieldState, formState }) => (
                  <label className="label cursor-pointer">
                    <span
                      className={`label-text pr-2 ${
                        field.value ? "text-primary" : "text-slate-500"
                      }`}
                    >
                      {field.value ? "using password" : "no password"}
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      {...field}
                      value={field.value ? "checked" : ""}
                    />
                  </label>
                )}
              />
            </div>
            <input
              type="text"
              className="input input-bordered"
              {...register("password", {
                disabled: editDisabled || !debounceFormData.enablePassword,
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
            {debounceFormData.enablePassword && (
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
            <AddressListInput />
            {errors.members && (
              <span className="mt-2 text-error text-xs font-bold">
                {errors.members.message}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between my-3">
            <strong>Redpacket Mode</strong>
            <Controller
              name="mode"
              control={control}
              render={({ field, fieldState, formState }) => (
                <label className="cursor-pointer label">
                  <span className="label-text text-right mr-2">
                    {field.value ? "random" : "fixed"}
                  </span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    defaultChecked
                    {...register("mode")}
                  />
                </label>
              )}
            />
          </div>
          <div className="flex flex-col justify-center gap-1 pb-2 mt-3">
            <strong>Red Packet Number</strong>
            <input
              type="number"
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
                  return true;
                },
              })}
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
                type="number"
                min={1}
                {...register("duration")}
                defaultValue={1}
              />
              <select
                defaultValue={defaultValues.durationUnit}
                className="select select-bordered"
                {...register("durationUnit")}
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
              editDisabled={editDisabled}
              onSelect={(_token) => {
                // @todo set 0 if WETH(ETH)
                setValue("tokenType", 1);
                setValue("tokenObj", _token);
                trigger(["tokenType", "tokenObj"]);
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
              editDisabled={editDisabled}
              onChange={({ amount, amountParsed }) => {
                register("tokenAmount", {
                  validate: (value, formValues) => {
                    if (formValues.members.length > 0) {
                      if (!value) {
                        setError("tokenAmount", {
                          type: "custom",
                          message: "Token Amount is empty.",
                        });
                        return false;
                      } else if (!isAmountValid(value)) {
                        setError("tokenAmount", {
                          type: "custom",
                          message: "Token Amount is invalid.",
                        });
                        return false;
                      } else if (Number(value) <= 0) {
                        setError("tokenAmount", {
                          type: "custom",
                          message: "TokenAmount should greater than 0",
                        });
                        return false;
                      } else if (Number(value) / formValues.number <= 0.1) {
                        setError("tokenAmount", {
                          type: "custom",
                          message: "At least 0.1 for each user",
                        });
                        return false;
                      }
                    }
                    return true;
                  },
                });
                register("tokenAmountParsed");
                setValue("tokenAmount", amount);
                setValue("tokenAmountParsed", amountParsed);
                trigger(["tokenAmount", "tokenAmountParsed"]);
              }}
              tokenObj={debounceFormData.tokenObj}
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
