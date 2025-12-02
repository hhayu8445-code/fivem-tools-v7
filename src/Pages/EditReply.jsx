import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions, canEdit } from '@/hooks/usePermissions';
import LoadingSpinner from '@/Components/LoadingSpinner';
import RichTextEditor from '@/Components/RichTextEditor';
import EditFormCard from '@/Components/EditFormCard';
import FormActions from '@/Components/FormActions';

export default function EditReply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const permissions = usePermissions(user?.email);
  const [reply, setReply] = useState(null);
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
        const replies = await base44.entities.ForumReply.list({ query: { id } });
        const replyData = replies[0];
        
        if (!replyData) {
          toast.error('Reply not found');
          navigate('/community');
          return;
        }

        if (!canEdit(replyData, user, permissions)) {
          toast.error('You can only edit your own replies');
          navigate(`/community/thread/${replyData.thread_id}`);
          return;
        }

        setReply(replyData);
        setContent(replyData.content);
      } catch (error) {
        console.error('Error loading reply:', error);
        toast.error('Failed to load reply');
        navigate('/community');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, user, authLoading, permissions]);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    setSaving(true);
    try {
      await base44.entities.ForumReply.update(id, {
        content: content.trim(),
        updated_date: new Date().toISOString()
      });
      toast.success('Reply updated successfully');
      navigate(`/community/thread/${reply.thread_id}`);
    } catch (error) {
      console.error('Error updating reply:', error);
      toast.error('Failed to update reply');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || permissions.loading || loading) {
    return <LoadingSpinner />;
  }

  return (
    <EditFormCard title="Edit Reply">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Content</label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>
      <FormActions
        onSave={handleSave}
        onCancel={() => navigate(`/community/thread/${reply.thread_id}`)}
        saving={saving}
      />
    </EditFormCard>
  );
}
