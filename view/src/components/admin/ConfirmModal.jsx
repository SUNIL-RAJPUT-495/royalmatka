import React from 'react';
import { FaExclamationTriangle, FaTrashAlt, FaInfoCircle } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

export const ConfirmModal = ({
  isOpen,
  title = 'Are you sure?',
  message = 'Do you really want to perform this action? This cannot be undone.',
  onConfirm,
  onCancel,
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  type = 'danger' // 'danger' | 'warning' | 'info'
}) => {
  if (!isOpen) return null;

  // Icon and color mappings based on type
  let icon = <FaExclamationTriangle className="text-amber-500" size={24} />;
  let iconBg = 'bg-amber-50 border-amber-100';
  let confirmBtnBg = 'bg-amber-600 hover:bg-amber-700';

  if (type === 'danger') {
    icon = <FaTrashAlt className="text-red-650" size={22} />;
    iconBg = 'bg-red-50 border-red-100';
    confirmBtnBg = 'bg-red-600 hover:bg-red-700';
  } else if (type === 'info') {
    icon = <FaInfoCircle className="text-blue-500" size={24} />;
    iconBg = 'bg-blue-50 border-blue-100';
    confirmBtnBg = 'bg-blue-600 hover:bg-blue-700';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none font-sans">
      
      {/* Modal Box */}
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative border border-gray-150 animate-scale-up p-5 space-y-4">
        
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 active:scale-95 transition-all cursor-pointer"
        >
          <IoClose size={18} />
        </button>

        {/* Warning Icon Container */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className={`w-14 h-14 rounded-2xl border ${iconBg} flex items-center justify-center shadow-2xs`}>
            {icon}
          </div>
          
          {/* Header Title */}
          <h3 className="text-sm font-bold text-gray-900 tracking-tight uppercase">
            {title}
          </h3>
          
          {/* Warning Message Description */}
          <p className="text-xs font-semibold text-gray-500 leading-relaxed max-w-[280px]">
            {message}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2">
          {/* Cancel */}
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 font-bold text-xs tracking-wider py-3 rounded-2xl hover:bg-gray-50 cursor-pointer active:scale-95 transition-all text-center uppercase"
          >
            {cancelText}
          </button>
          
          {/* Confirm */}
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 text-white font-bold text-xs tracking-wider py-3 rounded-2xl shadow-md ${confirmBtnBg} cursor-pointer active:scale-95 transition-all text-center uppercase`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;
