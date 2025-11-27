"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Lead, LeadEvent, LeadStatus, LeadEventType } from "@/lib/types/crm";

interface LeadView {
  id: string;
  lead_id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  viewed_at: string;
  page_url: string;
  device_type?: string;
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [views, setViews] = useState<LeadView[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    fetchLeadDetail();
    trackView();
  }, [params.id]);

  const trackView = async () => {
    try {
      await fetch(`/api/erp/leads/${params.id}/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_url: window.location.href,
          device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop",
        }),
      });
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const fetchLeadDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/erp/leads/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setLead(data.lead);
        setEvents(data.events || []);
        setViews(data.views || []);
      } else if (res.status === 401) {
        router.push("/auth/signin");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: LeadStatus) => {
    if (!lead) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/erp/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchLeadDetail();
      }
    } catch (error) {
      console.error("Error updating:", error);
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async () => {
    if (!lead || !noteText.trim()) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/erp/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: lead.id,
          event_type: "note_added" as LeadEventType,
          description: noteText,
        }),
      });
      if (res.ok) {
        setNoteText("");
        setShowNoteForm(false);
        await fetchLeadDetail();
      }
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setUpdating(false);
    }
  };

  const statusColors = {
    new: "from-blue-500 to-blue-600",
    in_progress: "from-yellow-500 to-yellow-600",
    done: "from-green-500 to-green-600",
    overdue: "from-red-500 to-red-600",
    archived: "from-gray-500 to-gray-600",
  };

  const eventIcons: Record<LeadEventType, string> = {
    created: "🎉",
    assigned: "👤",
    status_changed: "🔄",
    note_added: "📝",
    call_made: "📞",
    email_sent: "✉️",
    meeting_scheduled: "📅",
    other: "📌",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <div className="text-2xl text-gray-700 mb-4">Lead not found</div>
          <Link
            href="/erp"
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 inline-block"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/erp"
            className="text-blue-500 hover:text-blue-700 font-medium inline-flex items-center mb-4"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Lead Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Lead Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Info Card */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{lead.name}</h2>
                  <div className="flex items-center gap-3 text-gray-600">
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="hover:text-blue-500">
                        📞 {lead.phone}
                      </a>
                    )}
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="hover:text-blue-500">
                        ✉️ {lead.email}
                      </a>
                    )}
                  </div>
                </div>
                <span
                  className={`px-4 py-2 rounded-xl text-white font-semibold bg-gradient-to-r ${
                    statusColors[lead.status]
                  }`}
                >
                  {lead.status}
                </span>
              </div>

              {lead.message && (
                <div className="p-4 bg-gray-50 rounded-xl mb-6">
                  <div className="text-sm text-gray-500 mb-1">Message:</div>
                  <div className="text-gray-800">{lead.message}</div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                {(["new", "in_progress", "done", "overdue"] as LeadStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    disabled={updating || lead.status === status}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      lead.status === status
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {status === lead.status && "✓ "}
                    {status.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Timeline</h3>
                <button
                  onClick={() => setShowNoteForm(!showNoteForm)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  {showNoteForm ? "Cancel" : "+ Add Note"}
                </button>
              </div>

              {/* Add Note Form */}
              {showNoteForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-6"
                >
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter your note..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                  <button
                    onClick={addNote}
                    disabled={updating || !noteText.trim()}
                    className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? "Saving..." : "Save Note"}
                  </button>
                </motion.div>
              )}

              {/* Events List */}
              <div className="space-y-4">
                {events.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No events yet</div>
                ) : (
                  events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4 p-4 bg-white/50 rounded-xl border border-gray-100"
                    >
                      <div className="text-2xl">{eventIcons[event.event_type]}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{event.description}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {event.user?.full_name || "System"} •{" "}
                          {new Date(event.created_at).toLocaleString()}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Meta Info */}
          <div className="space-y-6">
            {/* Source Info */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Source Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Source</div>
                  <div className="font-medium text-gray-900 capitalize">{lead.source}</div>
                </div>
                {lead.source_url && (
                  <div>
                    <div className="text-gray-500 mb-1">Source URL</div>
                    <div className="text-gray-700 text-xs break-all">{lead.source_url}</div>
                  </div>
                )}
                {lead.device_type && (
                  <div>
                    <div className="text-gray-500 mb-1">Device</div>
                    <div className="font-medium text-gray-900 capitalize">{lead.device_type}</div>
                  </div>
                )}
                {lead.locale && (
                  <div>
                    <div className="text-gray-500 mb-1">Locale</div>
                    <div className="font-medium text-gray-900 uppercase">{lead.locale}</div>
                  </div>
                )}
              </div>
            </div>

            {/* UTM Info */}
            {(lead.utm_source || lead.utm_medium || lead.utm_campaign) && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">UTM Parameters</h3>
                <div className="space-y-3 text-sm">
                  {lead.utm_source && (
                    <div>
                      <div className="text-gray-500 mb-1">Source</div>
                      <div className="font-medium text-gray-900">{lead.utm_source}</div>
                    </div>
                  )}
                  {lead.utm_medium && (
                    <div>
                      <div className="text-gray-500 mb-1">Medium</div>
                      <div className="font-medium text-gray-900">{lead.utm_medium}</div>
                    </div>
                  )}
                  {lead.utm_campaign && (
                    <div>
                      <div className="text-gray-500 mb-1">Campaign</div>
                      <div className="font-medium text-gray-900">{lead.utm_campaign}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View History - Who Viewed This Lead */}
            {views && views.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  👁️ View History
                  <span className="text-sm font-normal text-gray-500">
                    ({views.length} {views.length === 1 ? "view" : "views"})
                  </span>
                </h3>
                <div className="space-y-3">
                  {views.map((view, index) => (
                    <motion.div
                      key={view.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 bg-white/50 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">
                            {view.employee_name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {view.employee_email}
                          </div>
                          {view.device_type && (
                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              {view.device_type === "mobile" ? "📱" : "💻"} {view.device_type}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 text-right whitespace-nowrap">
                          {new Date(view.viewed_at).toLocaleDateString("vi-VN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      {view.page_url && (
                        <div className="text-xs text-gray-400 mt-2 truncate" title={view.page_url}>
                          📍 {view.page_url}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Timestamps</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Created</div>
                  <div className="font-medium text-gray-900">
                    {new Date(lead.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Last Activity</div>
                  <div className="font-medium text-gray-900">
                    {new Date(lead.last_activity).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </div>
  );
}
