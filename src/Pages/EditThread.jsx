import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Input } from '@/Components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions, canEdit } from '@/hooks/usePermissions';
import LoadingSpinner from '@/Components/LoadingSpinner';
import RichTextEditor from '@/Components/RichTextEditor';
import EditFormCard from '@/Components/EditFormCard';
import FormActions from '@/Components/FormActions';

export default function EditThread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const permissions = usePermissions(user?.email);
  const [thread, setThread] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading || permissions.loading) return;
    
    if (!user) {
      toast.error('Please login first');
      navigate('/community');
      return;
    }

    const load = async () => {
      try {
        const threads = await base44.entities.ForumThread.list({ query: { id } });
        const threadData = threads[0];
        
        if (!threadData) {
          toast.error('Thread not found');
          navigate('/community');
          return;
        }

        if (!canEdit(threadData, user, permissions)) {
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
  }, [id, navigate, user, authLoading, permissions]);

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

  if (authLoading || permissions.loading || loading) {
    return <LoadingSpinner />;
  }

  return (
    <EditFormCard title="Edit Thread">
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
        <RichTextEditor value={content} onChange={setContent} />
      </div>
      <FormActions
        onSave={handleSave}
        onCancel={() => navigate(`/community/thread/${id}`)}
        saving={saving}
      />
    </EditFormCard>
  );
}
