import "./App.scss";
import "rsuite/dist/rsuite-no-reset.min.css";
import { ethers } from "ethers";
import { FC, memo, useState } from "react";
import { useForm } from "react-hook-form";
import { CgSpinner } from "react-icons/cg";
import { useToaster, Message } from "rsuite";

interface IFormInput {
  recipientAddress: string;
  amount: string;
}

const App: FC = () => {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<IFormInput>({
    defaultValues: {
      recipientAddress: "",
      amount: "",
    },
    mode: "onChange",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toaster = useToaster();

  const message = (header: any, message: any, type: any) => {
    return (
      <Message closable header={header} type={type}>
        {message}
      </Message>
    );
  };

  const onSubmit = async (data: IFormInput) => {
    setIsLoading(true);

    try {
      if (!ethers.utils.isAddress(data?.recipientAddress)) {
        toaster.push(message("Invalid recipient address", "", "error"), {
          duration: 3000,
          placement: "topCenter",
        });
      }

      if (!(window as any).ethereum) {
        toaster.push(message("MetaMask provider not found", "", "error"), {
          duration: 3000,
          placement: "topCenter",
        });
      }

      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );
      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();
      const transaction = await signer.sendTransaction({
        to: data?.recipientAddress,
        value: ethers.utils.parseEther(data?.amount),
      });
      await transaction.wait();

      setIsLoading(false);
      toaster.push(message("Transaction successful!", "", "success"), {
        duration: 3000,
        placement: "topCenter",
      });
      setValue("recipientAddress", "");
      setValue("amount", "");
    } catch (err) {
      setIsLoading(false);
      toaster.push(message("Transaction failed!", "", "error"), {
        duration: 3000,
        placement: "topCenter",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <span className="capitalize text-[#ffffff] text-2xl">
        transfer balance
      </span>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-y-2.5 mt-10 w-80">
          <span className="text-[#ffffff] text-sm">Recipient Address</span>
          <input
            {...register("recipientAddress", {
              required: "Please enter your recipient address",
            })}
            className={`bg-[#3c3c3c] border-2 border-solid border-[#3c3c3c] ${
              errors?.recipientAddress
                ? "focus:border-[#ce2424]"
                : "focus:border-[#18a0fb]"
            } outline-none p-2 rounded-md text-[#ffffff]`}
            onChange={(e) =>
              setValue(
                "recipientAddress",
                e.target.value.trim().replace(/\s+/g, " ")
              )
            }
            placeholder="Your recipient address"
            type="text"
          />
          {errors?.recipientAddress && (
            <span className="font-light text-[#fcb0b0] text-xs">
              {errors?.recipientAddress?.message}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-y-2.5 mb-[60px] mt-10 w-80">
          <span className="text-[#ffffff] text-sm">Amount</span>
          <input
            {...register("amount", {
              required: "Please enter your amount",
            })}
            className={`bg-[#3c3c3c] border-2 border-solid border-[#3c3c3c] ${
              errors?.amount
                ? "focus:border-[#ce2424]"
                : "focus:border-[#18a0fb]"
            } outline-none p-2 rounded-md text-[#ffffff]`}
            onChange={(e) =>
              setValue("amount", e.target.value.trim().replace(/\s+/g, " "))
            }
            placeholder="Your amount"
            type="text"
          />
          {errors?.recipientAddress && (
            <span className="font-light text-[#fcb0b0] text-xs">
              {errors?.amount?.message}
            </span>
          )}
        </div>
        <button
          className={`${
            isLoading ? "pointer-events-none" : "cursor-pointer"
          } bg-[#3e95f4] p-2.5 rounded w-full`}
        >
          {isLoading ? (
            <div className="flex gap-2.5 items-center justify-center">
              <CgSpinner className="animate-spin" color="#ffffff" />
              <span className="animate-pulse font-medium text-[#ffffff] text-lg">
                Please wait...
              </span>
            </div>
          ) : (
            <span className="font-medium text-[#ffffff] text-lg">Transfer</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default memo(App);
