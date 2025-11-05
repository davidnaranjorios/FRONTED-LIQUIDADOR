
import React from 'react';

interface ExplanationCardProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({ title, icon, children }) => {
    return (
        <div className="bg-gray-50/80 border border-gray-200/80 rounded-lg p-5 mb-6">
            <div className="flex items-center gap-3 mb-3">
                {icon && <div className="text-indigo-600">{icon}</div>}
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            </div>
            <div className="text-gray-600 space-y-3 leading-relaxed">
                {children}
            </div>
        </div>
    );
};

export const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <pre className="bg-gray-900 text-white font-mono text-sm p-4 rounded-md overflow-x-auto">
            <code>{children}</code>
        </pre>
    )
}
