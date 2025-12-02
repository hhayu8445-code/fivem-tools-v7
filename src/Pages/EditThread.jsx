import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function EditThread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [thread, setThread] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          toast.error('Please login first');
          navigate('/community');
          return;
        }
        setUser(currentUser);

        const threads = await base44.entities.ForumThread.list({ query: { id } });
        const threadData = threads[0];
        
        if (!threadData) {
          toast.error('Thread not found');
          navigate('/community');
          return;
        }

        const profiles = await base44.entities.UserProfile.list({ query: { user_email: currentUser.email } });
        const isAdmin = profiles[0]?.membership_tier === 'admin';
        const isMod = profiles[0]?.membership_tier === 'moderator';

        if (threadData.author_email !== currentUser.email && !isAdmin && !isMod) {
          toast.error('You can only edit your own threads');
          navigate(`/community/thread/${id}`);
          return;
        }

        setThread(threadData);
        setTitle(threadData.title);
        setContent(threadData.content);
      } catch (error) {
        console.error('Error loading thread:', error);
        toast.error('Failed to load thread');
        navigate('/community');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setSaving(true);
    try {
      await base44.entities.ForumThread.update(id, {
        title: title.trim(),
        content: content.trim(),
        updated_date: new Date().toISOString()
      });
      toast.success('Thread updated successfully');
      navigate(`/community/thread/${id}`);
    } catch (error) {
      console.error('Error updating thread:', error);
      toast.error('Failed to update thread');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Edit Thread</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-950 border-zinc-700 text-zinc-300"
              placeholder="Thread title..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Content</label>
            <div className="bg-white rounded-lg overflow-hidden">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                className="h-[300px] mb-12"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={saving} className="bg-fuchsia-600 hover:bg-fuchsia-700">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button onClick={() => navigate(`/community/thread/${id}`)} variant="outline" className="border-zinc-700 text-zinc-300">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
