"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { teamData, TeamMember } from '@/lib/team-data';

export default function TeamSection() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'leadership' | 'r&d' | 'support'>('all');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const filteredTeam = selectedCategory === 'all' 
    ? teamData 
    : teamData.filter(member => member.category === selectedCategory);

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
            Đội Ngũ Chuyên Gia
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Những con người tài năng, tận tâm, đam mê công nghệ năng lượng sạch
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
            { value: 'all', label: 'Tất cả' },
            { value: 'leadership', label: 'Lãnh đạo' },
            { value: 'r&d', label: 'R&D' },
            { value: 'support', label: 'Hỗ trợ' },
          ].map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value as any)}
              className={`
                px-6 py-2.5 rounded-full text-sm font-medium transition-all
                ${selectedCategory === category.value
                  ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-lg shadow-gold-500/30'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }
              `}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTeam.map((member, index) => (
            <TeamCard
              key={member.id}
              member={member}
              index={index}
              onClick={() => setSelectedMember(member)}
            />
          ))}
        </div>

        {/* Member Detail Modal */}
        {selectedMember && (
          <MemberDetailModal
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </div>
    </section>
  );
}

function TeamCard({ member, index, onClick }: { member: TeamMember; index: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      onClick={onClick}
      className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-100 group"
    >
      {/* Avatar */}
      <div className="mb-6 relative">
        <div className="w-40 h-40 mx-auto rounded-full overflow-hidden ring-4 ring-gray-100 group-hover:ring-gold-200 transition-all">
          <div className="w-full h-full bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center">
            <span className="text-5xl font-bold text-gold-600">
              {member.name.charAt(0)}
            </span>
          </div>
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-0 right-0 bg-gold-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
          {member.category === 'leadership' && '👔 Lãnh đạo'}
          {member.category === 'r&d' && '🔬 R&D'}
          {member.category === 'support' && '🛠️ Hỗ trợ'}
        </div>
      </div>

      {/* Info */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {member.name}
        </h3>
        <p className="text-sm text-gold-600 font-medium mb-3">
          {member.role}
        </p>
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
          {member.description}
        </p>

        {/* Experience Badge */}
        {member.yearsExperience && (
          <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {member.yearsExperience}+ năm kinh nghiệm
          </div>
        )}
      </div>

      {/* Hover Action */}
      <div className="mt-6 text-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-sm text-gold-600 font-medium">
          Xem chi tiết →
        </span>
      </div>
    </motion.div>
  );
}

function MemberDetailModal({ member, onClose }: { member: TeamMember; onClose: () => void }) {
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
        className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
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
        <div className="text-center mb-8">
          <div className="w-48 h-48 mx-auto rounded-full overflow-hidden ring-4 ring-gold-200 mb-6">
            <div className="w-full h-full bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center">
              <span className="text-7xl font-bold text-gold-600">
                {member.name.charAt(0)}
              </span>
            </div>
          </div>

          <h2 className="text-3xl font-semibold mb-2">{member.name}</h2>
          <p className="text-lg text-gold-600 font-medium mb-2">{member.role}</p>
          <p className="text-sm text-gray-500 mb-6">{member.title}</p>

          <p className="text-gray-700 leading-relaxed mb-8">
            {member.description}
          </p>

          {/* Certifications */}
          {member.certifications && member.certifications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Chứng chỉ & Thành tựu</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {member.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="bg-gold-50 text-gold-700 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {cert}
                  </span>
                ))}
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
