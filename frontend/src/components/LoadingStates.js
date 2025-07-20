import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

// Basic loading spinner
export const LoadingSpinner = ({ size = "default", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
    </div>
  );
};

// Full page loading
export const FullPageLoading = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

// Content loading with skeleton
export const ContentLoading = ({ message = "Loading content..." }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <LoadingSpinner size="sm" />
        <span className="text-sm text-gray-600">{message}</span>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
};

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-24" />
          ))}
        </div>
      ))}
    </div>
  );
};

// Card skeleton
export const CardSkeleton = ({ count = 1 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Stats card skeleton
export const StatsCardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Form skeleton
export const FormSkeleton = ({ fields = 4 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex space-x-2 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
};

// List skeleton
export const ListSkeleton = ({ items = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
};

// Chart skeleton
export const ChartSkeleton = ({ height = 300 }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div 
        className="bg-gray-100 rounded-lg flex items-end justify-around p-4"
        style={{ height: `${height}px` }}
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <Skeleton 
              className="w-8 bg-gray-300 rounded-t"
              style={{ height: `${Math.random() * 80 + 20}%` }}
            />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Error retry component
export const ErrorRetry = ({ 
  error, 
  onRetry, 
  message = "Something went wrong",
  showDetails = false 
}) => {
  return (
    <div className="text-center py-8">
      <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <RefreshCw className="w-6 h-6 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
      {showDetails && error && (
        <p className="text-sm text-gray-600 mb-4">{error}</p>
      )}
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </button>
    </div>
  );
};

// Loading overlay
export const LoadingOverlay = ({ 
  isLoading, 
  children, 
  message = "Loading...",
  blur = false 
}) => {
  if (!isLoading) return children;

  return (
    <div className="relative">
      {children}
      <div className={`absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 ${blur ? 'backdrop-blur-sm' : ''}`}>
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-2" />
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Progressive loading
export const ProgressiveLoading = ({ 
  isLoading, 
  error, 
  isEmpty, 
  emptyMessage = "No data available",
  children,
  skeleton: SkeletonComponent,
  onRetry 
}) => {
  if (isLoading) {
    return SkeletonComponent || <ContentLoading />;
  }

  if (error) {
    return (
      <ErrorRetry 
        error={error} 
        onRetry={onRetry}
        message="Failed to load data"
      />
    );
  }

  if (isEmpty) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return children;
};

// Loading button
export const LoadingButton = ({ 
  loading, 
  children, 
  disabled,
  className = "",
  ...props 
}) => {
  return (
    <button
      disabled={loading || disabled}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
};

export default LoadingSpinner; 