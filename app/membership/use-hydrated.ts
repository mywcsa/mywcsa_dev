"use client";
import { useSyncExternalStore } from "react";
const subscribe = () => () => {};
// Keep preview submits disabled until their local preventDefault handlers exist.
export function useHydrated() { return useSyncExternalStore(subscribe, () => true, () => false); }
