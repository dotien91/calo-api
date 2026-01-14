import * as fs from 'fs';
import * as path from 'path';

const TRACKING_FILE = path.resolve('quota-tracking.json');

interface ModelUsage {
  count: number;
  lastReset: string; // Lưu ngày hiện tại (YYYY-MM-DD)
}

interface QuotaData {
  [modelName: string]: ModelUsage;
}

export class QuotaManager {
  // Danh sách model ưu tiên theo thứ tự
  private models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];
  private limitPerDay = 20;

  constructor() {
    this.initFile();
  }

  private initFile() {
    if (!fs.existsSync(TRACKING_FILE)) {
      fs.writeFileSync(TRACKING_FILE, JSON.stringify({}));
    }
  }

  private getTodayStr(): string {
    return new Date().toISOString().split('T')[0]; // Trả về "2024-05-21"
  }

  private readData(): QuotaData {
    const raw = fs.readFileSync(TRACKING_FILE, 'utf-8');
    return JSON.parse(raw);
  }

  private writeData(data: QuotaData) {
    fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2));
  }

  // Hàm tìm model còn lượt
  public getAvailableModel(): string | null {
    const data = this.readData();
    const today = this.getTodayStr();

    for (const model of this.models) {
      const usage = data[model] || { count: 0, lastReset: today };

      // Nếu sang ngày mới -> Reset về 0
      if (usage.lastReset !== today) {
        usage.count = 0;
        usage.lastReset = today;
      }

      // Check xem còn lượt không
      if (usage.count < this.limitPerDay) {
        // Cập nhật lại data mới (để lưu trạng thái reset nếu có)
        data[model] = usage;
        this.writeData(data); 
        return model;
      }
    }
    
    return null; // Hết sạch lượt ở tất cả model
  }

  // Hàm tăng số đếm sau khi gọi thành công
  public incrementUsage(model: string) {
    const data = this.readData();
    const today = this.getTodayStr();
    
    if (!data[model]) data[model] = { count: 0, lastReset: today };
    
    data[model].count += 1;
    this.writeData(data);
    console.log(`[Quota] Model ${model} used: ${data[model].count}/${this.limitPerDay}`);
  }

  // Hàm đánh dấu model đã chết (nếu API trả về 429 dù local đếm chưa đủ)
  public markAsExhausted(model: string) {
    const data = this.readData();
    if (!data[model]) data[model] = { count: 0, lastReset: this.getTodayStr() };
    
    data[model].count = 999; // Set số to đùng để khóa lại
    this.writeData(data);
    console.warn(`[Quota] Model ${model} marked as EXHAUSTED!`);
  }
}
