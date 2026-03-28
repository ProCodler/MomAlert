'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Users, Clock, Filter } from 'lucide-react';
import Link from 'next/link';

interface Session {
  id: string;
  sessionCode: string;
  riskLevel: string;
  flagged: boolean;
  language: string;
  createdAt: string;
  updatedAt: string;
}

const RISK_COLORS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800 border-green-300',
  MEDIUM: 'bg-amber-100 text-amber-800 border-amber-300',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
  CRITICAL: 'bg-red-100 text-red-900 border-red-400',
  UNKNOWN: 'bg-gray-100 text-gray-600 border-gray-200',
};

const RISK_EMOJI: Record<string, string> = {
  LOW: '✅',
  MEDIUM: '⚠️',
  HIGH: '🔶',
  CRITICAL: '🚨',
  UNKNOWN: '❓',
};

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchSessions = async (f: string) => {
    setLoading(true);
    const url = f === 'all' ? '/api/sessions' : `/api/sessions?filter=${f}`;
    const res = await fetch(url);
    const data = await res.json();
    setSessions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions(filter);
    const interval = setInterval(() => fetchSessions(filter), 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const stats = {
    total: sessions.length,
    critical: sessions.filter((s) => s.riskLevel === 'CRITICAL').length,
    high: sessions.filter((s) => s.riskLevel === 'HIGH').length,
    flagged: sessions.filter((s) => s.flagged).length,
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen" style={{ background: '#F5F0EB' }}>
      {/* Header */}
      <header className="px-6 py-4 shadow-sm" style={{ background: '#1B4B8A' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/80 hover:text-white text-sm">
              ← Back
            </Link>
            <div className="w-px h-5 bg-white/30" />
            <span className="text-xl">🏥</span>
            <div>
              <h1 className="text-white font-bold text-xl leading-none">CHW Dashboard</h1>
              <p className="text-white/70 text-xs">Community Health Worker Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/80 text-xs">Live • Auto-refresh 30s</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-blue-500" />
              <span className="text-xs text-gray-500">Total Sessions</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">🚨</span>
              <span className="text-xs text-gray-500">Critical</span>
            </div>
            <p className="text-2xl font-bold text-red-700">{stats.critical}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">🔶</span>
              <span className="text-xs text-gray-500">High Risk</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={16} className="text-amber-500" />
              <span className="text-xs text-gray-500">Flagged</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.flagged}</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <Filter size={16} className="text-gray-400 flex-shrink-0" />
          {['all', 'urgent', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'flagged'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                filter === f
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
              style={filter === f ? { background: '#1B4B8A' } : {}}
            >
              {f === 'all'
                ? 'All Sessions'
                : f === 'urgent'
                  ? '🚨 Urgent'
                  : f === 'flagged'
                    ? '⚑ Flagged'
                    : f}
            </button>
          ))}
        </div>

        {/* Sessions Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <span className="text-4xl">📋</span>
            <p className="text-gray-500 mt-3">No sessions found</p>
            <Link
              href="/chat"
              className="inline-block mt-4 px-6 py-2 rounded-lg text-white text-sm"
              style={{ background: '#1B4B8A' }}
            >
              Start a New Assessment
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs text-gray-500 font-medium">
                    Session ID
                  </th>
                  <th className="text-left px-6 py-3 text-xs text-gray-500 font-medium">
                    Risk Level
                  </th>
                  <th className="text-left px-6 py-3 text-xs text-gray-500 font-medium hidden md:table-cell">
                    Language
                  </th>
                  <th className="text-left px-6 py-3 text-xs text-gray-500 font-medium hidden md:table-cell">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs text-gray-500 font-medium">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${session.riskLevel === 'CRITICAL' ? 'bg-red-50/50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-600">
                        #{session.sessionCode.slice(-8)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${RISK_COLORS[session.riskLevel] || RISK_COLORS.UNKNOWN} ${session.riskLevel === 'CRITICAL' ? 'animate-pulse' : ''}`}
                      >
                        {RISK_EMOJI[session.riskLevel] || '❓'} {session.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-500">
                        {session.language === 'tw' ? '🇬🇭 Twi' : '🇬🇧 English'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {session.flagged && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          <AlertTriangle size={10} />
                          Flagged
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={12} />
                        {formatTime(session.updatedAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
