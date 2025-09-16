import React from "react";
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

const BtnElvarra = ({
  children,
  onClick,
  disabled = false,
  className = "",
}: ButtonProps) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl   disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
};

export default BtnElvarra;
