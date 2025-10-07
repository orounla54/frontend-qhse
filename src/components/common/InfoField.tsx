import React from 'react'

interface InfoFieldProps {
  label: string
  value: string | React.ReactNode
  className?: string
}

export default function InfoField({ label, value, className = "" }: InfoFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="text-sm text-gray-900 dark:text-white mt-1">{value}</div>
    </div>
  )
}
