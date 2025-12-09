"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { teamData, TeamMember, getMemberName, getMemberRole, getMemberDescription, getMemberTitle } from '@/lib/team-data';
import Image from 'next/image';

interface TeamSectionProps {
  locale?: string;
}

export default function TeamSection({ locale = 'vi' }: TeamSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'leadership' | 'management' | 'engineering'>('all');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const filteredTeam = selectedCategory === 'all' 
    ? teamData 
    : teamData.filter(member => member.category === selectedCategory);

  const categoryLabels = {
    vi: {
      all: 'Tất cả',
      leadership: 'Ban Lãnh đạo',
      management: 'Quản lý',
      engineering: 'Kỹ thuật'
    },
    en: {
      all: 'All',
      leadership: 'Leadership',
      management: 'Management',
      engineering: 'Engineering'
    },
    zh: {
      all: '全部',
      leadership: '领导层',
      management: '管理层',
      engineering: '工程团队'
    }
  };

  const labels = categoryLabels[locale as keyof typeof categoryLabels] || categoryLabels.vi;

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-semibold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {locale === 'vi' ? 'Đội Ngũ Chuyên Gia' : locale === 'zh' ? '专业团队' : 'Our Expert Team'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {locale === 'vi' 
              ? 'Những con người tài năng, tận tâm, đam mê công nghệ năng lượng sạch' 
              : locale === 'zh'
              ? '才华横溢、敬业奉献、热爱清洁能源技术的团队'
              : 'Talented, dedicated professionals passionate about clean energy technology'}
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center gap-4 mb-12 flex-wrap"
        >
          {[
            { value: 'all', label: labels.all, icon: '👥' },
            { value: 'leadership', label: labels.leadership, icon: '👔' },
            { value: 'management', label: labels.management, icon: '📊' },
            { value: 'engineering', label: labels.engineering, icon: '⚡' },
          ].map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value as typeof selectedCategory)}
              className={`
                px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2
                ${selectedCategory === category.value
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-white shadow-lg shadow-[#D4AF37]/30'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }
              `}
            >
              <span>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTeam.map((member, index) => (
            <TeamCard
              key={member.id}
              member={member}
              index={index}
              locale={locale}
              onClick={() => setSelectedMember(member)}
            />
          ))}
        </div>

        {/* Member Detail Modal */}
        <AnimatePresence>
          {selectedMember && (
            <MemberDetailModal
              member={selectedMember}
              locale={locale}
              onClose={() => setSelectedMember(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function TeamCard({ member, index, locale, onClick }: { 
  member: TeamMember; 
  index: number; 
  locale: string;
  onClick: () => void;
}) {
  const name = getMemberName(member, locale);
  const role = getMemberRole(member, locale);
  const description = getMemberDescription(member, locale);

  const getCategoryBadge = () => {
    const badges = {
      leadership: { vi: '👔 Lãnh đạo', en: '👔 Leadership', zh: '👔 领导' },
      management: { vi: '📊 Quản lý', en: '📊 Management', zh: '📊 管理' },
      engineering: { vi: '⚡ Kỹ thuật', en: '⚡ Engineering', zh: '⚡ 工程' },
      support: { vi: '🛠️ Hỗ trợ', en: '🛠️ Support', zh: '🛠️ 支持' },
    };
    return badges[member.category]?.[locale as keyof typeof badges.leadership] || badges[member.category]?.vi;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      onClick={onClick}
      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-100 group"
    >
      {/* Avatar */}
      <div className="mb-5 relative">
        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-gray-100 group-hover:ring-[#D4AF37]/30 transition-all">
          {member.avatar && member.avatar !== '/Team/placeholder.jpg' ? (
            <Image
              src={member.avatar}
              alt={name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/40 flex items-center justify-center"><span class="text-4xl font-bold text-[#D4AF37]">${name.charAt(0)}</span></div>`;
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/40 flex items-center justify-center">
              <span className="text-4xl font-bold text-[#D4AF37]">
                {name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-0 right-0 bg-[#D4AF37] text-white text-[10px] px-2 py-1 rounded-full font-medium shadow-lg">
          {getCategoryBadge()}
        </div>
      </div>

      {/* Info */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {name}
        </h3>
        <p className="text-sm text-[#D4AF37] font-medium mb-2">
          {role}
        </p>
        <p className="text-xs text-gray-500 mb-3">
          {member.employeeCode}
        </p>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {description}
        </p>

        {/* Experience Badge */}
        {member.yearsExperience && (
          <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {member.yearsExperience}+ {locale === 'vi' ? 'năm' : locale === 'zh' ? '年' : 'years'}
          </div>
        )}
      </div>

      {/* Hover Action */}
      <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-sm text-[#D4AF37] font-medium">
          {locale === 'vi' ? 'Xem chi tiết →' : locale === 'zh' ? '查看详情 →' : 'View details →'}
        </span>
      </div>
    </motion.div>
  );
}

function MemberDetailModal({ member, locale, onClose }: { 
  member: TeamMember; 
  locale: string;
  onClose: () => void;
}) {
  const name = getMemberName(member, locale);
  const role = getMemberRole(member, locale);
  const title = getMemberTitle(member, locale);
  const description = getMemberDescription(member, locale);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="w-40 h-40 mx-auto rounded-full overflow-hidden ring-4 ring-[#D4AF37]/30 mb-6">
            {member.avatar && member.avatar !== '/Team/placeholder.jpg' ? (
              <Image
                src={member.avatar}
                alt={name}
                width={160}
                height={160}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/40 flex items-center justify-center"><span class="text-6xl font-bold text-[#D4AF37]">${name.charAt(0)}</span></div>`;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/40 flex items-center justify-center">
                <span className="text-6xl font-bold text-[#D4AF37]">
                  {name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <h2 className="text-2xl font-semibold mb-2 text-gray-900">{name}</h2>
          <p className="text-lg text-[#D4AF37] font-medium mb-1">{role}</p>
          <p className="text-sm text-gray-500 mb-2">{title}</p>
          <p className="text-xs text-gray-400 mb-6">
            {locale === 'vi' ? 'Mã NV' : locale === 'zh' ? '员工编号' : 'Employee ID'}: {member.employeeCode}
          </p>

          <p className="text-gray-700 leading-relaxed mb-8">
            {description}
          </p>

          {/* Department */}
          {member.department && (
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm">
                <span>🏢</span>
                {member.department}
              </span>
            </div>
          )}

          {/* Experience */}
          {member.yearsExperience && (
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-2 rounded-full text-sm font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {member.yearsExperience}+ {locale === 'vi' ? 'năm kinh nghiệm' : locale === 'zh' ? '年经验' : 'years experience'}
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="flex gap-4 justify-center">
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
