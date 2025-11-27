'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { LeadQualification, QualificationScore } from '@/lib/types/project';
import type { Lead } from '@/lib/types/crm';

interface LeadQualificationPanelProps {
  lead: Lead;
  qualification?: LeadQualification;
  onSave: (qualification: Partial<LeadQualification>) => void;
  onClose: () => void;
}

const CRITERIA_INFO = {
  budget: {
    label: 'Ngân sách (Budget)',
    icon: '💰',
    description: 'Khách hàng có đủ ngân sách để triển khai dự án?',
    scores: {
      1: 'Không có ngân sách',
      2: 'Ngân sách rất hạn chế',
      3: 'Ngân sách vừa phải',
      4: 'Ngân sách tốt',
      5: 'Ngân sách rất tốt',
    }
  },
  authority: {
    label: 'Quyền quyết định (Authority)',
    icon: '👤',
    description: 'Khách hàng có quyền quyết định mua hàng?',
    scores: {
      1: 'Không có quyền',
      2: 'Người ảnh hưởng',
      3: 'Người tham gia quyết định',
      4: 'Người đồng quyết định',
      5: 'Người quyết định chính',
    }
  },
  need: {
    label: 'Nhu cầu (Need)',
    icon: '🎯',
    description: 'Mức độ cần thiết của giải pháp cho khách hàng?',
    scores: {
      1: 'Không cần thiết',
      2: 'Nice to have',
      3: 'Cần thiết',
      4: 'Rất cần thiết',
      5: 'Cấp bách',
    }
  },
  timeline: {
    label: 'Thời gian (Timeline)',
    icon: '⏰',
    description: 'Khách hàng muốn triển khai khi nào?',
    scores: {
      1: 'Chưa xác định',
      2: '> 12 tháng',
      3: '6-12 tháng',
      4: '3-6 tháng',
      5: '< 3 tháng',
    }
  },
};

type CriteriaKey = keyof typeof CRITERIA_INFO;

