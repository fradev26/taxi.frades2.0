import React from 'react';
import { Wallet, RefreshCw } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { cn } from '@/lib/utils';

interface WalletBalanceProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showRefresh?: boolean;
  className?: string;
  onClick?: () => void;
}

export function WalletBalance({ 
  size = 'md', 
  showIcon = true, 
  showRefresh = false,
  className,
  onClick 
}: WalletBalanceProps) {
  const { balance, isLoading, isRefreshing, formatBalance, refreshBalance } = useWallet();

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {showIcon && (
          <Wallet className={cn(iconSizeClasses[size], 'text-muted-foreground')} />
        )}
        <div className={cn('animate-pulse bg-muted rounded h-4 w-16', sizeClasses[size])} />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'flex items-center gap-2 transition-colors',
        onClick && 'cursor-pointer hover:text-primary',
        className
      )}
      onClick={onClick}
    >
      {showIcon && (
        <Wallet className={cn(iconSizeClasses[size], 'text-green-600')} />
      )}
      <span className={cn(sizeClasses[size], 'font-medium text-green-600')}>
        {formatBalance()}
      </span>
      {showRefresh && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            refreshBalance();
          }}
          disabled={isRefreshing}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <RefreshCw 
            className={cn(
              'w-3 h-3 text-muted-foreground',
              isRefreshing && 'animate-spin'
            )} 
          />
        </button>
      )}
    </div>
  );
}

// Compact version for dropdown menus
export function CompactWalletBalance({ className }: { className?: string }) {
  return <WalletBalance size="sm" showIcon={true} className={className} />;
}

// Large version for wallet page header
export function LargeWalletBalance({ 
  className, 
  showRefresh = true 
}: { 
  className?: string; 
  showRefresh?: boolean; 
}) {
  return (
    <WalletBalance 
      size="lg" 
      showIcon={true} 
      showRefresh={showRefresh}
      className={className} 
    />
  );
}