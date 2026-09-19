import React from 'react';
import { ArrowRight } from 'lucide-react';

const topics = [
  {
    id: 1,
    title: 'Chào hỏi & Giới thiệu bản thân',
    korean: '자기소개',
    level: 'Sơ cấp 1',
    completed: '4,820',
    rate: 94,
  },
  {
    id: 2,
    title: 'Gọi món tại nhà hàng Hàn Quốc',
    korean: '식당에서 주문하기',
    level: 'Sơ cấp 2',
    completed: '3,650',
    rate: 82,
  },
  {
    id: 3,
    title: 'Mua sắm tại chợ Myeongdong',
    korean: '쇼핑하기',
    level: 'Đời sống',
    completed: '2,890',
    rate: 71,
  },
  {
    id: 4,
    title: 'Từ vựng trọng tâm TOPIK I',
    korean: 'TOPIK I 필수 어휘',
    level: 'TOPIK I',
    completed: '2,410',
    rate: 63,
  },
  {
    id: 5,
    title: 'Hỏi đường & Đi tàu điện ngầm Seoul',
    korean: '지하철 이용',
    level: 'Sơ cấp 2',
    completed: '1,980',
    rate: 52,
  },
  {
    id: 6,
    title: 'Phỏng vấn xin việc tiếng Hàn',
    korean: '면접 준비',
    level: 'Trung cấp',
    completed: '1,450',
    rate: 41,
  },
];

export default function TopTopics() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">🏆</span>
            <h3 className="font-bold text-gray-900 text-base">Chủ đề học nhiều nhất</h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Xếp hạng các bài học có lượng học viên hoàn thành cao nhất trên toàn hệ thống
          </p>
        </div>
        <button className="text-xs font-semibold text-gray-600 hover:text-emerald-700 flex items-center gap-1 transition">
          Xem chi tiết danh sách <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {topics.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
                {item.id}
              </span>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-gray-800 truncate">
                    {item.title} <span className="text-gray-400 font-normal">({item.korean})</span>
                  </h4>
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md shrink-0">
                    {item.level}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {item.completed} học viên đã hoàn thành • Tỉ lệ hoàn thành {item.rate}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-48 flex items-center gap-3 shrink-0">
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-700 h-2 rounded-full"
                  style={{ width: `${item.rate}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-700 w-8 text-right">{item.rate}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}