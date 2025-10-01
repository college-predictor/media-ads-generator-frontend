'use client';
import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: Date;
  content: string;
}

export default function TemplatesPage() {
  const [templates] = useState<Template[]>([
    {
      id: '1',
      name: 'Welcome Email',
      description: 'A warm welcome email template for new users',
      category: 'Email',
      createdAt: new Date('2024-01-15'),
      content: 'Welcome to our platform! We\'re excited to have you on board...'
    },
    {
      id: '2',
      name: 'Product Launch',
      description: 'Template for announcing new product launches',
      category: 'Marketing',
      createdAt: new Date('2024-01-10'),
      content: 'Exciting news! We\'re thrilled to announce the launch of our latest product...'
    },
    {
      id: '3',
      name: 'Meeting Notes',
      description: 'Standard template for meeting documentation',
      category: 'Business',
      createdAt: new Date('2024-01-08'),
      content: 'Meeting Date: [DATE]\nAttendees: [NAMES]\nAgenda Items:\n1. ...'
    },
    {
      id: '4',
      name: 'Support Response',
      description: 'Customer support response template',
      category: 'Support',
      createdAt: new Date('2024-01-05'),
      content: 'Thank you for contacting our support team. We have received your inquiry...'
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <DashboardLayout userName="John Doe">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Saved Templates</h2>
          <p className="text-gray-600 mb-6">
            Manage and organize your saved templates for quick access.
          </p>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              New Template
            </button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => (
              <span
                key={category}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Templates List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Template Library</h3>
            <div className="space-y-4">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{template.name}</h4>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <p className="text-xs text-gray-500">
                    Created: {template.createdAt.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Template Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Template Preview</h3>
            {selectedTemplate ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{selectedTemplate.name}</h4>
                  <p className="text-sm text-gray-600 mb-4">{selectedTemplate.description}</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h5 className="font-medium text-gray-700 mb-2">Content:</h5>
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                    {selectedTemplate.content}
                  </pre>
                </div>

                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    Edit Template
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                    Use Template
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200">
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Select a template to preview its content</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
