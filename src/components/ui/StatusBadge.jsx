import React from 'react';
import { 
  FaFire, 
  FaSnowflake, 
  FaCalendarAlt, 
  FaEye, 
  FaCheckCircle, 
  FaClock,
  FaTimesCircle,
  FaQuestionCircle,
  FaSun,
  FaBolt,
  FaFlag
} from 'react-icons/fa';

const StatusBadge = ({ 
  status, 
  size = 'md',
  showIcon = true,
  showLabel = true,
  onClick,
  className = ''
}) => {
  const statusConfig = {
    new: {
      label: 'New Lead',
      icon: '🆕',
      color: 'blue',
      description: 'Fresh lead, not contacted yet'
    },
    active: {
      label: 'Active/Interested',
      icon: '⚡',
      color: 'green',
      description: 'Actively interested in property'
    },
    hot: {
      label: 'Hot Lead',
      icon: '🔥',
      color: 'red',
      description: 'High probability of conversion'
    },
    warm: {
      label: 'Warm Lead',
      icon: '🌤️',
      color: 'orange',
      description: 'Moderate interest, needs follow-up'
    },
    cold: {
      label: 'Cold Lead',
      icon: '❄️',
      color: 'cyan',
      description: 'Low interest, needs nurturing'
    },
    followup: {
      label: 'Follow-up Required',
      icon: '📅',
      color: 'indigo',
      description: 'Scheduled for follow-up'
    },
    visited: {
      label: 'Site Visited',
      icon: '👀',
      color: 'purple',
      description: 'Property visit completed'
    },
    booked: {
      label: 'Booked',
      icon: '✅',
      color: 'emerald',
      description: 'Booking confirmed'
    },
    inactive: {
      label: 'Inactive/Not Interested',
      icon: '⏸️',
      color: 'gray',
      description: 'Not interested at the moment'
    },
    closed: {
      label: 'Closed Deal',
      icon: '🏁',
      color: 'gray',
      description: 'Deal successfully closed'
    }
  };

  const config = statusConfig[status] || statusConfig.new;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border border-blue-200',
    green: 'bg-green-100 text-green-800 border border-green-200',
    red: 'bg-red-100 text-red-800 border border-red-200',
    orange: 'bg-orange-100 text-orange-800 border border-orange-200',
    cyan: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    indigo: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    purple: 'bg-purple-100 text-purple-800 border border-purple-200',
    emerald: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    gray: 'bg-gray-100 text-gray-800 border border-gray-200'
  };
  
  const iconSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const badgeContent = (
    <div className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} ${colorClasses[config.color]} ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} ${className}`}>
      {showIcon && <span className={iconSize[size]}>{config.icon}</span>}
      {showLabel && <span>{config.label}</span>}
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded-full"
        title={config.description}
      >
        {badgeContent}
      </button>
    );
  }

  return (
    <div title={config.description}>
      {badgeContent}
    </div>
  );
};

// Helper function to get status color
StatusBadge.getStatusColor = (status) => {
  const colors = {
    new: 'blue',
    active: 'green',
    hot: 'red',
    warm: 'orange',
    cold: 'cyan',
    followup: 'indigo',
    visited: 'purple',
    booked: 'emerald',
    inactive: 'gray',
    closed: 'gray'
  };
  return colors[status] || 'gray';
};

// Helper function to get status icon
StatusBadge.getStatusIcon = (status) => {
  const icons = {
    new: '🆕',
    active: '⚡',
    hot: '🔥',
    warm: '🌤️',
    cold: '❄️',
    followup: '📅',
    visited: '👀',
    booked: '✅',
    inactive: '⏸️',
    closed: '🏁'
  };
  return icons[status] || '📋';
};

// Helper function to get status label
StatusBadge.getStatusLabel = (status) => {
  const labels = {
    new: 'New Lead',
    active: 'Active/Interested',
    hot: 'Hot Lead',
    warm: 'Warm Lead',
    cold: 'Cold Lead',
    followup: 'Follow-up Required',
    visited: 'Site Visited',
    booked: 'Booked',
    inactive: 'Inactive/Not Interested',
    closed: 'Closed Deal'
  };
  return labels[status] || 'Unknown';
};

export default StatusBadge;