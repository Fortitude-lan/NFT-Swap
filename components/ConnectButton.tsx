"use client";

// import { HoveredLi, Menu, MenuItem, ProductItem } from "./ui/navbar-menu";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet-box";

import { useSubstrateContext } from "@/app/SubstrateProvider";
import {
  web3Enable,
  web3Accounts,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import {
  InjectedExtension,
  InjectedAccount,
} from "@polkadot/extension-inject/types";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";

const RPC_URL = "ws://127.0.0.1:9944";

const ConnectButton = () => {
  // State management
  const [active, setActive] = useState<string | null>(null);

  const [accountBal, setAccountBal] = useState<string>("");
  const [accounts, setaccounts] = useState<InjectedAccount[]>([]);
  const [accountAddr, setAccountAddr] = useState<string>("");
  const [buttonText, setButtonText] = useState<string>("Connect");
  const [isConnect, setisConnect] = useState<boolean>(false);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const {
    api,
    setApi,
    setInjector,
    allAccounts,
    setAllAccounts,
    setExtensionEnabled,
  } = useSubstrateContext();

  useEffect(() => {
    console.log(accounts, "accounts");
    console.log(active, "active");
  }, [active, setActive, setaccounts]);

  // Initialize connection
  const initConnection = async () => {
    const provider = new WsProvider(RPC_URL);
    const _api = await ApiPromise.create({ provider, types: {} });
    return _api;
  };

  // Handle account retrieval
  const fetchAccounts = async (extensions: any[]): Promise<any[]> => {
    console.log("before keyring");
    const keyring = new Keyring({ type: "sr25519" });
    if (extensions.length === 0) {
      return [keyring.addFromUri("//Alice")];
    } else {
      console.log("get accounts");
      const allAcc = await web3Accounts();
      console.log(allAcc);
      setaccounts(allAcc);
      return allAcc.length > 0 ? allAcc : [keyring.addFromUri("//Alice")];
    }
  };

  // Handle account balance retrieval
  const fetchBalance = async (
    account: string,
    _api: ApiPromise
  ): Promise<string> => {
    const accountInfo = await _api.query.system.account(account);
    // 使用类型断言
    const balanceData = accountInfo as unknown as { data: { free: any } };
    // 返回余额
    return balanceData.data.free.toString();
  };

  // Main connection logic
  const handleConnect = async () => {
    if (buttonText === "Connect" && !api) {
      const _api = await initConnection();
      console.log("api", _api);

      const extensions = await web3Enable("nft swap");
      console.log("extensions", extensions);

      if (extensions.length === 0) {
        alert("请安装 Polkadot.js 扩展！");
        return;
      }

      let curAllAccounts = await fetchAccounts(extensions);

      const bal = await fetchBalance(curAllAccounts[0].address, _api);

      setAllAccounts(curAllAccounts);
      setApi(_api);
      setButtonText("Disconnect");
      setisConnect(true);
      setAccountBal(bal.toString());
      setAccountAddr(curAllAccounts[0].address);
      setDropdownVisible(true);
      console.log(curAllAccounts);

      if (extensions.length > 0) {
        const _injector = await web3FromAddress(curAllAccounts[0].address);
        console.log(_injector);
        setInjector(_injector);
        setExtensionEnabled(true);
      } else {
        setExtensionEnabled(false);
      }
    } else if (buttonText === "Disconnect") {
      setAllAccounts([]);
      setApi(undefined);
      setButtonText("Connect");
      setisConnect(false);
      setAccountBal("");
      setAccountAddr("");
      setDropdownVisible(false);
    }
  };
  // Shorten account address
  const displayAddress = (address: string) => {
    return address ? (
      <>
        <span className="text-purple-200">Ox:</span>
        {address.slice(0, 6)}...{address.slice(-4)}
      </>
    ) : (
      ""
    );
  };

  return (
    <div>
      <Menu setActive={setActive} setDropdownVisible={setDropdownVisible}>
        <MenuItem
          setActive={setActive}
          active={active}
          isConnect={isConnect}
          dropdownVisible={dropdownVisible}
          setDropdownVisible={setDropdownVisible}
          item="Connect"
          title={!isConnect ? "Connect" : displayAddress(accountAddr)}
          //   item={!isConnect ? "Connect" : displayAddress(accountAddr)}
          handleConnect={handleConnect}
        >
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLi>Switch Account</HoveredLi>
            <HoveredLi onClick={() => handleConnect()}>
              <span className="text-red-400 hover:font-semibold ">
                Discount
              </span>{" "}
            </HoveredLi>
          </div>
        </MenuItem>
      </Menu>
      {/* <Sheet>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Are you absolutely sure?</SheetTitle>
            <SheetDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet> */}
    </div>
  );
};

export default ConnectButton;

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const Menu = ({
  setDropdownVisible,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
  setDropdownVisible: (item: boolean) => void;
}) => {
  return (
    <nav
      onMouseLeave={() => setDropdownVisible(false)} // resets the state
      className="relativeflex justify-center space-x-4 px-8 py-6 "
    >
      {children}
    </nav>
  );
};

export const MenuItem = ({
  handleConnect,
  active,
  title,
  isConnect,
  item,
  children,
  dropdownVisible,
  setDropdownVisible,
}: {
  setActive: (item: string) => void;
  handleConnect: () => void;
  active: string | null;
  title: React.ReactNode;
  item: string;
  isConnect: boolean;
  dropdownVisible: boolean;
  setDropdownVisible: (item: boolean) => void;
  children?: React.ReactNode;
}) => {
  return (
    <div
      onClick={() => {
        handleConnect();
      }}
      onMouseEnter={() => {
        console.log("MenuItem", active);
        if (isConnect) {
          setDropdownVisible(true);
        } else {
          setDropdownVisible(false);
        }
      }}
      className="relative "
    >
      <motion.p
        transition={{ duration: 0.3 }}
        // className="cursor-pointer text-black hover:opacity-[0.9] dark:text-white"
        className="cursor-pointer shadow-[0_0_0_3px_#000000_inset] bg-transparent border border-black dark:border-white dark:text-white text-black rounded-2xl font-bold transform hover:-translate-y-1 transition duration-400 px-6 py-2"
      >
        {title}
      </motion.p>
      {dropdownVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {isConnect && (
            <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={transition}
                layoutId="active" // layoutId ensures smooth animation
                className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
              >
                <motion.div
                  layout // layout ensures smooth animation
                  className="w-max h-full p-4"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const HoveredLi = ({ children, ...rest }: any) => {
  return (
    <p
      className="text-neutral-200 dark:text-neutral-200 hover:text-purple-200 hover:font-semibold cursor-pointer"
      {...rest}
    >
      {children}
    </p>
  );
};
