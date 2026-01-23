'use client';

import React, { useState } from 'react';
import { client } from '@/sanity/lib/client';

interface WarrantyRecord {
  _id: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  productCategory: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyPeriod: number;
  warrantyEndDate: string;
  status: 'active' | 'expiring' | 'expired' | 'claimed';
  installationAddress?: string;
  claimHistory?: Array<{
    claimDate: string;
    issueDescription: string;
    resolution: string;
    resolvedDate?: string;
  }>;
}

export default function WarrantyLookupPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<WarrantyRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!phone || phone.length !== 10) {
      setError('Vui lòng nhập số điện thoại 10 số (VD: 0333314288)');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setSearched(true);

    try {
      const query = `*[_type == "warranty" && customerPhone == $phone] | order(purchaseDate desc) {
        _id,
        customerName,
        customerPhone,
        productName,
        productCategory,
        serialNumber,
        purchaseDate,
        warrantyPeriod,
        warrantyEndDate,
        status,
        installationAddress,
        claimHistory
      }`;

      const data = await client.fetch<WarrantyRecord[]>(query, { phone });
      setResults(data);
      console.log(`✅ Found ${data.length} warranty records for ${phone}`);
    } catch (err) {
      console.error('❌ Warranty lookup error:', err);
      setError('Có lỗi xảy ra khi tra cứu. Vui lòng thử lại hoặc liên hệ hotline 0333 314 288');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { icon: '✅', text: 'Còn bảo hành', color: 'bg-green-100 text-green-800' },
      expiring: { icon: '⏰', text: 'Sắp hết hạn', color: 'bg-yellow-100 text-yellow-800' },
      expired: { icon: '❌', text: 'Hết hạn', color: 'bg-red-100 text-red-800' },
      claimed: { icon: '🔧', text: 'Đã bảo hành', color: 'bg-blue-100 text-blue-800' },
    };
    const badge = badges[status as keyof typeof badges] || badges.active;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${badge.color}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const calculateRemainingTime = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Đã hết hạn';
    if (diffDays === 0) return 'Hết hạn hôm nay';
    if (diffDays < 30) return `Còn ${diffDays} ngày`;
    if (diffDays < 365) return `Còn ${Math.floor(diffDays / 30)} tháng`;
    return `Còn ${Math.floor(diffDays / 365)} năm`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            🛡️ Tra cứu bảo hành
          </h1>
          <p className="text-lg text-gray-600">
            Nhập số điện thoại để kiểm tra tình trạng bảo hành sản phẩm
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-blue-100">
          <div className="flex gap-4">
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                setPhone(value);
              }}
              placeholder="Nhập số điện thoại (VD: 0333314288)"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '🔍 Đang tra cứu...' : '🔍 Tra cứu'}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 font-semibold">❌ Lỗi</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* No Results */}
        {searched && !loading && results.length === 0 && !error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
            <p className="text-yellow-800 font-semibold mb-2">
              ⚠️ Không tìm thấy thông tin bảo hành
            </p>
            <p className="text-yellow-700 mb-4">
              Số điện thoại <strong>{phone}</strong> chưa được đăng ký bảo hành trong hệ thống.
            </p>
            <p className="text-sm text-yellow-600">
              💡 Nếu bạn vừa mua sản phẩm, vui lòng đợi 1-2 ngày để hệ thống cập nhật. 
              Hoặc liên hệ hotline <strong>0333 314 288</strong> để được hỗ trợ.
            </p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div>
            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-900">
                ✅ Tìm thấy {results.length} sản phẩm
              </p>
              <p className="text-sm text-gray-600">
                Khách hàng: <strong>{results[0].customerName}</strong> | SĐT: <strong>{phone}</strong>
              </p>
            </div>

            <div className="space-y-6">
              {results.map((record) => (
                <div
                  key={record._id}
                  className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {record.productName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Serial: <span className="font-mono font-semibold">{record.serialNumber}</span>
                      </p>
                    </div>
                    {getStatusBadge(record.status)}
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">📅 Ngày mua</p>
                      <p className="font-semibold">{formatDate(record.purchaseDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">🛡️ Thời hạn bảo hành</p>
                      <p className="font-semibold">{record.warrantyPeriod} năm</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">⏰ Hết hạn</p>
                      <p className="font-semibold">{formatDate(record.warrantyEndDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">⏳ Thời gian còn lại</p>
                      <p className="font-semibold text-blue-600">
                        {calculateRemainingTime(record.warrantyEndDate)}
                      </p>
                    </div>
                  </div>

                  {/* Installation Address */}
                  {record.installationAddress && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">📍 Địa chỉ lắp đặt</p>
                      <p className="text-sm">{record.installationAddress}</p>
                    </div>
                  )}

                  {/* Claim History */}
                  {record.claimHistory && record.claimHistory.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        🔧 Lịch sử bảo hành ({record.claimHistory.length})
                      </p>
                      <div className="space-y-2">
                        {record.claimHistory.map((claim, idx) => (
                          <div key={idx} className="p-3 bg-blue-50 rounded-lg text-sm">
                            <p className="font-semibold text-gray-900">
                              {formatDate(claim.claimDate)} - {claim.issueDescription}
                            </p>
                            {claim.resolution && (
                              <p className="text-gray-700 mt-1">
                                ✅ Giải quyết: {claim.resolution}
                              </p>
                            )}
                            {claim.resolvedDate && (
                              <p className="text-gray-600 text-xs mt-1">
                                Hoàn thành: {formatDate(claim.resolvedDate)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact CTA */}
                  <div className="mt-6 flex gap-3">
                    <a
                      href={`https://zalo.me/0333314288?text=${encodeURIComponent(
                        `Tôi cần hỗ trợ bảo hành cho sản phẩm ${record.productName} (Serial: ${record.serialNumber}). Cảm ơn!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-center transition"
                    >
                      💬 Yêu cầu bảo hành qua Zalo
                    </a>
                    <a
                      href="tel:0333314288"
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg text-center transition"
                    >
                      📞 Gọi hotline
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            💡 Câu hỏi thường gặp
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="font-semibold">❓ Tôi không tìm thấy thông tin bảo hành?</p>
              <p>Vui lòng kiểm tra lại số điện thoại hoặc liên hệ hotline <strong>0333 314 288</strong> để được hỗ trợ kích hoạt bảo hành.</p>
            </div>
            <div>
              <p className="font-semibold">❓ Tôi muốn gia hạn bảo hành?</p>
              <p>Liên hệ hotline để được tư vấn về gói gia hạn bảo hành mở rộng.</p>
            </div>
            <div>
              <p className="font-semibold">❓ Sản phẩm gặp sự cố, tôi làm gì?</p>
              <p>Nhấn nút "Yêu cầu bảo hành qua Zalo" ở trên hoặc gọi hotline <strong>0333 314 288</strong> để được hỗ trợ nhanh nhất.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
