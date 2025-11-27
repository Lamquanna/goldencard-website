// Mock Supabase Client for Local Testing
// This allows testing CRM without setting up Supabase

export interface MockSupabaseClient {
  auth: {
    getUser: () => Promise<{ data: { user: any }, error: null }>;
  };
  from: (table: string) => any;
}

// Mock user data
const mockUser = {
  id: 'mock-user-123',
  email: 'admin@goldenenergy.vn',
  role: 'admin',
};

// Use globalThis to persist data across module reloads in development
// This prevents data loss when Next.js hot reloads modules
declare global {
  var __mockDeletionLogs: any[] | undefined;
}

// Deletion logs - stored in globalThis for persistence
if (!globalThis.__mockDeletionLogs) {
  globalThis.__mockDeletionLogs = [];
}
export const deletionLogs = globalThis.__mockDeletionLogs;

// Mock leads data - with test data for demonstration
// STATUS VALUES: new, contacted, qualified, proposal, won, lost
let mockLeads: any[] = [
  {
    id: '0',
    name: 'LQA',
    email: null,
    phone: '01230193193',
    company: null,
    message: 'Tư vấn lắp đặt cho gia đình',
    source: 'website_visitor',
    source_url: '/',
    status: 'new', // Pipeline stage
    priority: 'medium',
    locale: 'vi',
    device_type: 'desktop',
    ip_address: '103.200.20.15',
    browser: 'Chrome 120',
    assigned_to: null,
    estimated_value: null,
    probability: 50,
    expected_close_date: null,
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_activity: new Date().toISOString(),
    deleted_at: null,
    deletion_reason: null,
    deleted_by: null,
    deleted_by_role: null,
  },
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    company: 'Công ty TNHH ABC',
    message: 'Tôi muốn tư vấn về hệ thống điện mặt trời cho nhà ở diện tích 100m2',
    source: 'website_contact_form',
    source_url: '/vi/contact',
    status: 'new',
    priority: 'high',
    locale: 'vi',
    device_type: 'desktop',
    ip_address: '103.200.20.10',
    browser: 'Chrome 120',
    assigned_to: null,
    estimated_value: 150000000,
    probability: 60,
    expected_close_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['solar', 'residential'],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    deleted_at: null,
  },
  {
    id: '2',
    name: 'Trần Thị B',
    email: 'tranthib@company.vn',
    phone: '0987654321',
    company: 'Nhà máy XYZ',
    message: 'Công ty chúng tôi cần giải pháp năng lượng tái tạo quy mô lớn, công suất khoảng 500kW',
    source: 'website_contact_form',
    source_url: '/vi/solutions/solar',
    status: 'contacted', // Changed to match pipeline stage
    priority: 'high',
    locale: 'vi',
    device_type: 'mobile',
    ip_address: '14.240.10.20',
    browser: 'Safari Mobile',
    assigned_to: mockUser.id,
    estimated_value: 15000000000,
    probability: 75,
    expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['solar', 'commercial', 'high-value'],
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    deleted_at: null,
  },
  {
    id: '3',
    name: 'Lê Hoàng C',
    email: 'lehoangc@gmail.com',
    phone: '0912345678',
    company: null,
    message: 'Cho tôi biết giá lắp đặt hệ thống điện gió cho khu resort ven biển',
    source: 'website_contact_form',
    source_url: '/vi/solutions/wind',
    status: 'new',
    priority: 'medium',
    locale: 'vi',
    device_type: 'tablet',
    ip_address: '113.160.10.30',
    browser: 'Chrome Mobile',
    assigned_to: null,
    estimated_value: 5000000000,
    probability: 40,
    expected_close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['wind', 'resort'],
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    last_activity: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    deleted_at: null,
  },
];

// Mock lead views data (tracking who viewed leads)
let mockLeadViews: any[] = [];

