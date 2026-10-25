'use client';

export default function Step0aOwnerInfo() {
  return (
    <div className="px-4 py-6 space-y-4">
      {/* Green info banner */}
      <div className="bg-success-soft border border-success/30 rounded-xl p-4 flex items-start gap-3">
        <span className="text-success text-xl mt-0.5">✓</span>
        <p className="text-sm font-medium text-success">
          الترخيص من خلال عقار يعفي من عمولة البيع أو التأجير
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl p-5 space-y-5 shadow-sm">
        <h2 className="text-base font-bold text-ink">
          يقوم عقار بإصدار ترخيص إعلان للملاك والوكلاء
        </h2>

        {/* Steps */}
        <div>
          <p className="text-sm font-semibold text-muted mb-2">الخطوات:</p>
          <ul className="space-y-2">
            {[
              'إضافة معلومات المالك/الوكيل ووثيقة الملكية',
              'إضافة معلومات الإعلان',
              'سداد رسوم الإعلان',
              'الموافقة على عقد الوساطة',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Requirements */}
        <div>
          <p className="text-sm font-semibold text-muted mb-2">المتطلبات:</p>
          <ul className="space-y-1.5">
            {[
              'وثيقة ملكية وهوية فعالة',
              'سداد رسوم الإعلان',
              'الموافقة على عقد الوساطة',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-ink">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-xs text-muted text-center px-2">
        بمجرد الضغط على &quot;التالي&quot; ستنتقل لإدخال بيانات الترخيص
      </p>
    </div>
  );
}
