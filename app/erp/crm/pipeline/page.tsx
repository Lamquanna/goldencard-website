'use client';

import React, { useState, useCallback } from 'react';
import {
  LayoutGrid,
  List,
  Plus,
  Filter,
  Search,
  Download,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Components
import { PipelineKanban } from '@/app/erp/modules/crm/components/PipelineKanban';
import { LeadTable } from '@/app/erp/modules/crm/components/LeadTable';

// Types & Config
import type { Lead, LeadStatus, LeadSource } from '@/app/erp/modules/crm';
import { LEAD_STATUS_CONFIG, LEAD_SOURCE_CONFIG, calculateLeadScore, getLeadRating } from '@/app/erp/modules/crm';

// Mock data
const generateMockLeads = (): Lead[] => {
  const names = [
    'Nguyá»…n VÄƒn An', 'Tráº§n Thá»‹ BÃ¬nh', 'LÃª Minh CÆ°á»ng', 'Pháº¡m Thu Dung',
    'HoÃ ng VÄƒn Em', 'VÅ© Thá»‹ PhÆ°Æ¡ng', 'Äáº·ng Quá»‘c Giang', 'BÃ¹i Thá»‹ Háº¡nh',
    'NgÃ´ Äá»©c Ãch', 'Äinh VÄƒn KhÃ¡nh', 'LÃ½ Thá»‹ Lan', 'Mai VÄƒn Minh',
  ];
  const companies = [
    'ABC Corporation', 'XYZ Trading', 'Tech Solutions', 'Vietnam Solar',
    'Green Energy', 'Sunrise Inc', 'Power Systems', 'Eco Factory',
  ];
  const sources: LeadSource[] = ['website', 'referral', 'social_media', 'cold_call', 'exhibition', 'partner'];
  const statuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation'];

  return names.map((name, i) => {
    const lead: Lead = {
      id: `lead-${i + 1}`,
      workspaceId: 'ws-1',
      name,
      email: `${name.toLowerCase().replace(/\s/g, '.')}@example.com`,
      phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
      company: companies[i % companies.length],
      position: ['CEO', 'CTO', 'Manager', 'Director'][i % 4],
      source: sources[i % sources.length],
      status: statuses[i % statuses.length],
      score: 0,
      rating: 'cold',
      budget: Math.floor(50000000 + Math.random() * 450000000),
      notes: '',
      tags: ['solar', 'commercial'][i % 2] ? [['solar', 'commercial'][i % 2]] : [],
      customFields: {},
      assignedToId: i % 3 === 0 ? 'user-1' : undefined,
      createdById: 'user-1',
      lastContactAt: i % 2 === 0 ? new Date(Date.now() - Math.random() * 604800000) : undefined,
      nextFollowUp: i % 3 === 0 ? new Date(Date.now() + Math.random() * 604800000) : undefined,
      createdAt: new Date(Date.now() - Math.random() * 2592000000),
      updatedAt: new Date(),
    };
    
    lead.score = calculateLeadScore(lead);
    lead.rating = getLeadRating(lead.score);
    
    return lead;
  });
};

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>(generateMockLeads());
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addToStatus, setAddToStatus] = useState<LeadStatus>('new');

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    source: 'website' as LeadSource,
    budget: '',
    notes: '',
  });

  const handleLeadMove = useCallback(async (leadId: string, newStatus: LeadStatus) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus, updatedAt: new Date() } : lead
      )
    );
    
    setIsLoading(false);
  }, []);

  const handleLeadClick = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
  }, []);

  const handleLeadEdit = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    // Open edit dialog
  }, []);

  const handleLeadDelete = useCallback((leadId: string) => {
    if (confirm('Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a lead nÃ y?')) {
      setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
    }
  }, []);

  const handleLeadsDelete = useCallback((leadIds: string[]) => {
    if (confirm(`Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a ${leadIds.length} lead?`)) {
      setLeads((prev) => prev.filter((lead) => !leadIds.includes(lead.id)));
    }
  }, []);

  const handleLeadAssign = useCallback((leadId: string, userId: string) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, assignedToId: userId, updatedAt: new Date() } : lead
      )
    );
  }, []);

  const handleLeadsAssign = useCallback((leadIds: string[], userId: string) => {
    setLeads((prev) =>
      prev.map((lead) =>
        leadIds.includes(lead.id) ? { ...lead, assignedToId: userId, updatedAt: new Date() } : lead
      )
    );
  }, []);

  const handleStatusChange = useCallback((leadId: string, status: LeadStatus) => {
    handleLeadMove(leadId, status);
  }, [handleLeadMove]);

  const handleAddLead = useCallback((status: LeadStatus) => {
    setAddToStatus(status);
    setIsAddDialogOpen(true);
  }, []);

  const handleCreateLead = useCallback(() => {
    const lead: Lead = {
      id: `lead-${Date.now()}`,
      workspaceId: 'ws-1',
      name: newLead.name,
      email: newLead.email || undefined,
      phone: newLead.phone || undefined,
      company: newLead.company || undefined,
      position: newLead.position || undefined,
      source: newLead.source,
      status: addToStatus,
      score: 0,
      rating: 'cold',
      budget: newLead.budget ? parseFloat(newLead.budget) : undefined,
      notes: newLead.notes || undefined,
      tags: [],
      customFields: {},
      createdById: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    lead.score = calculateLeadScore(lead);
    lead.rating = getLeadRating(lead.score);
    
    setLeads((prev) => [lead, ...prev]);
    setIsAddDialogOpen(false);
    setNewLead({
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      source: 'website',
      budget: '',
      notes: '',
    });
  }, [newLead, addToStatus]);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLeads(generateMockLeads());
    setIsLoading(false);
  }, []);

  const handleExport = useCallback((leadIds?: string[]) => {
    const exportLeads = leadIds
      ? leads.filter((lead) => leadIds.includes(lead.id))
      : leads;
    
    // Convert to CSV
    const headers = ['TÃªn', 'Email', 'SÄT', 'CÃ´ng ty', 'Tráº¡ng thÃ¡i', 'Score', 'Budget', 'NgÃ y táº¡o'];
    const rows = exportLeads.map((lead) => [
      lead.name,
      lead.email || '',
      lead.phone || '',
      lead.company || '',
      lead.status,
      lead.score.toString(),
      lead.budget?.toString() || '',
      lead.createdAt.toISOString(),
    ]);
    
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [leads]);

  const handleImport = useCallback(() => {
    // Open file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Handle file import
        console.log('Import file:', file.name);
      }
    };
    input.click();
  }, []);

  // Filter leads by search
  const filteredLeads = searchQuery
    ? leads.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : leads;

  const mockUsers = [
    { id: 'user-1', name: 'Nguyá»…n Sale A' },
    { id: 'user-2', name: 'Tráº§n Sale B' },
    { id: 'user-3', name: 'LÃª Manager C' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Sales Pipeline</h1>
            <p className="text-gray-500">Quáº£n lÃ½ leads theo giai Ä‘oáº¡n bÃ¡n hÃ ng</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="TÃ¬m kiáº¿m..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Refresh */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
            
            {/* Add Lead */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setAddToStatus('new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  ThÃªm Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>ThÃªm Lead má»›i</DialogTitle>
                  <DialogDescription>
                    Nháº­p thÃ´ng tin khÃ¡ch hÃ ng tiá»m nÄƒng má»›i
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">TÃªn *</Label>
                    <Input
                      id="name"
                      value={newLead.name}
                      onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                      placeholder="Nguyá»…n VÄƒn A"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newLead.email}
                        onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                        placeholder="email@company.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Sá»‘ Ä‘iá»‡n thoáº¡i</Label>
                      <Input
                        id="phone"
                        value={newLead.phone}
                        onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                        placeholder="0901234567"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="company">CÃ´ng ty</Label>
                      <Input
                        id="company"
                        value={newLead.company}
                        onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                        placeholder="ABC Corp"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="position">Chá»©c vá»¥</Label>
                      <Input
                        id="position"
                        value={newLead.position}
                        onChange={(e) => setNewLead({ ...newLead, position: e.target.value })}
                        placeholder="GiÃ¡m Ä‘á»‘c"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="source">Nguá»“n</Label>
                      <Select
                        value={newLead.source}
                        onValueChange={(value) => setNewLead({ ...newLead, source: value as LeadSource })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_SOURCE_CONFIG.map((source) => (
                            <SelectItem key={source.id} value={source.id}>
                              {source.nameVi}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="budget">Budget (VND)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={newLead.budget}
                        onChange={(e) => setNewLead({ ...newLead, budget: e.target.value })}
                        placeholder="100000000"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Ghi chÃº</Label>
                    <Textarea
                      id="notes"
                      value={newLead.notes}
                      onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                      placeholder="ThÃ´ng tin thÃªm vá» khÃ¡ch hÃ ng..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Há»§y
                  </Button>
                  <Button onClick={handleCreateLead} disabled={!newLead.name}>
                    Táº¡o Lead
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-6">
        {viewMode === 'kanban' ? (
          <div className="h-full overflow-x-auto">
            <PipelineKanban
              leads={filteredLeads}
              onLeadMove={handleLeadMove}
              onLeadClick={handleLeadClick}
              onLeadEdit={handleLeadEdit}
              onLeadDelete={handleLeadDelete}
              onAddLead={handleAddLead}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <LeadTable
            leads={filteredLeads}
            onLeadClick={handleLeadClick}
            onLeadEdit={handleLeadEdit}
            onLeadDelete={handleLeadDelete}
            onLeadsDelete={handleLeadsDelete}
            onLeadAssign={handleLeadAssign}
            onLeadsAssign={handleLeadsAssign}
            onStatusChange={handleStatusChange}
            onExport={handleExport}
            onImport={handleImport}
            onAddLead={() => handleAddLead('new')}
            onRefresh={handleRefresh}
            isLoading={isLoading}
            users={mockUsers}
          />
        )}
      </div>

      {/* Lead Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedLead?.name}</SheetTitle>
            <SheetDescription>
              {selectedLead?.company && `${selectedLead.company}`}
              {selectedLead?.position && ` â€¢ ${selectedLead.position}`}
            </SheetDescription>
          </SheetHeader>
          {selectedLead && (
            <div className="mt-6 space-y-6">
              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-500">ThÃ´ng tin liÃªn há»‡</h4>
                {selectedLead.email && (
                  <p className="text-sm">{selectedLead.email}</p>
                )}
                {selectedLead.phone && (
                  <p className="text-sm">{selectedLead.phone}</p>
                )}
              </div>

              {/* Status & Score */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-500">Tráº¡ng thÃ¡i</h4>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Giai Ä‘oáº¡n:</span>
                    <span className="ml-2 font-medium">
                      {LEAD_STATUS_CONFIG.find((s) => s.id === selectedLead.status)?.nameVi}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Score:</span>
                    <span className="ml-2 font-medium">{selectedLead.score}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Rating:</span>
                    <span className="ml-2 font-medium capitalize">{selectedLead.rating}</span>
                  </div>
                </div>
              </div>

              {/* Budget */}
              {selectedLead.budget && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-500">Budget</h4>
                  <p className="text-lg font-medium text-green-600">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      maximumFractionDigits: 0,
                    }).format(selectedLead.budget)}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedLead.notes && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-500">Ghi chÃº</h4>
                  <p className="text-sm">{selectedLead.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1">Gá»i Ä‘iá»‡n</Button>
                <Button variant="outline" className="flex-1">Gá»­i email</Button>
                <Button variant="outline" className="flex-1">Táº¡o task</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
