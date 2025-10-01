'use client';
import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Chatbot from '../../components/Chatbot';

export default function ChatbotPage() {
  return (
    <DashboardLayout userName="John Doe">
      <div className="h-full">
        <div className="bg-white rounded-lg shadow-md p-6 h-full">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">AI Chatbot</h2>
            <p className="text-gray-600">
              Connect to our AI chatbot for real-time assistance and conversations.
            </p>
          </div>
          
          <div className="h-270">
            <Chatbot />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
