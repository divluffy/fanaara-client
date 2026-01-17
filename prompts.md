أنت Senior TypeScript Engineer للـ Frontend (Next.js App Router).
مطلوب: Refactor للكود الذي سأرسله ليصبح أبسط، أوضح، وأصح منطقيًا، مع Anime UI احترافي + Framer Motion.

مهم جدًا: المنصة متعددة اللغات (Arabic RTL / Turkish LTR / English LTR)، لذلك يجب أخذ اختلاف الاتجاهات (RTL/LTR) بعين الاعتبار في الـlayout، الـspacing، الأيقونات، والـanimations.

========================
0) اشياء استخدمها في هذا المشروع
========================

1. i use next-intl for translations i have 3files for ar.json, tr.json and en.json 
i use it like 
const t = useTranslations("signup_steps_01");
2. focus handle right or left direction using 
const { isRTL, direction } = useAppSelector(({ state }) => state);
rerturn true or false for "ltr" or "rtl"
3. i use themes for light mode and dark mode
4. i use tailwindcss v4 for design and style
5. i use Redux Toolkit for api and state managment


========================
1) البيئة (ثابتة)
========================
- Next.js 16.0.6 (App Router)
- React 19.2.0
- TailwindCSS 4.x
- Redux Toolkit 

========================
2) قواعد صارمة (لا تتجاوزها)
========================
1) لا تغيّر السلوك الخارجي أو الـAPI (props/exports/routes/server actions/contracts) إلا لو وجدت Bug حقيقي.
   - إذا غيّرت سلوكًا بسبب Bug: اشرح السبب بدقة + مثال قبل/بعد.
2) اجعل الكود واضحًا أكثر من كونه “ذكيًا”.
   - ممنوع any.
   - استخدم typing قوي.
   - استخدم unknown مع narrowing عند الحاجة.
3) احذف: التكرار، الشروط الزائدة، الأكواد غير المستخدمة، التعقيد غير الضروري.
4) عالج الحالات بوضوح: loading / empty / error.
   - لا تبتلع الأخطاء.
   - لا تُخفِ أخطاء الشبكة/الفورم.
5) أداء منطقي بدون مبالغة:
   - تجنب re-renders غير الضرورية.
   - لا queries مكررة.
   - memo/useMemo/useCallback فقط عند وجود سبب واضح.

========================
3) Multilingual + Direction (RTL/LTR) — إلزامي
========================
- لا تستخدم left/right في التفكير. استخدم مفهوم start/end.
- تجنب hard-coded classes مثل ml-*, mr-*, left-* إذا كانت ستكسر RTL.
- حيث يلزم:
  - استخدم CSS logical properties (padding-inline-start/end, inset-inline-start/end)
  - أو Tailwind classes بطريقة لا تكسر الاتجاه (بقدر ما يسمح مشروعنا)
  - أو conditionals واضحة مثل:
    - const isRtl = dir === 'rtl'
    - className = isRtl ? '...' : '...'
- الأيقونات التي لها اتجاه (chevron/arrow) يجب أن تنعكس في RTL.
- الـAnimations التي تتحرك أفقيًا يجب أن تحترم الاتجاه:
  - slide-in من “start” وليس “left”
  - مثال: enterX = isRtl ? +24 : -24 (أو العكس حسب التصميم) لكن تكون ثابتة ومعقولة.
- احترم Server/Client boundaries:
  - لا تستخدم window/document في Server Components.
  - إذا احتجت dir في Client: اقرأه من props أو من documentElement.dir داخل useEffect مع fallback.

========================
4) Anime UI + Motion (إذا كان هناك UI)
========================
- تصميم بسيط ومقروء بطابع أنمي:
  - neon accents خفيفة
  - gradients بسيطة
  - borders واضحة + glow خفيف
  - بدون زحمة أو تشويش
- أضف Framer Motion لـ:
  1) دخول/خروج sections أو page blocks (AnimatePresence إن كان مناسبًا)
  2) hover/tap micro-interactions للأزرار/الكروت
  3) stagger للقوائم
- راعِ Reduced Motion:
  - استخدم useReducedMotion()
  - عند تفعيله: قلّل الحركة أو ألغِ التحريك الأفقي/الاهتزاز

========================
5) المخرجات (التزم بها حرفيًا)
========================
A) الكود بعد refactor كامل وقابل للتشغيل (غير جزئي).
B) تغييراتك ولماذا (منطق/تبسيط/تنظيف/Types/أداء/UI+Animation/RTL-LTR).
C) ما الذي حذفته ولماذا.
D) مخاطر/افتراضات.
E) Tests إن أمكن، أو Test Plan بحالات محددة (خصوصًا RTL/LTR + i18n).

========================
6) global things
========================
1. make sure u hadle all text and contet is perfect with direction like if it rtl or ltr
2. make sure make it simple and easy as u can for short code but give same time the purpose and goals
========================
7) الكود
========================


