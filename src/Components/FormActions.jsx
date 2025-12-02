import React from 'react';
import { Button } from '@/Components/ui/button';

export default function FormActions({ 
  onSave, 
  onCancel, 
  saving = false, 
  saveText = 'Save Changes',
  savingText = 'Saving...' 
}) {
  return (
    <div className="flex gap-2 pt-4">
      <Button 
        onClick={onSave} 
        disabled={saving} 
        className="bg-fuchsia-600 hover:bg-fuchsia-700"
      >
        {saving ? savingText : saveText}
      </Button>
      <Button 
        onClick={onCancel} 
        variant="outline" 
        className="border-zinc-700 text-zinc-300"
      >
        Cancel
      </Button>
    </div>
  );
}
