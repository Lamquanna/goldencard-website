const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function createTables() {
  try {
    // Create tasks table
    await sql`
      CREATE TABLE IF NOT EXISTS erp_tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'todo',
        priority VARCHAR(20) DEFAULT 'medium',
        due_date DATE,
        assignee_id INTEGER,
        project_id INTEGER,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✅ Table erp_tasks created/verified')

    // Create projects table
    await sql`
      CREATE TABLE IF NOT EXISTS erp_projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        project_key VARCHAR(20) UNIQUE NOT NULL,
        description TEXT,
        color VARCHAR(7) DEFAULT '#3B82F6',
        status VARCHAR(20) DEFAULT 'active',
        start_date DATE,
        end_date DATE,
        progress INTEGER DEFAULT 0,
        owner_id INTEGER,
        location VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✅ Table erp_projects created/verified')

    // Insert sample tasks
    const sampleTasks = [
      {
        title: 'Hoàn thành báo cáo Q1',
        description: 'Tổng hợp báo cáo kinh doanh quý 1',
        status: 'in_progress',
        priority: 'high',
        due_date: '2026-01-15',
      },
      {
        title: 'Liên hệ khách hàng ABC',
        description: 'Gửi báo giá và thương thảo hợp đồng',
        status: 'todo',
        priority: 'high',
        due_date: '2026-01-12',
      },
      {
        title: 'Cập nhật hệ thống ERP',
        description: 'Thêm tính năng mới cho module HR',
        status: 'in_progress',
        priority: 'medium',
        due_date: '2026-01-20',
      },
    ]

    for (const task of sampleTasks) {
      await sql`
        INSERT INTO erp_tasks (title, description, status, priority, due_date)
        VALUES (${task.title}, ${task.description}, ${task.status}, ${task.priority}, ${task.due_date})
        ON CONFLICT DO NOTHING
      `
    }
    console.log('✅ Sample tasks inserted')

    // Insert sample projects
    const sampleProjects = [
      {
        name: 'Hệ thống điện mặt trời 10kW',
        project_key: 'PRJ-NB-001',
        description: 'Lắp đặt hệ thống điện mặt trời hòa lưới 10kW cho hộ gia đình',
        color: '#3B82F6',
        status: 'active',
        location: 'Nhà Bè',
        progress: 65,
        start_date: '2026-01-05',
        end_date: '2026-01-20',
      },
      {
        name: 'Điện mặt trời 50kW xưởng sản xuất',
        project_key: 'PRJ-BC-001',
        description: 'Lắp đặt hệ thống điện mặt trời cho xưởng sản xuất',
        color: '#10B981',
        status: 'active',
        location: 'Bình Chánh',
        progress: 85,
        start_date: '2026-01-01',
        end_date: '2026-01-15',
      },
    ]

    for (const project of sampleProjects) {
      await sql`
        INSERT INTO erp_projects (
          name, project_key, description, color, status, 
          location, progress, start_date, end_date
        )
        VALUES (
          ${project.name}, ${project.project_key}, ${project.description},
          ${project.color}, ${project.status}, ${project.location},
          ${project.progress}, ${project.start_date}, ${project.end_date}
        )
        ON CONFLICT (project_key) DO NOTHING
      `
    }
    console.log('✅ Sample projects inserted')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

createTables()
