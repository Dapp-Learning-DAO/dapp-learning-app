"use client";
// @ts-ignore
import jazzicon from "@metamask/jazzicon";
import React, { forwardRef, useEffect, useState } from "react";

const JazziconAvatar = forwardRef(
  (
    {
      address,
      diameter = 16,
    }: {
      address: `0x${string}` | string;
      diameter?: number;
    },
    ref: any,
  ) => {
    const [avatarId] = useState(
      `wallet_avatar_${Math.floor(Math.random() * 100)}`,
    );
    useEffect(() => {
      // console.warn(ref, address)

      if (address) {
        const avatar = document.querySelector(`#${avatarId}`) as HTMLDivElement;
        avatar.innerHTML = "";
        const seed = parseInt(address.slice(2, 10), 16);
        const icon = jazzicon(diameter, seed);
        avatar.appendChild(icon);
      }
    }, [address, diameter, avatarId]);

    return <div ref={ref} id={avatarId} className="w-full h-full"></div>;
  },
);
JazziconAvatar.displayName = "JazziconAvatar";

export default JazziconAvatar;
