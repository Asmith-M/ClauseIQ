import React from "react";

export function Card({ className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl border bg-white dark:bg-gray-800 shadow-sm ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }) {
  return (
    <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${className}`} {...props} />
  );
}

export function CardTitle({ className = "", ...props }) {
  return (
    <h2 className={`text-xl font-bold ${className}`} {...props} />
  );
}

export function CardContent({ className = "", ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props} />
  );
}
