// components/UI/MobileAlert.jsx - Mobile-friendly alert component

import React from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

const MobileAlert = ({ type = 'info', title, message, isOpen, onClose, actions = [] }) => {
  if (!isOpen) return null;

  const typeConfig = {
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      textColor: 'text-red-800'
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      textColor: 'text-green-800'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      textColor: 'text-blue-800'
    }
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
        <div className={`${config.bgColor} ${config.borderColor} border-b p-4 rounded-t-xl`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <IconComponent size={24} className={`${config.iconColor} flex-shrink-0 mt-0.5`} />
              <div className="flex-1">
                {title && (
                  <h3 className={`font-semibold ${config.titleColor} mb-1`}>
                    {title}
                  </h3>
                )}
                <p className={`text-sm ${config.textColor} whitespace-pre-line`}>
                  {message}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {actions.length > 0 && (
          <div className="p-4 space-y-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  if (action.closeOnClick !== false) onClose();
                }}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${action.variant === 'primary' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
        
        {actions.length === 0 && (
          <div className="p-4">
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileAlert;