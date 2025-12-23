# Cập Nhật Tính Năng Tính Toán Hệ Thống Năng Lượng Mặt Trời

## Ngày cập nhật: 23/12/2025

## Vấn đề ban đầu

Khi diện tích mái không đủ để lắp đặt hệ thống điện mặt trời theo nhu cầu tiêu thụ điện, calculator vẫn đề xuất:
- Công suất dựa trên hóa đơn điện (không phù hợp với diện tích mái)
- Số lượng tấm pin vượt quá khả năng lắp đặt
- Inverter không phù hợp với công suất thực tế có thể lắp được

**Ví dụ:** 
- Hóa đơn điện: 10,000,000 VNĐ
- Diện tích mái: 15m × 10m = 150 m²
- Loại tấm pin: 700W
- Kết quả cũ: Đề xuất 37.04kW, inverter 41kW nhưng mái không đủ

## Giải pháp mới

### 1. Logic tính toán thông minh

```typescript
// Bước 1: Tính công suất lý tưởng theo nhu cầu
const idealPanelCount = Math.ceil((capacityKW * 1000) / selectedPanel.wattage);
const idealRequiredArea = idealPanelCount * PANEL_AREA * SPACING_FACTOR;

// Bước 2: Kiểm tra diện tích mái
const areaInsufficient = idealRequiredArea > roofArea && roofArea > 0;

// Bước 3: Nếu mái không đủ, tính toán lại
if (areaInsufficient) {
  // Tính số tấm pin tối đa có thể lắp trên mái
  actualPanelCount = Math.floor(roofArea / (PANEL_AREA * SPACING_FACTOR));
  // Tính lại công suất thực tế có thể lắp được
  actualCapacityKW = (actualPanelCount * selectedPanel.wattage) / 1000;
  // Tính lại diện tích thực tế cần
  actualRequiredArea = actualPanelCount * PANEL_AREA * SPACING_FACTOR;
}
```

### 2. Đề xuất inverter phù hợp

Inverter bây giờ được đề xuất dựa trên **công suất thực tế có thể lắp được** (actualCapacityKW), không phải công suất lý tưởng.

```typescript
const getRecommendedInverter = (): InverterType => {
  const targetCapacity = actualCapacityKW; // Sử dụng công suất thực tế
  
  if (targetCapacity <= 15) return STRING_INVERTER;
  else if (targetCapacity <= 50) return HYBRID_INVERTER;
  else return CENTRAL_INVERTER;
};
```

### 3. Hiển thị thông tin chi tiết

#### A. Thông báo cảnh báo khi mái không đủ

```
⚠️ DIỆN TÍCH MÁI KHÔNG ĐỦ!

Với diện tích mái hiện tại, bạn có thể lắp hệ thống điện mặt trời 
công suất 28.00 kW (40 tấm × 700W)

Để đạt được công suất mong muốn 37.04 kW (Đáp ứng được 76% nhu cầu):

1. Tăng diện tích mái khả dụng lên 192.5 m² (hiện tại: 150 m²)
2. Sử dụng tấm pin công suất cao hơn để giảm số lượng tấm cần thiết
3. Xem xét lắp hệ thống trên nhiều mái (nếu có)
```

#### B. Thẻ công suất hiển thị rõ ràng

- **Khi mái đủ:** Hiển thị "Công suất đề xuất"
- **Khi mái không đủ:** Hiển thị "Công suất có thể lắp" với ghi chú "Giới hạn bởi diện tích mái"

#### C. Thẻ diện tích chi tiết

- Hiển thị diện tích thực tế cần so với diện tích có sẵn
- Ví dụ: "150 / 192.5 m²" (có thể / cần thiết)

### 4. Ưu điểm của giải pháp

✅ **Thực tế:** Đề xuất hệ thống có thể lắp đặt được thực tế

✅ **Minh bạch:** Khách hàng hiểu rõ tại sao không đạt được công suất mong muốn

✅ **Gợi ý hữu ích:** Cung cấp 3 phương án để khách hàng cân nhắc:
   - Tăng diện tích mái
   - Dùng tấm pin công suất cao hơn
   - Lắp đặt trên nhiều mái

✅ **Inverter phù hợp:** Đề xuất inverter dựa trên công suất thực tế, không lãng phí

✅ **Tỷ lệ đáp ứng:** Hiển thị % nhu cầu được đáp ứng (ví dụ: 76%)

## Ví dụ minh họa

### Trường hợp 1: Mái đủ
```
Input:
- Hóa đơn: 5,000,000 VNĐ
- Mái: 20m × 15m = 300 m²
- Tấm pin: 550W

Output:
✅ Công suất đề xuất: 18.52 kW
✅ Số tấm: 34 tấm
✅ Diện tích cần: 103.6 m²
✅ Inverter: Hybrid 21 kW
```

### Trường hợp 2: Mái không đủ
```
Input:
- Hóa đơn: 10,000,000 VNĐ
- Mái: 15m × 10m = 150 m²
- Tấm pin: 700W

Output:
⚠️ Công suất có thể lắp: 28.00 kW (thay vì 37.04 kW lý tưởng)
⚠️ Số tấm: 40 tấm (thay vì 53 tấm lý tưởng)
⚠️ Diện tích: 150 / 192.5 m²
⚠️ Inverter: Hybrid 31 kW (phù hợp với 28kW)
📊 Đáp ứng: 76% nhu cầu

Gợi ý:
1. Tăng mái lên 192.5 m²
2. Dùng tấm pin 800W để giảm số tấm
3. Xem xét lắp trên nhiều mái
```

## Hỗ trợ đa ngôn ngữ

Tất cả thông báo và gợi ý được hỗ trợ đầy đủ 3 ngôn ngữ:
- 🇻🇳 Tiếng Việt
- 🇬🇧 English
- 🇨🇳 中文

## Kết luận

Cập nhật này giúp công cụ tính toán trở nên **thực tế** và **hữu ích** hơn cho khách hàng, đồng thời tăng độ tin cậy và chuyên nghiệp cho dịch vụ tư vấn.
