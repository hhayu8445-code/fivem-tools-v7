import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/Components/ui/button';
import { Skeleton } from '@/Components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '@/Components/LoadingSpinner';

export default function ForumCategory() {
  const { id: catId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 10;

  const { data: category } = useQuery({
    queryKey: ['category', catId],
    queryFn: async () => {
        const cats = await base44.entities.ForumCategory.list({ query: { id: catId } });
        return cats[0];
    },
    enabled: !!catId
  });

  const { data: threads, isLoading } = useQuery({
    queryKey: ['catThreads', catId, page],
    queryFn: () => base44.entities.ForumThread.list({ 
        query: { category_id: catId },
        sort: { is_pinned: -1, last_reply_date: -1 },
        limit: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE
    }),
    enabled: !!catId
  });

  if (!category) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-[0_0_30px_rgba(217,70,239,0.1)]">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">{category.name}</h1>
                <p className="text-zinc-400">{category.description}</p>
            </div>
            <Button 
                onClick={() => navigate('/community/create-thread')}
                className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-full shadow-lg shadow-fuchsia-900/20"
            >
                <img src="https://img.icons8.com/3d-fluency/94/plus.png" className="mr-2 w-4 h-4" alt="New" /> New Thread
            </Button>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            {isLoading ? (
                <div className="flex justify-center py-10">
                    <LoadingSpinner size="lg" />
                </div>
            ) : threads?.length > 0 ? (
                <div className="divide-y divide-zinc-800">
                    {threads.map(thread => (
                        <div key={thread.id} className={`p-4 transition-all flex items-center gap-4 group border-l-4 ${thread.is_pinned ? 'bg-fuchsia-950/10 border-l-fuchsia-500 hover:bg-fuchsia-900/20' : 'bg-transparent border-l-transparent hover:bg-zinc-900 hover:border-l-zinc-700'}`}>
                            <div className="flex-shrink-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${thread.is_pinned ? 'bg-fuchsia-500/10 border-fuchsia-500/50 shadow-[0_0_10px_rgba(217,70,239,0.2)]' : 'bg-zinc-800 border-zinc-700'}`}>
                                    <img src="https://img.icons8.com/3d-fluency/94/chat-message.png" className={`w-5 h-5 ${thread.is_pinned ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`} alt="Thread" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {thread.is_pinned && (
                                        <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-[10px] font-bold uppercase tracking-wide shadow-[0_0_10px_rgba(217,70,239,0.4)]">Pinned</span>
                                    )}
                                    <Link to={`/community/thread/${thread.id}`} className={`text-lg font-semibold transition-colors truncate block ${thread.is_pinned ? 'text-fuchsia-100' : 'text-zinc-200 group-hover:text-fuchsia-300'}`}>
                                        {thread.title}
                                    </Link>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-zinc-500">
                                    <span className="flex items-center gap-1 hover:text-zinc-300">
                                        <img src="https://img.icons8.com/3d-fluency/94/user-male-circle.png" className="w-3 h-3" alt="User" /> {thread.author_name}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <img src="https://img.icons8.com/3d-fluency/94/clock.png" className="w-3 h-3" alt="Time" /> Last reply {formatDistanceToNow(new Date(thread.last_reply_date || thread.created_date))} ago
                                    </span>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-6 text-sm text-zinc-500 px-4">
                                <div className="text-center min-w-[60px]">
                                    <div className="font-medium text-zinc-300">{thread.replies_count || 0}</div>
                                    <div className="text-[10px] uppercase">Replies</div>
                                </div>
                                <div className="text-center min-w-[60px]">
                                    <div className="font-medium text-zinc-300">{thread.views || 0}</div>
                                    <div className="text-[10px] uppercase">Views</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center text-zinc-500">
                    <img src="https://img.icons8.com/3d-fluency/94/chat-message.png" className="w-12 h-12 mx-auto mb-4 opacity-20" alt="Empty" />
                    <h3 className="text-lg font-medium text-zinc-400 mb-2">No threads yet</h3>
                    <p>Be the first to start a discussion in this category!</p>
                </div>
            )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2">
            <Button 
                variant="outline" 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="bg-zinc-900 border-zinc-800 text-zinc-300"
            >
                <img src="https://img.icons8.com/3d-fluency/94/back.png" className="w-4 h-4 mr-2" alt="Prev" /> Previous
            </Button>
            <Button 
                variant="outline" 
                disabled={threads?.length < PAGE_SIZE} 
                onClick={() => setPage(p => p + 1)}
                className="bg-zinc-900 border-zinc-800 text-zinc-300"
            >
                Next <img src="https://img.icons8.com/3d-fluency/94/forward.png" className="w-4 h-4 ml-2" alt="Next" />
            </Button>
        </div>
    </div>
  );
}
