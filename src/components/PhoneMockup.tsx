interface PhoneMockupProps {
  gradient?: string;
  label?: string;
  index?: number;
}

const gradients = [
  "from-primary/30 via-primary/10 to-white",
  "from-info/30 via-info/10 to-white",
  "from-success/30 via-success/10 to-white",
  "from-purple-400/30 via-purple-200/10 to-white",
];

const mockScreens = [
  { icon: "🔍", title: "البحث والاستكشاف", subtitle: "ابحث بالخريطة أو الحي" },
  { icon: "🏠", title: "تفاصيل العقار", subtitle: "صور، وصف، وموقع دقيق" },
  { icon: "💬", title: "المحادثة الفورية", subtitle: "تواصل مع المالك مباشرة" },
  { icon: "💳", title: "المحفظة الإلكترونية", subtitle: "إدارة الرصيد والترقيات" },
];

export default function PhoneMockup({ index = 0 }: PhoneMockupProps) {
  const screen = mockScreens[index % mockScreens.length];
  const gradient = gradients[index % gradients.length];

  return (
    <div className="relative w-[200px] sm:w-[220px] h-[420px] sm:h-[460px] shrink-0">
      {/* Phone frame */}
      <div className="absolute inset-0 bg-ink rounded-[36px] shadow-2xl border-4 border-ink overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-ink rounded-b-xl z-10" />

        {/* Screen */}
        <div
          className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-3 p-6`}
        >
          {/* Status bar */}
          <div className="absolute top-6 left-0 right-0 flex justify-between px-6 text-[10px] text-muted">
            <span>9:41</span>
            <span>●●●</span>
          </div>

          {/* App bar */}
          <div className="absolute top-10 left-0 right-0 h-10 flex items-center justify-center border-b border-line/50">
            <span className="text-sm font-bold text-primary">أقورا</span>
          </div>

          {/* Content placeholder */}
          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">{screen.icon}</span>
            <div className="space-y-1">
              <p className="text-sm font-bold text-ink">{screen.title}</p>
              <p className="text-xs text-muted">{screen.subtitle}</p>
            </div>
          </div>

          {/* Card placeholders */}
          <div className="absolute bottom-12 left-4 right-4 space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-14 bg-white/70 rounded-xl shadow-sm flex items-center gap-3 px-3"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2 bg-line rounded-full w-3/4" />
                  <div className="h-2 bg-surface rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-hint rounded-full" />
        </div>
      </div>
    </div>
  );
}
