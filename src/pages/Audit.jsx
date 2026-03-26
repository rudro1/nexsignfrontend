import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const formatTime = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function Audit() {
  const [params] = useSearchParams();
  const id = params.get('id');
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/documents/${id}/audit`);
        setAudit(res.data?.audit || null);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to load audit');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const signerRows = useMemo(() => audit?.parties || [], [audit]);
  const events = useMemo(() => audit?.events || [], [audit]);

  if (loading) {
    return <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#28ABDF]" /></div>;
  }

  if (!id || !audit) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Card className="p-8 text-center">
          <p className="text-slate-500">Audit data not found.</p>
          <Link to="/dashboard"><Button className="mt-4">Back to dashboard</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#28ABDF]" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Log</h1>
            <p className="text-sm text-slate-500">{audit.title}</p>
          </div>
        </div>
        <Link to="/dashboard"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button></Link>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Signers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">IP</th>
                <th className="py-2">Region/Postal</th>
                <th className="py-2">Signed Time</th>
              </tr>
            </thead>
            <tbody>
              {signerRows.map((p, i) => (
                <tr key={`${p.email}-${i}`} className="border-b last:border-0">
                  <td className="py-2">{p.name || '-'}</td>
                  <td className="py-2">{p.email || '-'}</td>
                  <td className="py-2">{p.signedIpAddress || p.ipAddress || '-'}</td>
                  <td className="py-2">{[p.signedLocation || p.location, p.signedPostalCode || p.postalCode].filter(Boolean).join(' / ') || '-'}</td>
                  <td className="py-2">{formatTime(p.signedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Event Timeline</h3>
        <div className="space-y-2">
          {events.length === 0 ? (
            <p className="text-sm text-slate-500">No events recorded.</p>
          ) : events.map((ev, idx) => (
            <div key={`${ev.eventType}-${idx}`} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-700">{ev.eventType}</p>
                <p className="text-xs text-slate-500">{formatTime(ev.occurredAt)}</p>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {(ev.actorName || ev.actorEmail) ? `${ev.actorName || ''} ${ev.actorEmail ? `<${ev.actorEmail}>` : ''}` : 'System'}
                {ev.ipAddress ? ` | IP: ${ev.ipAddress}` : ''}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
