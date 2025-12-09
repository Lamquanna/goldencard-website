// ============================================================================
// DEVELOPER DEBUG PANEL - NETWORK TAB COMPONENT
// GoldenEnergy HOME Platform - Network Request Viewer
// ============================================================================

'use client';

import React, { useState, useMemo } from 'react';
import { useDebugStore } from '../store';
import type { NetworkRequest, RequestStatus } from '../types';

// ============================================================================
// STATUS BADGE
// ============================================================================

interface StatusBadgeProps {
  status: RequestStatus;
  statusCode?: number;
}

function StatusBadge({ status, statusCode }: StatusBadgeProps) {
  const colorMap: Record<RequestStatus, string> = {
    pending: 'bg-yellow-500 text-black',
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    cancelled: 'bg-gray-500 text-white',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorMap[status]}`}>
      {statusCode || status}
    </span>
  );
}

// ============================================================================
// METHOD BADGE
// ============================================================================

interface MethodBadgeProps {
  method: string;
}

function MethodBadge({ method }: MethodBadgeProps) {
  const colorMap: Record<string, string> = {
    GET: 'text-green-400',
    POST: 'text-blue-400',
    PUT: 'text-orange-400',
    PATCH: 'text-yellow-400',
    DELETE: 'text-red-400',
  };

  return (
    <span className={`font-mono text-xs font-bold ${colorMap[method] || 'text-gray-400'}`}>
      {method}
    </span>
  );
}

// ============================================================================
// REQUEST ROW COMPONENT
// ============================================================================

interface RequestRowProps {
  request: NetworkRequest;
  isSelected: boolean;
  onSelect: () => void;
}

function RequestRow({ request, isSelected, onSelect }: RequestRowProps) {
  const formatDuration = (ms?: number) => {
    if (ms === undefined) return '...';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return '-';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const urlPath = new URL(request.url, 'http://localhost').pathname;

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 px-3 py-2 border-b border-gray-700 cursor-pointer hover:bg-gray-800 ${
        isSelected ? 'bg-blue-900/30' : ''
      } ${request.status === 'error' ? 'bg-red-900/20' : ''}`}
    >
      <StatusBadge status={request.status} statusCode={request.statusCode} />
      <MethodBadge method={request.method} />
      <span className="flex-1 text-sm text-gray-200 truncate" title={request.url}>
        {urlPath}
      </span>
      <span className="text-xs text-gray-500 w-16 text-right">
        {formatDuration(request.duration)}
      </span>
      <span className="text-xs text-gray-500 w-16 text-right">
        {formatSize(request.size)}
      </span>
    </div>
  );
}

// ============================================================================
// REQUEST DETAIL COMPONENT
// ============================================================================

interface RequestDetailProps {
  request: NetworkRequest;
}

function RequestDetail({ request }: RequestDetailProps) {
  const [activeTab, setActiveTab] = useState<'headers' | 'request' | 'response'>('headers');

  return (
    <div className="flex flex-col h-full border-l border-gray-700">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2 mb-1">
          <MethodBadge method={request.method} />
          <StatusBadge status={request.status} statusCode={request.statusCode} />
        </div>
        <div className="text-xs text-gray-400 truncate" title={request.url}>
          {request.url}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {(['headers', 'request', 'response'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        {activeTab === 'headers' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-medium text-gray-400 mb-2">Request Headers</h4>
              {request.requestHeaders ? (
                <div className="space-y-1">
                  {Object.entries(request.requestHeaders).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="text-cyan-400">{key}:</span>{' '}
                      <span className="text-gray-300">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-500">No headers captured</span>
              )}
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-400 mb-2">Response Headers</h4>
              {request.responseHeaders ? (
                <div className="space-y-1">
                  {Object.entries(request.responseHeaders).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="text-cyan-400">{key}:</span>{' '}
                      <span className="text-gray-300">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-500">No headers captured</span>
              )}
            </div>
          </div>
        )}

        {activeTab === 'request' && (
          <div>
            {request.requestBody ? (
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                {JSON.stringify(request.requestBody, null, 2)}
              </pre>
            ) : (
              <span className="text-xs text-gray-500">No request body</span>
            )}
          </div>
        )}

        {activeTab === 'response' && (
          <div>
            {request.error ? (
              <div className="text-xs text-red-400">{request.error}</div>
            ) : request.responseBody ? (
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                {JSON.stringify(request.responseBody, null, 2)}
              </pre>
            ) : (
              <span className="text-xs text-gray-500">No response body</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// NETWORK TAB COMPONENT
// ============================================================================

export function NetworkTab() {
  const requests = useDebugStore((state) => state.requests);
  const clearRequests = useDebugStore((state) => state.clearRequests);

  // Compute requests by status in useMemo
  const requestsByStatus = useMemo(() => ({
    pending: requests.filter((r) => r.status === 'pending'),
    success: requests.filter((r) => r.status === 'success'),
    error: requests.filter((r) => r.status === 'error'),
  }), [requests]);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  const selectedRequest = useMemo(
    () => requests.find((r) => r.id === selectedId),
    [requests, selectedId]
  );

  return (
    <div className="flex h-full bg-gray-900">
      {/* Request list */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center gap-1">
            {(['all', 'pending', 'success', 'error'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2 py-1 text-xs rounded ${
                  statusFilter === status
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {status === 'all' ? 'All' : status} (
                {status === 'all'
                  ? requests.length
                  : status === 'pending'
                    ? requestsByStatus.pending.length
                    : status === 'success'
                      ? requestsByStatus.success.length
                      : requestsByStatus.error.length}
                )
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <button
            onClick={clearRequests}
            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
          >
            Clear
          </button>
        </div>

        {/* Request list */}
        <div className="flex-1 overflow-auto">
          {filteredRequests.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              No requests captured
            </div>
          ) : (
            filteredRequests.map((request) => (
              <RequestRow
                key={request.id}
                request={request}
                isSelected={request.id === selectedId}
                onSelect={() => setSelectedId(request.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Request detail */}
      {selectedRequest && (
        <div className="w-96">
          <RequestDetail request={selectedRequest} />
        </div>
      )}
    </div>
  );
}

export default NetworkTab;
