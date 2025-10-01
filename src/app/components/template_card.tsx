'use client';
import React from 'react';
import Image from 'next/image';

interface TemplateCardProps {
    id: string;
    title: string;
    description: string;
    image_url: string;
    onClick: (id: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
    id,
    title,
    description,
    image_url,
    onClick
}) => {
    return (
        <div 
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
            onClick={() => onClick(id)}
        >
            {/* Image Section */}
            <div className="relative h-48 w-full overflow-hidden">
                <Image
                    src={image_url}
                    alt={title}
                    fill
                    unoptimized
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
            
            {/* Content Section */}
            <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {description}
                </p>
                
                {/* Action Area */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200">
                        Use Template →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TemplateCard;
