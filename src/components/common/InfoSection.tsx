import React from 'react'

interface InfoSectionProps {
  title: string
  children: React.ReactNode
  gradientFrom: string
  gradientTo: string
  borderColor: string
  icon?: React.ReactNode
}

export default function InfoSection({ 
  title, 
  children, 
  gradientFrom, 
  gradientTo, 
  borderColor, 
  icon 
}: InfoSectionProps) {
  return (
    <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-6 rounded-xl border ${borderColor}`}>
      <div className="flex items-center mb-4">
        {icon && (
          <div className="w-10 h-10 bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
            {icon}
          </div>
        )}
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h4>
      </div>
      {children}
    </div>
  )
}
