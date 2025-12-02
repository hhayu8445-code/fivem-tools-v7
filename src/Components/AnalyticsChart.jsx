import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

export function DownloadChart({ data }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Downloads Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" stroke="#71717a" />
            <YAxis stroke="#71717a" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
              labelStyle={{ color: '#a1a1aa' }}
            />
            <Line type="monotone" dataKey="downloads" stroke="#8b5cf6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function CategoryChart({ data }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Popular Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="category" stroke="#71717a" />
            <YAxis stroke="#71717a" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
              labelStyle={{ color: '#a1a1aa' }}
            />
            <Bar dataKey="count" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function StatsCard({ title, value, icon, trend }) {
  const isIconUrl = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('/'));
  
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            {trend && (
              <p className={`text-sm mt-2 flex items-center gap-1 ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                <img 
                  src={trend > 0 ? 'https://img.icons8.com/3d-fluency/94/arrow-up.png' : 'https://img.icons8.com/3d-fluency/94/arrow-down.png'} 
                  className="w-4 h-4" 
                  alt="" 
                />
                {Math.abs(trend)}% from last week
              </p>
            )}
          </div>
          <div>
            {isIconUrl ? (
              <img src={icon} className="w-12 h-12" alt="" />
            ) : (
              <div className="text-4xl">{icon}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
