import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

export default function EditFormCard({ title, children }) {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
