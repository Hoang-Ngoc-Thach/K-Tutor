import React from 'react';
import { Mic, Volume2, BookOpen, ScanLine, Star } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="bg-emerald-50/50 rounded-3xl p-8 lg:p-10 border border-emerald-100/50 flex flex-col justify-between">
      <div>
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 text-emerald-800 text-xs font-bold rounded-full mb-6">
          ✨ GIA SƯ THÔNG MINH AI 2.0
        </span>

        {/* Main Heading */}
        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
          Chinh phục tiếng Hàn chuẩn Seoul cùng <span className="text-emerald-700">Gia sư AI K-Tutor</span>
        </h1>

        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          Học phản xạ giao tiếp tự nhiên 1-on-1, chỉnh âm chuẩn xác với công nghệ nhận diện giọng nói AI và luyện thi TOPIK lộ trình cá nhân hóa.
        </p>

        {/* Voice AI Card */}
        <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-emerald-100 mb-6">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">K-Tutor Voice AI</h4>
                <p className="text-[10px] text-emerald-600">● Phản hồi thời gian thực</p>
              </div>
            </div>
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium">
              Giọng chuẩn Seoul
            </span>
          </div>

          <div className="bg-emerald-50/60 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4" />
              </button>
              <div>
                <p className="text-sm font-bold text-gray-800">"안녕하세요! 오늘 기분이 어때요?"</p>
                <p className="text-xs text-gray-500">Xin chào! Hôm nay tâm trạng bạn thế nào?</p>
              </div>
            </div>
            <div className="flex gap-0.5 items-center">
              {[40, 70, 30, 90, 50, 80, 40].map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} className="w-1 bg-emerald-500 rounded-full h-6 block" />
              ))}
            </div>
          </div>
        </div>

        {/* Mini Feature Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white/60 p-3 rounded-xl border border-gray-100">
            <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center mb-2">
              <Mic className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-bold text-gray-800 mb-1">Luyện giao tiếp AI</h5>
            <p className="text-[10px] text-gray-500 leading-tight">
              Hội thoại tình huống thực tế 24/7 không sợ sai.
            </p>
          </div>

          <div className="bg-white/60 p-3 rounded-xl border border-gray-100">
            <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center mb-2">
              <BookOpen className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-bold text-gray-800 mb-1">Ôn thi TOPIK I & II</h5>
            <p className="text-[10px] text-gray-500 leading-tight">
              Bộ đề bám sát kỳ thi thật, lời giải ngữ pháp sâu.
            </p>
          </div>

          <div className="bg-white/60 p-3 rounded-xl border border-gray-100">
            <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center mb-2">
              <ScanLine className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-bold text-gray-800 mb-1">Scan chữ viết OCR</h5>
            <p className="text-[10px] text-gray-500 leading-tight">
              Nhận diện chữ Hangeul viết tay, sửa lỗi tức thì.
            </p>
          </div>
        </div>
      </div>

      {/* Social Proof Footer */}
      <div className="flex items-center gap-3 pt-4 border-t border-emerald-100/60">
        <div className="flex -space-x-2">
          <img className="w-7 h-7 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=33" alt="user" />
          <img className="w-7 h-7 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=47" alt="user" />
          <img className="w-7 h-7 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=12" alt="user" />
          <div className="w-7 h-7 rounded-full border-2 border-white bg-emerald-800 text-white text-[9px] font-bold flex items-center justify-center">
            +50k
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs font-bold text-gray-800">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>
            <span>4.9/5</span>
          </div>
          <p className="text-[11px] text-gray-500">
            Hơn 50,000+ học viên Việt Nam tin dùng mỗi ngày
          </p>
        </div>
      </div>
    </div>
  );
}