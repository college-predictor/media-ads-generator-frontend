'use client';
import React from 'react';
import Image from 'next/image';

interface FinalTemplateCardProps {
    title: string;
    description: string;
    image_url: string; // base64 PNG string format: "data:image/png;base64,{image_data}"
    caption: string;
    tags: string[];
}

const FinalTemplateCard: React.FC<FinalTemplateCardProps> = ({
    title,
    description,
    image_url,
    caption,
    tags
}) => {
    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 max-w-2xl flex items-center">
            {/* Image Section */}
            <div className="relative h-48 w-48 flex-shrink-0 overflow-hidden">
            <Image
            src={image_url}
            alt={title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="192px"
            />
            </div>
            
            {/* Content Section */}
            <div className="p-6 flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {title}
            </h3>
            
            {/* Description */}
            <p className="text-gray-600 text-base mb-3 line-clamp-2">
            {description}
            </p>
            
            {/* Caption */}
            <p className="text-gray-500 text-sm mb-4 italic line-clamp-1">
            {caption}
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 3).map((tag, index) => (
            <span
                key={index}
                className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full"
            >
                {tag}
            </span>
            ))}
            {tags.length > 3 && (
            <span className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full">
                +{tags.length - 3}
            </span>
            )}
            </div>
            </div>
        </div>
    );
};

export default FinalTemplateCard;