// Mock chat messages data
let mockChatMessages: any[] = [
  // Messages for LQA (lead_id: '0')
  {
    id: 'msg-0-1',
    lead_id: '0',
    sender_type: 'customer',
    sender_name: 'LQA',
    message: 'Xin chào, tôi muốn biết thêm về các giải pháp năng lượng mặt trời',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-0-2',
    lead_id: '0',
    sender_type: 'agent',
    sender_id: mockUser.id,
    sender_name: 'Admin User',
    message: 'Chào anh/chị, cảm ơn đã quan tâm đến Golden Energy. Anh/chị có thể cho biết diện tích và loại mái nhà không ạ?',
    created_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  
  // Messages for Nguyễn Văn A (lead_id: '1')
  {
    id: 'msg-1',
    lead_id: '1',
    sender_type: 'customer',
    sender_name: 'Nguyễn Văn A',
    message: 'Xin chào, tôi muốn tư vấn về hệ thống điện mặt trời cho nhà ở',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-2',
    lead_id: '1',
    sender_type: 'agent',
    sender_id: mockUser.id,
    sender_name: 'Admin User',
    message: 'Chào anh, em là tư vấn viên của Golden Energy. Nhà anh diện tích bao nhiêu m2 ạ?',
    created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-3',
    lead_id: '1',
    sender_type: 'customer',
    sender_name: 'Nguyễn Văn A',
    message: 'Nhà em khoảng 100m2, mái tôn. Chi phí lắp đặt khoảng bao nhiêu ạ?',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    read_at: null,
  },
  
  // Messages for Trần Thị B (lead_id: '2')
  {
    id: 'msg-4',
    lead_id: '2',
    sender_type: 'customer',
    sender_name: 'Trần Thị B',
    message: 'Công ty tôi cần giải pháp năng lượng tái tạo quy mô lớn',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-5',
    lead_id: '2',
    sender_type: 'agent',
    sender_id: mockUser.id,
    sender_name: 'Admin User',
    message: 'Chào chị, công ty chị cần công suất bao nhiêu kW ạ? Hiện tại hóa đơn điện hàng tháng khoảng bao nhiêu?',
    created_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-6',
    lead_id: '2',
    sender_type: 'customer',
    sender_name: 'Trần Thị B',
    message: 'Công ty em cần khoảng 500kW, hóa đơn điện tầm 200 triệu/tháng',
    created_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString(),
  },
  
  // Messages for Lê Hoàng C (lead_id: '3')
  {
    id: 'msg-3-1',
    lead_id: '3',
    sender_type: 'customer',
    sender_name: 'Lê Hoàng C',
    message: 'Cho tôi xem báo giá chi tiết hệ thống 10kW',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-3-2',
    lead_id: '3',
    sender_type: 'agent',
    sender_id: mockUser.id,
    sender_name: 'Admin User',
    message: 'Chào anh, em đã gửi báo giá chi tiết qua email. Anh vui lòng kiểm tra ạ.',
    created_at: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-3-3',
    lead_id: '3',
    sender_type: 'customer',
    sender_name: 'Lê Hoàng C',
    message: 'Đã nhận rồi, cảm ơn. Tôi sẽ xem xét và phản hồi lại',
    created_at: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 45 * 60 * 60 * 1000).toISOString(),
  },
];

