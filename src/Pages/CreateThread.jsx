import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'sonner';
import LoadingOverlay from '@/Components/LoadingOverlay';
import LoginRequiredModal from '@/Components/LoginRequiredModal';
import { logToDiscord } from '@/utils';
import { validateThreadTitle, validateThreadContent, sanitizeInput, rateLimit } from '@/utils/security';

export default function CreateThread() {
  const [user, setUser] = React.useState(null);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const navigate = useNavigate();
  
  React.useEffect(() => {
      base44.auth.me().then(u => {
          if (!u) {
              setShowLoginModal(true);
              return;
          }
          setUser(u);
      }).catch(() => setShowLoginModal(true));
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    virus_scan_link: '',
    is_resource: false,
    framework: ''
  });

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showPoll, setShowPoll] = useState(false);
  const [pollData, setPollData] = useState({
      question: '',
      options: ['', '']
  });

  const { data: categories } = useQuery({
    queryKey: ['forumCategories'],
    queryFn: () => base44.entities.ForumCategory.list({ sort: { order: 1 } }),
  });

  const createThreadMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumThread.create({
        ...data,
        status: data.is_resource ? 'pending' : 'active',
        author_email: user.email,
        author_name: user.full_name || user.email.split('@')[0],
        author_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
        last_reply_date: new Date().toISOString()
    }),
    onSuccess: (newThread) => {
        if (formData.is_resource) {
            toast.success('Resource submitted for review!');
            logToDiscord('Resource Submitted', {
                type: 'thread',
                user: user.full_name || user.username,
                email: user.email,
                description: `📦 Resource submitted: ${formData.title}`,
                extra: { 'Framework': formData.framework, 'Category': formData.category_id }
            });
            navigate('/community');
        } else {
            toast.success('Thread created successfully!');
            logToDiscord('Thread Created', {
                type: 'thread',
                user: user.full_name || user.username,
                email: user.email,
                description: `📝 New thread: ${formData.title}`,
                extra: { 'Thread ID': newThread.id }
            });
            navigate(`/community/thread/${newThread.id}`);
        }
    },
    onError: () => {
        toast.error('Failed to create thread');
    }
  });

  const handleAddTag = (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && tagInput.trim()) {
          e.preventDefault();
          let newTag = tagInput.trim();
          if (!newTag.startsWith('#')) newTag = '#' + newTag;
          
          if (!tags.includes(newTag) && tags.length < 5) {
              setTags([...tags, newTag]);
          }
          setTagInput('');
      }
  };

  const removeTag = (tagToRemove) => {
      setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAddPollOption = () => {
      if (pollData.options.length < 6) {
          setPollData({ ...pollData, options: [...pollData.options, ''] });
      }
  };

  const handlePollOptionChange = (index, value) => {
      const newOptions = [...pollData.options];
      newOptions[index] = value;
      setPollData({ ...pollData, options: newOptions });
  };

  const handleRemovePollOption = (index) => {
      if (pollData.options.length > 2) {
          const newOptions = pollData.options.filter((_, i) => i !== index);
          setPollData({ ...pollData, options: newOptions });
      }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Rate limiting
    const rateLimitCheck = rateLimit(`create_thread_${user.email}`, 5, 300000);
    if (!rateLimitCheck.allowed) {
      toast.error(`Too many threads. Try again in ${Math.ceil(rateLimitCheck.retryAfter / 1000)}s`);
      return;
    }

    // Validation
    const titleValidation = validateThreadTitle(formData.title);
    if (!titleValidation.valid) {
      toast.error(titleValidation.error);
      return;
    }

    const contentValidation = validateThreadContent(formData.content);
    if (!contentValidation.valid) {
      toast.error(contentValidation.error);
      return;
    }

    if (!formData.category_id) {
        toast.error('Please select a category');
        return;
    }
    if (formData.is_resource && !formData.virus_scan_link) {
        toast.error('Virus scan link is required for resources');
        return;
    }
    if (formData.is_resource && !formData.framework) {
        toast.error('Please select a framework for your resource');
        return;
    }

    // Combine tags
    let finalTags = [...tags];
    if (formData.is_resource && formData.framework) {
        finalTags = [formData.framework, ...finalTags];
    }

    // Clean poll data
    let finalPoll = null;
    if (showPoll && pollData.question.trim()) {
        const validOptions = pollData.options.filter(o => o.trim());
        if (validOptions.length >= 2) {
            finalPoll = {
                question: pollData.question,
                options: validOptions.map(opt => ({ text: opt, votes: 0 }))
            };
        }
    }

    createThreadMutation.mutate({
        ...formData,
        tags: finalTags,
        poll_data: finalPoll
    });
  };

  if (!user) return null;

  return (
    <>
    <LoginRequiredModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        message="You must login first to create a thread"
    />
    <div className="max-w-4xl mx-auto py-10 px-4 relative">
        {createThreadMutation.isPending && <LoadingOverlay message="Creating thread..." />}
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <img src="https://img.icons8.com/3d-fluency/94/edit.png" className="w-10 h-10" alt="Create" />
                Create New Thread
            </h1>
            <p className="text-zinc-400">Share your thoughts, ask questions, or showcase your work to the community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="md:col-span-2 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Title</label>
                        <Input 
                            placeholder="Give your thread a catchy title..." 
                            className="bg-zinc-900/50 border-zinc-800 h-12 text-lg focus:border-fuchsia-500/50"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>

                    <Tabs defaultValue="write" className="w-full">
                        <TabsList className="bg-zinc-900 border border-zinc-800">
                            <TabsTrigger value="write" className="data-[state=active]:bg-fuchsia-600 data-[state=active]:text-white">Write</TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                        </TabsList>
                        <TabsContent value="write" className="mt-4">
                            <div className="bg-white text-black rounded-lg overflow-hidden border border-zinc-700">
                                <ReactQuill 
                                    theme="snow"
                                    value={formData.content}
                                    onChange={(value) => setFormData({...formData, content: value})}
                                    className="h-[400px] mb-12"
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                            [{'list': 'ordered'}, {'list': 'bullet'}],
                                            ['link', 'image', 'code-block'],
                                            ['clean']
                                        ],
                                    }}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="preview" className="mt-4">
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 min-h-[400px] prose prose-invert max-w-none">
                                <h1 className="text-2xl font-bold mb-4">{formData.title || 'Untitled Thread'}</h1>
                                <div dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-zinc-500 italic">Nothing to preview yet...</p>' }} />
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Poll Section */}
                    <div className="pt-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            className={`gap-2 ${showPoll ? 'border-fuchsia-500 text-fuchsia-400 bg-fuchsia-500/10' : 'border-zinc-800 text-zinc-400'}`}
                            onClick={() => setShowPoll(!showPoll)}
                        >
                            <img src="https://img.icons8.com/3d-fluency/94/bar-chart.png" className="w-5 h-5" alt="Poll" />
                            {showPoll ? 'Remove Poll' : 'Add Poll'}
                        </Button>

                        {showPoll && (
                            <div className="mt-4 p-6 rounded-xl bg-zinc-900/30 border border-zinc-800 space-y-4 animate-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Poll Question</label>
                                    <Input 
                                        placeholder="What do you want to ask?" 
                                        className="bg-zinc-950 border-zinc-800"
                                        value={pollData.question}
                                        onChange={(e) => setPollData({...pollData, question: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-zinc-300">Options</label>
                                    {pollData.options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <Input 
                                                placeholder={`Option ${idx + 1}`}
                                                className="bg-zinc-950 border-zinc-800"
                                                value={opt}
                                                onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                                            />
                                            {pollData.options.length > 2 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemovePollOption(idx)}>
                                                    <img src="https://img.icons8.com/3d-fluency/94/multiply.png" className="w-4 h-4 opacity-50 hover:opacity-100" alt="Remove" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {pollData.options.length < 6 && (
                                        <Button type="button" variant="ghost" size="sm" className="text-fuchsia-400 hover:text-fuchsia-300" onClick={handleAddPollOption}>
                                            <img src="https://img.icons8.com/3d-fluency/94/plus.png" className="w-4 h-4 mr-2" alt="Add" /> Add Option
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl space-y-6 sticky top-24">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Category</label>
                            <Select onValueChange={(v) => setFormData({...formData, category_id: v})}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800">
                                    {categories?.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                <img src="https://img.icons8.com/3d-fluency/94/hashtag.png" className="w-5 h-5" alt="Tags" /> Tags
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="bg-violet-500/20 text-violet-300 border-violet-500/30 pl-2 pr-1 py-1 flex items-center gap-1">
                                        {tag}
                                        <img src="https://img.icons8.com/3d-fluency/94/multiply.png" className="w-3 h-3 cursor-pointer hover:opacity-100 opacity-50" onClick={() => removeTag(tag)} alt="Remove" />
                                    </Badge>
                                ))}
                            </div>
                            <Input 
                                placeholder="Add tag and press Enter..." 
                                className="bg-zinc-950 border-zinc-800 text-sm"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                disabled={tags.length >= 5}
                            />
                            <p className="text-[10px] text-zinc-500">Max 5 tags. Start with #.</p>
                        </div>

                        <div className="pt-4 border-t border-zinc-800">
                            <div className="flex items-center space-x-2 mb-4">
                                <input 
                                    type="checkbox" 
                                    id="is_resource" 
                                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-fuchsia-600 focus:ring-fuchsia-500"
                                    checked={formData.is_resource}
                                    onChange={(e) => setFormData({...formData, is_resource: e.target.checked})}
                                />
                                <label htmlFor="is_resource" className="text-sm font-medium text-zinc-300 cursor-pointer select-none">
                                    Is this a Resource?
                                </label>
                            </div>

                            {formData.is_resource && (
                                <div className="space-y-4 animate-in slide-in-from-left-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400">Framework</label>
                                        <Select onValueChange={(v) => setFormData({...formData, framework: v})}>
                                            <SelectTrigger className="bg-zinc-950 border-zinc-800 h-9 text-sm">
                                                <SelectValue placeholder="Select framework..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                                <SelectItem value="ESX">ESX</SelectItem>
                                                <SelectItem value="QBCORE">QBCore</SelectItem>
                                                <SelectItem value="QBOX">QBox</SelectItem>
                                                <SelectItem value="STANDALONE">Standalone</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400">Virus Scan</label>
                                        <Input 
                                            placeholder="VirusTotal Link" 
                                            className="bg-zinc-950 border-zinc-800 h-9 text-sm"
                                            value={formData.virus_scan_link}
                                            onChange={e => setFormData({...formData, virus_scan_link: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-6">
                            <Button 
                                type="submit" 
                                className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold shadow-[0_0_20px_rgba(217,70,239,0.3)]"
                                disabled={createThreadMutation.isPending}
                            >
                                {createThreadMutation.isPending ? 'Publishing...' : 'Publish Thread'}
                            </Button>
                            <Button type="button" variant="ghost" className="w-full mt-2 text-zinc-500 hover:text-zinc-300" onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
    </>
  );
}
