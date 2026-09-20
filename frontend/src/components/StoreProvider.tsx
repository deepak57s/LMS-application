"use client";

import React, { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { hydrateAuth } from "@/store/slices/authSlice";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    store.dispatch(hydrateAuth());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
