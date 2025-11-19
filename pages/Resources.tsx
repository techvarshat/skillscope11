import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { StarIcon, EyeIcon, CodeIcon, DesignIcon, DataIcon, LoadingSpinner } from '../components/IconComponents';
import { dummyData } from '../data/dummyData';

interface Resource {
  id: string;
  title: string;
  provider: string;
  url: string;
  rating: number;
  views: number;
  category: string;
  thumbnail: string;
  summary: string;
  createdAt: string;
  unifiedScore: number;
}

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => (
    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block w-64 flex-shrink-0">
        <Card className="flex flex-col overflow-hidden h-full">
            <img src={resource.thumbnail} alt={resource.title} className="w-full h-32 object-cover" />
            <div className="p-3 flex flex-col flex-grow">
                <span className="text-xs font-semibold text-white/50 mb-1">{resource.provider.toUpperCase()}</span>
                <h3 className="font-bold text-base mb-2 text-white flex-grow">{resource.title}</h3>
                <div className="flex items-center justify-between text-xs text-white/70 mt-auto">
                    <div className="flex items-center gap-1">
                        <StarIcon className="text-yellow-400 w-4 h-4" />
                        <span>{Math.round(resource.rating)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <EyeIcon className="w-4 h-4"/>
                        <span>{resource.views}</span>
                    </div>
                </div>
            </div>
        </Card>
    </a>
);

const CategorySection: React.FC<{ title: string; icon: React.ReactNode; resources: Resource[] }> = ({ title, icon, resources }) => (
    <div className="space-y-4">
        <div className="flex items-center gap-3">
            <div className="bg-glass-bg border border-glass-border p-2 rounded-lg">{icon}</div>
            <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
            {resources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
            ))}
        </div>
    </div>
);


const Resources: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [topResources, setTopResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResources = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/search?q=javascript&max=15');
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                const allResources = data || [];
                const topRated = allResources.filter(r => r.rating >= 4.5).slice(0, 4);
                setTopResources(topRated);
                setResources(allResources);
            } catch (error) {
                console.error('Error fetching resources:', error);
                // Fallback to dummy data
                const allResources = dummyData;
                const topRated = allResources.filter(r => r.rating >= 4.5).slice(0, 4);
                setTopResources(topRated);
                setResources(allResources);
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
                <LoadingSpinner className="w-12 h-12 text-white" />
            </div>
        );
    }

    const learningResources = resources.filter(r => r.category === 'Learning');

  return (
    <div className="space-y-12">
        <h1 className="text-3xl md:text-4xl font-bold">Popular Resources</h1>

        {/* Top Section */}
        {topResources.length > 0 && (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="bg-glass-bg border border-glass-border p-2 rounded-lg">
                        <StarIcon className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Top Rated</h2>
                </div>
                <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
                    {topResources.map(resource => (
                        <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </div>
            </div>
        )}

        <CategorySection title="Learning" icon={<CodeIcon />} resources={learningResources} />
    </div>
  );
};

export default Resources;
