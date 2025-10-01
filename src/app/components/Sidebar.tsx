'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Simple SVG Icons
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const DocumentTextIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChatBubbleLeftRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const Sidebar = () => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'home' },
    { name: 'Templates', href: '/dashboard/templates', icon: 'document' },
    { name: 'Chatbot', href: '/dashboard/chatbot', icon: 'chat' },
  ];

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'home':
        return <HomeIcon />;
      case 'document':
        return <DocumentTextIcon />;
      case 'chat':
        return <ChatBubbleLeftRightIcon />;
      default:
        return <HomeIcon />;
    }
  };

  return (
    <div className="w-64 bg-blue-900 min-h-screen text-white">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-100">Dashboard</h2>
      </div>
      
      <nav className="mt-8">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-6 py-3 text-left w-full transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-700 border-r-4 border-blue-300 text-blue-100'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <span className="mr-3">{getIcon(item.icon)}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Saved Templates Section */}
      <div className="mt-8 px-6">
        <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-3">
          Saved Templates
        </h3>
        <div className="space-y-2">
          {['Template 1', 'Template 2', 'Template 3'].map((template, index) => (
            <Link
              key={index}
              href={`/dashboard/templates/${template.toLowerCase().replace(' ', '-')}`}
              className="block px-3 py-2 text-sm text-blue-200 hover:text-white hover:bg-blue-800 rounded transition-colors duration-200"
            >
              {template}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;