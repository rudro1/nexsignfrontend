import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { LayoutTemplate, Plus, Send, Loader2, Clock3, BarChart3, Upload } from 'lucide-react';

const emptySigner = { name: '', email: '' };

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [parties, setParties] = useState([{ ...emptySigner }]);
  const [ccEmails, setCcEmails] = useState('');
  const [sending, setSending] = useState(false);
  const [usage, setUsage] = useState([]);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageStatus, setUsageStatus] = useState('all');
  const [usageRangeDays, setUsageRangeDays] = useState(30);
  const [csvRows, setCsvRows] = useState([]);
  const [bulkSending, setBulkSending] = useState(false);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents/templates');
      setTemplates(res.data?.templates || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const parsedCcEmails = useMemo(
    () => ccEmails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean),
    [ccEmails]
  );

  const addSigner = () => setParties(prev => [...prev, { ...emptySigner }]);
  const removeSigner = (idx) => setParties(prev => prev.filter((_, i) => i !== idx));
  const updateSigner = (idx, key, value) => {
    setParties(prev => prev.map((p, i) => (i === idx ? { ...p, [key]: value } : p)));
  };

  const useTemplate = async () => {
    if (!selected?._id) return;
    if (!parties.length || parties.some(p => !p.name.trim() || !p.email.trim())) {
      toast.error('Please add valid signer names and emails');
      return;
    }
    setSending(true);
    try {
      const res = await api.post(`/documents/templates/${selected._id}/use`, {
        title: selected.title,
        parties: parties.map(p => ({ name: p.name.trim(), email: p.email.trim().toLowerCase() })),
        ccEmails: parsedCcEmails,
      });
      if (res.data?.success) {
        toast.success('Template sent for signature');
        setSelected(null);
        setParties([{ ...emptySigner }]);
        setCcEmails('');
        loadTemplates();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to use template');
    } finally {
      setSending(false);
    }
  };

  const loadUsage = async (templateId) => {
    if (!templateId) return;
    try {
      setUsageLoading(true);
      const res = await api.get(`/documents/templates/${templateId}/usage`);
      setUsage(res.data?.usage || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load usage history');
    } finally {
      setUsageLoading(false);
    }
  };

  const parseCsvFile = async (file) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return [];

    const [headerLine, ...rows] = lines;
    const headers = headerLine.split(',').map((h) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf('name');
    const emailIdx = headers.indexOf('email');

    if (nameIdx === -1 || emailIdx === -1) {
      throw new Error('CSV must include headers: name,email');
    }

    return rows.map((row) => {
      const cols = row.split(',').map((c) => c.trim());
      return {
        name: cols[nameIdx] || '',
        email: (cols[emailIdx] || '').toLowerCase(),
      };
    }).filter((r) => r.name && r.email);
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseCsvFile(file);
      if (!rows.length) {
        toast.error('No valid employee rows found in CSV');
        return;
      }
      setCsvRows(rows);
      toast.success(`${rows.length} employees loaded from CSV`);
    } catch (err) {
      toast.error(err.message || 'Invalid CSV format');
    } finally {
      e.target.value = '';
    }
  };

  const handleBulkSend = async () => {
    if (!selected?._id) {
      toast.error('Select a template first');
      return;
    }
    if (!csvRows.length) {
      toast.error('Upload a CSV first');
      return;
    }
    setBulkSending(true);
    try {
      const res = await api.post(`/documents/templates/${selected._id}/use-bulk`, {
        title: selected.title,
        employees: csvRows,
        ccEmails: parsedCcEmails,
      });
      if (res.data?.success) {
        toast.success(`Bulk send complete: ${res.data.created}/${res.data.total} created`);
        loadUsage(selected._id);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Bulk send failed');
    } finally {
      setBulkSending(false);
    }
  };

  const filteredUsage = useMemo(() => {
    const now = Date.now();
    const rangeMs = usageRangeDays * 24 * 60 * 60 * 1000;
    return usage.filter((u) => {
      const t = new Date(u.createdAt || u.updatedAt || 0).getTime();
      const inRange = now - t <= rangeMs;
      const statusOk = usageStatus === 'all' || u.status === usageStatus;
      return inRange && statusOk;
    });
  }, [usage, usageRangeDays, usageStatus]);

  const usageBuckets = useMemo(() => {
    const map = {};
    filteredUsage.forEach((u) => {
      const d = new Date(u.createdAt || u.updatedAt || Date.now());
      const key = d.toLocaleDateString();
      map[key] = (map[key] || 0) + 1;
    });
    const points = Object.entries(map).map(([date, count]) => ({ date, count }));
    return points.slice(-10);
  }, [filteredUsage]);

  const maxBucket = Math.max(1, ...usageBuckets.map((b) => b.count || 0));

  useEffect(() => {
    if (selected?._id) {
      loadUsage(selected._id);
    } else {
      setUsage([]);
    }
  }, [selected?._id]);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#28ABDF]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Templates</h1>
          <p className="text-sm text-slate-500">Create once, reuse for bulk signing.</p>
        </div>
        <Link to="/DocumentEditor?id=new">
          <Button className="bg-[#28ABDF] hover:bg-[#2399c8] text-white rounded-xl gap-2">
            <Plus className="w-4 h-4" /> New Template Draft
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {templates.length === 0 ? (
            <Card className="p-8 text-center sm:col-span-2">
              <LayoutTemplate className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No templates yet. Publish one from a document card.</p>
            </Card>
          ) : templates.map(tpl => (
            <Card
              key={tpl._id}
              className={`p-4 border cursor-pointer transition ${selected?._id === tpl._id ? 'border-[#28ABDF]' : 'border-slate-200'}`}
              onClick={() => setSelected(tpl)}
            >
              <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{tpl.title}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1"><Clock3 className="w-3 h-3" /> {new Date(tpl.updatedAt || tpl.createdAt).toLocaleDateString()}</span>
                <span>{tpl.usageCount || 0} uses</span>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-4 space-y-3 h-fit">
          <h2 className="font-semibold">Use Template</h2>
          {!selected ? (
            <p className="text-sm text-slate-500">Select a template from the left.</p>
          ) : (
            <>
              <p className="text-sm text-slate-700 dark:text-slate-200 truncate">Template: <strong>{selected.title}</strong></p>
              <div className="space-y-2">
                {parties.map((p, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-2">
                    <Input value={p.name} onChange={e => updateSigner(idx, 'name', e.target.value)} placeholder="Signer name" />
                    <Input value={p.email} onChange={e => updateSigner(idx, 'email', e.target.value)} placeholder="email@example.com" />
                    {parties.length > 1 && (
                      <Button variant="outline" className="col-span-2" onClick={() => removeSigner(idx)}>
                        Remove signer
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addSigner}>Add signer</Button>
              </div>
              <Input
                value={ccEmails}
                onChange={e => setCcEmails(e.target.value)}
                placeholder="CC emails (comma separated)"
              />
              <Button
                onClick={useTemplate}
                disabled={sending}
                className="w-full bg-[#28ABDF] hover:bg-[#2399c8] text-white"
              >
                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Send using template
              </Button>
            </>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold inline-flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#28ABDF]" /> Usage Analytics
            </h2>
            {usageLoading && <Loader2 className="w-4 h-4 animate-spin text-[#28ABDF]" />}
          </div>
          {!selected ? (
            <p className="text-sm text-slate-500">Select a template to view analytics.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <select
                  value={usageStatus}
                  onChange={(e) => setUsageStatus(e.target.value)}
                  className="h-9 rounded-lg border border-slate-200 px-2 text-sm bg-white"
                >
                  <option value="all">All statuses</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={usageRangeDays}
                  onChange={(e) => setUsageRangeDays(Number(e.target.value))}
                  className="h-9 rounded-lg border border-slate-200 px-2 text-sm bg-white"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>

              <div className="space-y-2">
                {usageBuckets.length === 0 ? (
                  <p className="text-sm text-slate-500">No usage data in selected filter.</p>
                ) : usageBuckets.map((b) => (
                  <div key={b.date} className="flex items-center gap-2">
                    <span className="text-xs w-20 text-slate-500">{b.date}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-[#28ABDF]"
                        style={{ width: `${(b.count / maxBucket) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-6 text-right">{b.count}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-slate-500">
                Matched records: <strong>{filteredUsage.length}</strong>
              </div>
            </>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold inline-flex items-center gap-2 mb-3">
            <Upload className="w-4 h-4 text-[#28ABDF]" /> Bulk One-to-Many Wizard (CSV)
          </h2>
          <p className="text-xs text-slate-500 mb-2">
            CSV format: <code>name,email</code> (first row must be header).
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleCsvUpload}
            className="block w-full text-sm"
          />
          <div className="mt-3 text-sm">
            Loaded employees: <strong>{csvRows.length}</strong>
          </div>
          {csvRows.length > 0 && (
            <div className="mt-2 max-h-28 overflow-auto rounded-lg border border-slate-200 p-2 text-xs text-slate-600">
              {csvRows.slice(0, 8).map((r, i) => (
                <div key={`${r.email}-${i}`}>{r.name} — {r.email}</div>
              ))}
              {csvRows.length > 8 && <div>...and {csvRows.length - 8} more</div>}
            </div>
          )}
          <Button
            onClick={handleBulkSend}
            disabled={bulkSending || !selected || !csvRows.length}
            className="w-full mt-4 bg-[#28ABDF] hover:bg-[#2399c8] text-white"
          >
            {bulkSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Send Bulk from Template
          </Button>
        </Card>
      </div>
    </div>
  );
}
