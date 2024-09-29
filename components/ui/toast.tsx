"use client"

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { Toast } from "@/app/dashboard/types";

interface ToastContextType {
  toast: (data: Toast) => void;
}
const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [toastData, setToastData] = React.useState({
    title: "",
    description: "",
    variant: "default",
  });

  const toast = ({ title, description, variant = "default" }: { title: string; description: string; variant?: string }) => {
    setToastData({ title, description, variant });
    setOpen(true);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastPrimitive.Provider swipeDirection="right">
        <ToastPrimitive.Root open={open} onOpenChange={setOpen} className={`toast ${toastData.variant}`}>
          <ToastPrimitive.Title className="font-bold">{toastData.title}</ToastPrimitive.Title>
          <ToastPrimitive.Description>{toastData.description}</ToastPrimitive.Description>
        </ToastPrimitive.Root>
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 m-4" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
