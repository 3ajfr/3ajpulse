"use client";

import { ReactNode } from "react";

interface ConfirmFormProps {
  message: string;
  action: () => void | Promise<void>;
  children: ReactNode;
  className?: string;
}

export function ConfirmForm({
  message,
  action,
  children,
  className,
}: ConfirmFormProps) {
  return (
    <form
      className={className}
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(message)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}
