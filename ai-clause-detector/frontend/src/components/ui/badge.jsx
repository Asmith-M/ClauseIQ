import React from "react";
import PropTypes from "prop-types";

export function Badge({ className = "", variant = "default", children, ...props }) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none";
  const variants = {
    default: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    secondary: "bg-gray-100 text-gray-800 dark:bg-gray-700/80 dark:text-gray-200",
    outline:
      "border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white",
  };
  return (
    <span
      role="status"
      className={`${base} ${variants[variant] || variants.default} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(["default", "secondary", "outline"]),
  children: PropTypes.node,
};
