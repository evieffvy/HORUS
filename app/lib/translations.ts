export const t = {
  en: {
    live: 'LIVE',
    totalCVEs: 'Total CVEs',

    filter: {
      keyword: 'Keyword Search',
      keywordPlaceholder: 'Apache, Log4j, RCE...',
      severity: 'Severity',
      cvssScore: 'CVSS Score',
      dateRange: 'Published Date',
      search: 'Search',
      reset: 'Reset',
    },

    table: {
      loading: 'Loading...',
      found: (n: number) => `Found ${n.toLocaleString()} results`,
      loadingNVD: 'Fetching data from NVD...',
      noResults: 'No CVEs match your filters',
      colID: 'CVE ID',
      colScore: 'Score',
      colSeverity: 'Severity',
      colDescription: 'Description',
      colVendor: 'Vendor',
      colDate: 'Date',
      prev: '← Prev',
      next: 'Next →',
      page: (cur: number, total: number) => `Page ${cur} / ${total}`,
    },

    modal: {
      published: 'Published',
      lastModified: 'Last Modified',
      description: 'Description',
      aiSummary: 'AI Vulnerability Summary',
      aiSummaryLang: '(English)',
      analyzing: 'Analyzing with Groq AI...',
      noSummary: 'Unable to generate summary',
      references: 'References',
      exportPDF: 'Export PDF',
      viewNVD: 'View on NVD →',
    },

    chat: {
      panel: 'AI Chat',
      context: 'Context',
      emptyHint: ['Ask about any vulnerability', 'or select a CVE for details'],
      placeholder: 'Ask about CVEs or vulnerabilities...',
      thinking: 'Thinking',
      disconnected: 'Connection failed at this time',
    },

    chart: {
      distribution: 'Severity Distribution',
      timeline: '7-Day CVE Timeline',
      noData: 'No data yet',
      count: 'Count',
    },

    stats: {
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },

    updatedAt: (time: string) => `Updated ${time}`,
  },

  th: {
    live: 'สด',
    totalCVEs: 'CVE ทั้งหมด',

    filter: {
      keyword: 'ค้นหาคำสำคัญ',
      keywordPlaceholder: 'Apache, Log4j, RCE...',
      severity: 'ความรุนแรง',
      cvssScore: 'คะแนน CVSS',
      dateRange: 'วันที่เผยแพร่',
      search: 'ค้นหา',
      reset: 'รีเซ็ต',
    },

    table: {
      loading: 'กำลังโหลด...',
      found: (n: number) => `พบ ${n.toLocaleString()} รายการ`,
      loadingNVD: 'กำลังดึงข้อมูลจาก NVD...',
      noResults: 'ไม่พบ CVE ที่ตรงกับเงื่อนไข',
      colID: 'CVE ID',
      colScore: 'คะแนน',
      colSeverity: 'ความรุนแรง',
      colDescription: 'รายละเอียด',
      colVendor: 'ผู้ผลิต',
      colDate: 'วันที่',
      prev: '← ก่อนหน้า',
      next: 'ถัดไป →',
      page: (cur: number, total: number) => `หน้า ${cur} / ${total}`,
    },

    modal: {
      published: 'เผยแพร่',
      lastModified: 'แก้ไขล่าสุด',
      description: 'รายละเอียด',
      aiSummary: 'AI สรุปช่องโหว่',
      aiSummaryLang: '(ภาษาไทย)',
      analyzing: 'กำลังวิเคราะห์ด้วย Groq AI...',
      noSummary: 'ไม่สามารถสร้างสรุปได้',
      references: 'อ้างอิง',
      exportPDF: 'ส่งออก PDF',
      viewNVD: 'ดูใน NVD →',
    },

    chat: {
      panel: 'AI Chat',
      context: 'บริบท',
      emptyHint: ['ถามเกี่ยวกับช่องโหว่ใดก็ได้', 'หรือเลือก CVE แล้วถามรายละเอียด'],
      placeholder: 'ถามเกี่ยวกับ CVE หรือช่องโหว่...',
      thinking: 'กำลังคิด',
      disconnected: 'ไม่สามารถเชื่อมต่อได้ในขณะนี้',
    },

    chart: {
      distribution: 'การกระจาย Severity',
      timeline: 'CVE 7 วันล่าสุด',
      noData: 'ยังไม่มีข้อมูล',
      count: 'จำนวน',
    },

    stats: {
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },

    updatedAt: (time: string) => `อัปเดต ${time}`,
  },
}

export type Lang = 'en' | 'th'