// Keep old messages structure for reference
const oldMockChatMessages = [
  {
    id: 'msg-1',
    lead_id: '1',
    sender_type: 'customer',
    sender_name: 'Nguyễn Văn A',
    message: 'Xin chào, tôi muốn tư vấn về hệ thống điện mặt trời cho nhà ở',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-2',
    lead_id: '1',
    sender_type: 'agent',
    sender_id: mockUser.id,
    sender_name: 'Admin User',
    message: 'Chào anh, em là tư vấn viên của Golden Energy. Nhà anh diện tích bao nhiêu m2 ạ?',
    created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-3',
    lead_id: '1',
    sender_type: 'customer',
    sender_name: 'Nguyễn Văn A',
    message: 'Nhà em khoảng 100m2, mái tôn. Chi phí lắp đặt khoảng bao nhiêu ạ?',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    read_at: null,
  },
  {
    id: 'msg-4',
    lead_id: '2',
    sender_type: 'customer',
    sender_name: 'Trần Thị B',
    message: 'Công ty tôi cần giải pháp năng lượng tái tạo quy mô lớn',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-5',
    lead_id: '2',
    sender_type: 'agent',
    sender_id: mockUser.id,
    sender_name: 'Admin User',
    message: 'Chào chị, công ty chị cần công suất bao nhiêu kW ạ? Hiện tại hóa đơn điện hàng tháng khoảng bao nhiêu?',
    created_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-6',
    lead_id: '2',
    sender_type: 'customer',
    sender_name: 'Trần Thị B',
    message: 'Công ty em cần khoảng 500kW, hóa đơn điện tầm 200 triệu/tháng',
    created_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    read_at: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock events data - with test data
let mockEvents: any[] = [
  {
    id: 'evt-1',
    lead_id: '1',
    event_type: 'created',
    description: 'Lead created from website contact form',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    metadata: { device: 'desktop', ip: '103.200.20.10' },
  },
  {
    id: 'evt-2',
    lead_id: '2',
    event_type: 'created',
    description: 'Lead created from website contact form',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    metadata: { device: 'mobile', ip: '14.240.10.20' },
  },
  {
    id: 'evt-3',
    lead_id: '2',
    event_type: 'status_changed',
    description: 'Status changed from new to in_progress',
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    metadata: { old_status: 'new', new_status: 'in_progress' },
  },
  {
    id: 'evt-4',
    lead_id: '2',
    event_type: 'assigned',
    description: 'Lead assigned to Admin User',
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    metadata: { assigned_to: mockUser.id },
  },
  {
    id: 'evt-5',
    lead_id: '3',
    event_type: 'created',
    description: 'Lead created from website contact form',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    metadata: { device: 'tablet', ip: '113.160.10.30' },
  },
];

// Create mock query builder
function createMockQueryBuilder(data: any[]) {
  console.log('🔨 Mock query builder created with', data.length, 'items');
  let filteredData = [...data];
  let selectFields = '*';
  let singleMode = false;
  let countMode = false;

  const builder = {
    select: (fields = '*', options?: any) => {
      selectFields = fields;
      if (options?.count === 'exact') {
        countMode = true;
      }
      return builder;
    },
    eq: (field: string, value: any) => {
      const before = filteredData.length;
      filteredData = filteredData.filter((item: any) => item[field] === value);
      console.log(`  ➜ eq(${field}, ${value}): ${before} → ${filteredData.length}`);
      return builder;
    },
    is: (field: string, value: any) => {
      const before = filteredData.length;
      filteredData = filteredData.filter((item: any) => item[field] === value);
      console.log(`  ➜ is(${field}, ${value}): ${before} → ${filteredData.length}`);
      return builder;
    },
    in: (field: string, values: any[]) => {
      filteredData = filteredData.filter((item: any) => values.includes(item[field]));
      return builder;
    },
    or: (condition: string) => {
      // Simple OR implementation - just return all for now
      return builder;
    },
    order: (field: string, options?: any) => {
      const desc = options?.ascending === false;
      filteredData.sort((a: any, b: any) => {
        if (a[field] < b[field]) return desc ? 1 : -1;
        if (a[field] > b[field]) return desc ? -1 : 1;
        return 0;
      });
      return builder;
    },
    range: (from: number, to: number) => {
      filteredData = filteredData.slice(from, to + 1);
      return builder;
    },
    limit: (count: number) => {
      filteredData = filteredData.slice(0, count);
      return builder;
    },
    single: () => {
      singleMode = true;
      return builder;
    },
    // Make it a proper thenable Promise
    then: (resolve: any, reject?: any) => {
      try {
        const result = singleMode ? filteredData[0] : filteredData;
        const response = countMode 
          ? { data: result, error: null, count: filteredData.length }
          : { data: result, error: null };
        
        console.log('🎯 Mock query result:', { 
          resultCount: Array.isArray(result) ? result.length : 1, 
          singleMode, 
          countMode,
          totalFiltered: filteredData.length 
        });
        
        return Promise.resolve(response).then(resolve, reject);
      } catch (error) {
        console.error('❌ Mock query error:', error);
        if (reject) reject(error);
        return Promise.reject(error);
      }
    },
  };

  return builder;
}

// Create mock Supabase client
export function createMockClient(): MockSupabaseClient {
  return {
    auth: {
      getUser: async () => {
        return {
          data: { user: mockUser },
          error: null,
        };
      },
    },
    from: (table: string) => {
      if (table === 'leads') {
        console.log('📋 from("leads") called - current leads:', mockLeads.length);
        const baseBuilder = createMockQueryBuilder(mockLeads) as any;
        
        // Extend builder with insert/update methods
        baseBuilder.insert = (data: any) => {
          const newLead = {
            ...data,
            id: `mock-${Date.now()}`,
            created_at: new Date().toISOString(),
            last_activity: new Date().toISOString(),
            status: data.status || 'new',
            priority: data.priority || 'medium',
            assigned_to: null,
            assigned_user: null,
            deleted_at: null,
            deletion_reason: null,
            deleted_by: null,
            deleted_by_role: null,
          };
          mockLeads.unshift(newLead);
          console.log('✅ Mock insert - New lead created:', newLead);
          console.log('📊 Total leads now:', mockLeads.length);
          return {
            select: () => ({
              single: () => Promise.resolve({ data: newLead, error: null }),
            }),
          };
        };
        
        baseBuilder.update = (data: any) => {
          const updateData = data;
          return {
            eq: (field: string, value: any) => {
              const lead = mockLeads.find((l: any) => l[field] === value);
              if (lead) {
                // If this is a soft delete (deleted_at is being set), log it
                if (updateData.deleted_at && !lead.deleted_at) {
                  const deleteLog = {
                    id: `del-${Date.now()}`,
                    lead_id: lead.id,
                    lead_name: lead.name,
                    lead_email: lead.email,
                    lead_phone: lead.phone,
                    deleted_by: updateData.deleted_by || 'Unknown',
                    deleted_by_role: updateData.deleted_by_role || 'unknown',
                    reason: updateData.deletion_reason || 'Không có lý do',
                    deleted_at: updateData.deleted_at,
                  };
                  deletionLogs.push(deleteLog);
                  console.log('🗑️ DELETION LOG:', deleteLog);
                }
                
                Object.assign(lead, updateData, { updated_at: new Date().toISOString() });
                console.log('✅ Mock update - Lead updated:', lead.id, updateData);
              }
              return {
                select: () => ({
                  single: () => Promise.resolve({ data: lead, error: null }),
                  then: (resolve: any) => Promise.resolve({ data: lead, error: null }).then(resolve),
                }),
                then: (resolve: any) => Promise.resolve({ data: lead, error: null }).then(resolve),
              };
            }
          };
        };
        
        return baseBuilder;
      }
      
      if (table === 'lead_events') {
        return {
          ...createMockQueryBuilder(mockEvents),
          insert: async (data: any) => {
            const newEvent = {
              ...data,
              id: `e-mock-${Date.now()}`,
              created_at: new Date().toISOString(),
              user: { full_name: 'Admin User' },
            };
            mockEvents.push(newEvent);
            return { data: newEvent, error: null };
          },
        };
      }
      
      // Special table for deletion logs
      if (table === 'deletion_logs') {
        return createMockQueryBuilder(deletionLogs);
      }
      
      if (table === 'lead_views') {
        return {
          ...createMockQueryBuilder(mockLeadViews),
          insert: async (data: any) => {
            const newView = {
              ...data,
              id: `v-mock-${Date.now()}`,
              viewed_at: new Date().toISOString(),
            };
            mockLeadViews.push(newView);
            return { data: newView, error: null };
          },
        };
      }
      
      if (table === 'users') {
        const mockUsers = [
          { 
            id: mockUser.id, 
            username: 'admin',
            email: mockUser.email, 
            full_name: 'Admin User', 
            role: 'admin',
            avatar_url: null,
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          { 
            id: 'mock-sale-456', 
            username: 'sale',
            email: 'sale@goldenenergy.vn', 
            full_name: 'Nhân viên Sale', 
            role: 'sale',
            avatar_url: null,
            created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        console.log('👥 Mock users table accessed:', mockUsers.length);
        return createMockQueryBuilder(mockUsers);
      }
      
      if (table === 'lead_stats') {
        // Calculate stats from current mockLeads array
        const activeLeads = mockLeads.filter((l: any) => l.deleted_at === null);
        const stats = {
          total_count: activeLeads.length,
          new_count: activeLeads.filter((l: any) => l.status === 'new').length,
          in_progress_count: activeLeads.filter((l: any) => l.status === 'in_progress').length,
          done_count: activeLeads.filter((l: any) => l.status === 'done').length,
          overdue_count: activeLeads.filter((l: any) => l.status === 'overdue').length,
        };
        console.log('📊 Mock lead_stats:', stats);
        return {
          select: () => ({
            single: async () => ({ data: stats, error: null }),
          }),
        };
      }
      
      if (table === 'chat_messages') {
        const baseBuilder = createMockQueryBuilder(mockChatMessages) as any;
        baseBuilder.insert = (data: any) => {
          const newMessage = {
            ...data,
            id: `msg-${Date.now()}`,
            created_at: new Date().toISOString(),
            read_at: null,
          };
          mockChatMessages.push(newMessage);
          console.log('💬 New chat message:', newMessage);
          return {
            select: () => ({
              single: () => Promise.resolve({ data: newMessage, error: null }),
            }),
          };
        };
        
        baseBuilder.update = async (data: any) => {
          // Find and update message
          const message = mockChatMessages[0];
          if (message) {
            Object.assign(message, data);
          }
          return { data: message, error: null };
        };
        
        return baseBuilder;
      }

      return createMockQueryBuilder([]);
    },
  };
}

// Export for use in API routes
export const mockSupabase = createMockClient();

// Export mock data for debugging
export const getMockLeads = () => mockLeads;
export const getMockMessages = () => mockChatMessages;