function ScoreSelector({ 
  value, 
  onChange, 
  criteria 
}: { 
  value: QualificationScore; 
  onChange: (score: QualificationScore) => void;
  criteria: CriteriaKey;
}) {
  const scores: QualificationScore[] = [1, 2, 3, 4, 5];
  const info = CRITERIA_INFO[criteria];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {scores.map(score => (
          <button
            key={score}
            onClick={() => onChange(score)}
            className={`flex-1 py-3 rounded-lg border-2 transition-all ${
              value === score
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                : 'border-gray-200 hover:border-blue-200 text-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">{score}</div>
            <div className="text-xs">{info.scores[score]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LeadQualificationPanel({ 
  lead, 
  qualification, 
  onSave, 
  onClose 
}: LeadQualificationPanelProps) {
  const [budgetScore, setBudgetScore] = useState<QualificationScore>(qualification?.budget_score || 3);
  const [budgetNotes, setBudgetNotes] = useState(qualification?.budget_notes || '');
  
  const [authorityScore, setAuthorityScore] = useState<QualificationScore>(qualification?.authority_score || 3);
  const [authorityNotes, setAuthorityNotes] = useState(qualification?.authority_notes || '');
  
  const [needScore, setNeedScore] = useState<QualificationScore>(qualification?.need_score || 3);
  const [needNotes, setNeedNotes] = useState(qualification?.need_notes || '');
  
  const [timelineScore, setTimelineScore] = useState<QualificationScore>(qualification?.timeline_score || 3);
  const [timelineNotes, setTimelineNotes] = useState(qualification?.timeline_notes || '');

  const overallScore = (budgetScore + authorityScore + needScore + timelineScore) / 4;
  
  const qualificationStatus = 
    overallScore >= 4 ? 'highly_qualified' :
    overallScore >= 3 ? 'qualified' : 'unqualified';

  const statusConfig = {
    highly_qualified: { label: 'Khách hàng tiềm năng cao', color: 'green', icon: '🔥' },
    qualified: { label: 'Khách hàng đủ điều kiện', color: 'blue', icon: '✓' },
    unqualified: { label: 'Chưa đủ điều kiện', color: 'orange', icon: '⚠️' },
  };

  const status = statusConfig[qualificationStatus];

  const handleSave = () => {
    onSave({
      lead_id: lead.id,
      budget_score: budgetScore,
      budget_notes: budgetNotes,
      authority_score: authorityScore,
      authority_notes: authorityNotes,
      need_score: needScore,
      need_notes: needNotes,
      timeline_score: timelineScore,
      timeline_notes: timelineNotes,
      overall_score: overallScore,
      qualification_status: qualificationStatus,
      evaluated_at: new Date().toISOString(),
      created_at: qualification?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-full max-w-3xl bg-white shadow-2xl z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Đánh giá năng lực khách hàng</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-semibold text-lg">{lead.name}</div>
              <div className="text-sm opacity-90">{lead.phone} • {lead.email}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{overallScore.toFixed(1)}</div>
              <div className="text-xs opacity-90">Điểm tổng</div>
            </div>
          </div>
          <div className={`flex items-center gap-2 mt-3 px-3 py-2 bg-${status.color}-500 rounded-lg`}>
            <span className="text-xl">{status.icon}</span>
            <span className="font-semibold">{status.label}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Budget */}
        <div className="bg-gray-50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{CRITERIA_INFO.budget.icon}</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{CRITERIA_INFO.budget.label}</h3>
              <p className="text-sm text-gray-600">{CRITERIA_INFO.budget.description}</p>
            </div>
            <div className="text-2xl font-bold text-blue-600">{budgetScore}</div>
          </div>
          <ScoreSelector value={budgetScore} onChange={setBudgetScore} criteria="budget" />
          <textarea
            value={budgetNotes}
            onChange={(e) => setBudgetNotes(e.target.value)}
            placeholder="Ghi chú về ngân sách..."
            className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
          />
        </div>

        {/* Authority */}
        <div className="bg-gray-50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{CRITERIA_INFO.authority.icon}</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{CRITERIA_INFO.authority.label}</h3>
              <p className="text-sm text-gray-600">{CRITERIA_INFO.authority.description}</p>
            </div>
            <div className="text-2xl font-bold text-blue-600">{authorityScore}</div>
          </div>
          <ScoreSelector value={authorityScore} onChange={setAuthorityScore} criteria="authority" />
          <textarea
            value={authorityNotes}
            onChange={(e) => setAuthorityNotes(e.target.value)}
            placeholder="Ghi chú về quyền quyết định..."
            className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
          />
        </div>

        {/* Need */}
        <div className="bg-gray-50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{CRITERIA_INFO.need.icon}</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{CRITERIA_INFO.need.label}</h3>
              <p className="text-sm text-gray-600">{CRITERIA_INFO.need.description}</p>
            </div>
            <div className="text-2xl font-bold text-blue-600">{needScore}</div>
          </div>
          <ScoreSelector value={needScore} onChange={setNeedScore} criteria="need" />
          <textarea
            value={needNotes}
            onChange={(e) => setNeedNotes(e.target.value)}
            placeholder="Ghi chú về nhu cầu..."
            className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
          />
        </div>

        {/* Timeline */}
        <div className="bg-gray-50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{CRITERIA_INFO.timeline.icon}</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{CRITERIA_INFO.timeline.label}</h3>
              <p className="text-sm text-gray-600">{CRITERIA_INFO.timeline.description}</p>
            </div>
            <div className="text-2xl font-bold text-blue-600">{timelineScore}</div>
          </div>
          <ScoreSelector value={timelineScore} onChange={setTimelineScore} criteria="timeline" />
          <textarea
            value={timelineNotes}
            onChange={(e) => setTimelineNotes(e.target.value)}
            placeholder="Ghi chú về thời gian..."
            className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
          />
        </div>

        {/* BANT Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Tóm tắt BANT Framework</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Budget (Ngân sách)</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${budgetScore * 20}%` }} />
                </div>
                <span className="font-bold text-gray-900">{budgetScore}/5</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Authority (Quyền)</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${authorityScore * 20}%` }} />
                </div>
                <span className="font-bold text-gray-900">{authorityScore}/5</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Need (Nhu cầu)</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${needScore * 20}%` }} />
                </div>
                <span className="font-bold text-gray-900">{needScore}/5</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Timeline (Thời gian)</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${timelineScore * 20}%` }} />
                </div>
                <span className="font-bold text-gray-900">{timelineScore}/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold transition-all shadow-lg"
        >
          💾 Lưu đánh giá
        </button>
      </div>
    </motion.div>
  );
}
