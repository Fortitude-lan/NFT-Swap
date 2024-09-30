"use client";

import React, { useState } from "react";
import { web3Enable, web3FromSource } from "@polkadot/extension-dapp";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

const ConnectButton = () => {
  return (
    <div>
      <button className="shadow-[0_0_0_3px_#000000_inset] px-6 py-2 bg-transparent border border-black dark:border-white dark:text-white text-black rounded-2xl font-bold transform hover:-translate-y-1 transition duration-400">
        Connect
      </button>
    </div>
  );
};

export default ConnectButton;
