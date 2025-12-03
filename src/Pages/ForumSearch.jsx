import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Checkbox } from '@/Components/ui/checkbox';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { forumManagement } from '@/utils/forumManagement';

export default function ForumSearch() {
    const [query, setQuery] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const { data: categories } = useQuery({
        queryKey: ['forumCategories'],
        queryFn: () => base44.entities.ForumCategory.list({ sort: { order: 1 } }),
    });

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);

        // Use centralized forum management for advanced search
        const filters = {
            category_id: category !== 'all' ? category : undefined,
            sort_by: 'relevance',
            limit: 100
        };

        // Handle date range filter
        if (dateRange !== 'all') {
            filters.date_range = dateRange;
        }

        // Add author filter if provided
        if (author) {
            filters.author_search = author;
        }

        const filtered = await forumManagement.searchThreads(query || '', filters);
        setResults(filtered);
        setIsSearching(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Advanced Forum Search</h1>
                <p className="text-zinc-400">Find exactly what you're looking for across the community.</p>
            </div>

            <form onSubmit={handleSearch} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <img src="https://img.icons8.com/3d-fluency/94/search.png" className="w-4 h-4" alt="Search" /> Keywords
                        </label>
                        <Input
                            placeholder="Search titles and content..."
                            className="bg-zinc-950 border-zinc-800"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <img src="https://img.icons8.com/3d-fluency/94/user-male-circle.png" className="w-4 h-4" alt="User" /> Author
                        </label>
                        <Input
                            placeholder="Username..."
                            className="bg-zinc-950 border-zinc-800"
                            value={author}
                            onChange={e => setAuthor(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <img src="https://img.icons8.com/3d-fluency/94/hashtag.png" className="w-4 h-4" alt="Category" /> Category
                        </label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories?.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                            <img src="https://img.icons8.com/3d-fluency/94/calendar.png" className="w-4 h-4" alt="Date" /> Date Range
                        </label>
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                <SelectValue placeholder="Any Time" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="all">Any Time</SelectItem>
                                <SelectItem value="today">Past 24 Hours</SelectItem>
                                <SelectItem value="week">Past Week</SelectItem>
                                <SelectItem value="month">Past Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                    <Button type="submit" className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white h-12 text-lg" disabled={isSearching}>
                        {isSearching ? "Searching..." : "Search Forums"}
                    </Button>
                </div>
            </form>

            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <img src="https://img.icons8.com/3d-fluency/94/filter.png" className="w-5 h-5" alt="Filter" /> Results ({results.length})
                </h2>

                {results.length > 0 ? (
                    <div className="grid gap-4">
                        {results.map(thread => (
                            <Link key={thread.id} to={`/community/thread/${thread.id}`} className="block group">
                                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl hover:bg-zinc-900 hover:border-fuchsia-500/30 transition-all">
                                    <h3 className="text-lg font-bold text-zinc-200 group-hover:text-fuchsia-400 mb-1">
                                        {thread.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                                        <span className="flex items-center gap-1">
                                            <img src="https://img.icons8.com/3d-fluency/94/user-male-circle.png" className="w-3 h-3" alt="User" /> {thread.author_name}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <img src="https://img.icons8.com/3d-fluency/94/calendar.png" className="w-3 h-3" alt="Date" /> {formatDistanceToNow(new Date(thread.created_date))} ago
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                        No results found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
}
