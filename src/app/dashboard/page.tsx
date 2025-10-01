'use client';
import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

export default function Dashboard() {
    const [response, setResponse] = useState<string | null>(null);

    const handleTestApi = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, { method: 'GET' });
            const data = await res.text();
            setResponse(data);
        } catch (error) {
            setResponse('Error calling API');
        }
    };

    return (
        <DashboardLayout userName="John Doe">
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-blue-900 mb-4">Dashboard Overview</h2>
                    <p className="text-gray-600 mb-6">Welcome to your dashboard. Here you can manage your templates and interact with the chatbot.</p>
                    <button
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={handleTestApi}
                    >
                        Test API Connection
                    </button>
                    
                    {response && (
                        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <strong className="text-gray-700">API Response:</strong>
                            <p className="text-gray-600 mt-1">{response}</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
