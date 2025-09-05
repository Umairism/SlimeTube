import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface BreadcrumbProps {
  customPath?: { label: string; path: string }[];
  showBackButton?: boolean;
  backPath?: string;
}

export function Breadcrumb({ customPath, showBackButton = false, backPath }: BreadcrumbProps) {
  const location = useLocation();
  
  const generateBreadcrumbs = () => {
    if (customPath) return customPath;
    
    const pathnames = location.pathname.split('/').filter(x => x);
    
    const breadcrumbs = [{ label: 'Home', path: '/' }];
    
    let currentPath = '';
    pathnames.forEach((pathname, index) => {
      currentPath += `/${pathname}`;
      
      let label = pathname.charAt(0).toUpperCase() + pathname.slice(1);
      if (pathname === 'video' && index < pathnames.length - 1) {
        label = 'Watch';
      }
      
      breadcrumbs.push({
        label,
        path: currentPath
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1 && !showBackButton) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border-b border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center space-x-2">
          {showBackButton && (
            <Link
              to={backPath || '/'}
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back</span>
            </Link>
          )}
          
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.path} className="flex items-center space-x-2">
              {index === breadcrumbs.length - 1 ? (
                <span className="text-red-400 text-sm font-medium">{breadcrumb.label}</span>
              ) : (
                <>
                  <Link
                    to={breadcrumb.path}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {breadcrumb.label}
                  </Link>
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}