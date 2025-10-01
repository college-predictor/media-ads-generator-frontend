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
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Templates</h3>
                            <p className="text-3xl font-bold text-blue-600">12</p>
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-green-900 mb-2">Active Sessions</h3>
                            <p className="text-3xl font-bold text-green-600">3</p>
                        </div>
                        
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-purple-900 mb-2">Messages Today</h3>
                            <p className="text-3xl font-bold text-purple-600">47</p>
                        </div>
                    </div>

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
