/* Графика для подробных уроков: тематические иллюстрации, иконки разделов и картинки к аналогиям.
   Всё рисуется линиями в цветах темы (CSS-переменные), поэтому работает и в светлой, и в тёмной теме. */

const ART_CAT = {
  web:"net", http:"net",
  tools:"term", "be-linux":"term",
  html1:"tags", html2:"tags", html3:"tags",
  css1:"layout", css2:"layout", css3:"layout", css4:"layout", polish:"layout",
  js1:"code", js2:"code", js3:"code", js4:"code", js5:"code", js6:"code", js7:"code",
  ts:"types",
  react1:"comp", react2:"comp", react3:"comp", react4:"comp", react5:"comp",
  next1:"pages", next2:"pages", "fs-next-api":"pages",
  testing:"tests", "be-test":"tests",
  perf:"speed",
  node1:"server", express1:"server", express2:"server",
  sql1:"db", sql2:"db", sql3:"db", "pg-node":"db", orm:"db",
  auth:"lock", security:"lock",
  cache:"cache", realtime:"live",
  docker:"cloud", deploy:"cloud",
  arch:"arch", "fs-integration":"arch",
  projA:"rocket", projB:"rocket", "be-proj1":"rocket", "be-proj2":"rocket", "fs-proj":"rocket",
  career:"career", "be-career":"career", "fs-career":"career"
};

/* классы: s — линия, c — линия цвета модуля, cf — заливка цвета модуля, b — подложка, t — подпись, a — акцент */
const ART = {
net:`<rect class="b" x="12" y="26" width="98" height="78" rx="9"/><path class="s" d="M12 42h98"/><circle class="dot" cx="22" cy="34" r="2.5"/><circle class="s" cx="31" cy="34" r="2.5"/><circle class="s" cx="40" cy="34" r="2.5"/>
<path class="c" d="M24 56h52M24 66h70M24 76h40"/><rect class="cf" x="24" y="84" width="30" height="10" rx="3"/>
<rect class="b" x="170" y="20" width="58" height="96" rx="8"/><path class="s" d="M170 52h58M170 84h58"/><circle class="dot" cx="214" cy="36" r="3"><animate attributeName="opacity" values="1;.2;1" dur="1.4s" repeatCount="indefinite"/></circle><circle class="dot" cx="214" cy="68" r="3"/><circle class="s" cx="214" cy="100" r="3"/><path class="s" d="M180 36h20M180 68h20M180 100h20"/>
<path class="s dash" d="M114 58 C140 40 146 40 166 50"/><path class="s dash" d="M166 82 C146 96 140 96 114 80"/>
<circle class="a" r="5"><animateMotion dur="2.4s" repeatCount="indefinite" path="M114 58 C140 40 146 40 166 50"/></circle>
<circle class="ac" r="5"><animateMotion dur="2.4s" begin="1.2s" repeatCount="indefinite" path="M166 82 C146 96 140 96 114 80"/></circle>
<text class="t" x="128" y="36">GET</text><text class="t" x="126" y="112">200 OK</text>`,

term:`<rect class="b" x="14" y="18" width="150" height="104" rx="10"/><path class="s" d="M14 36h150"/><circle class="dot" cx="26" cy="27" r="3"/><circle class="s" cx="36" cy="27" r="3"/><circle class="s" cx="46" cy="27" r="3"/>
<text class="tc" x="26" y="58">$ git status</text><text class="t" x="26" y="76">On branch main</text><text class="tc" x="26" y="96">$ npm run dev</text>
<rect class="cfill" x="26" y="104" width="9" height="12"><animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite"/></rect>
<path class="s" d="M186 22v96"/><path class="c" d="M186 60 C186 48 212 50 212 38V22"/>
<circle class="b2" cx="186" cy="30" r="7"/><circle class="b2" cx="186" cy="70" r="7"/><circle class="b2" cx="186" cy="108" r="7"/><circle class="cf" cx="212" cy="30" r="7"/>
<path class="c" d="M212 46 C212 70 186 74 186 90"/>`,

tags:`<path class="b" d="M20 14h74l20 20v94H20z"/><path class="s" d="M94 14v20h20"/><path class="c" d="M32 50h40M32 62h58M32 74h30"/><text class="big" x="34" y="112">&lt;/&gt;</text>
<rect class="cf" x="150" y="14" width="66" height="22" rx="6"/><text class="tc" x="160" y="29">&lt;html&gt;</text>
<path class="s" d="M183 36v14M152 50h62M152 50v12M214 50v12"/>
<rect class="b" x="124" y="62" width="58" height="22" rx="6"/><text class="t" x="132" y="77">&lt;head&gt;</text>
<rect class="b" x="188" y="62" width="50" height="22" rx="6"/><text class="t" x="194" y="77">&lt;body&gt;</text>
<path class="s" d="M213 84v12M196 96h34M196 96v8M230 96v8"/>
<rect class="cf" x="180" y="104" width="30" height="20" rx="5"/><text class="tc" x="186" y="118">h1</text>
<rect class="b" x="214" y="104" width="24" height="20" rx="5"/><text class="t" x="222" y="118">p</text>`,

layout:`<rect class="s dash" x="14" y="16" width="112" height="108" rx="6"/><rect class="c" x="26" y="28" width="88" height="84" rx="5"/><rect class="b" x="38" y="40" width="64" height="60" rx="4"/><rect class="cf" x="50" y="52" width="40" height="36" rx="3"/>
<text class="t" x="18" y="13">margin</text><text class="t" x="52" y="74">content</text>
<rect class="cf" x="146" y="16" width="40" height="34" rx="6"/><rect class="b" x="192" y="16" width="40" height="34" rx="6"/><rect class="b" x="146" y="56" width="86" height="30" rx="6"/>
<rect class="b" x="146" y="92" width="26" height="32" rx="6"/><rect class="cf" x="176" y="92" width="26" height="32" rx="6"><animate attributeName="y" values="92;84;92" dur="2.4s" repeatCount="indefinite"/></rect><rect class="b" x="206" y="92" width="26" height="32" rx="6"/>`,

code:`<text class="brace" x="8" y="104">{</text><text class="brace" x="180" y="104">}</text>
<rect class="cfill" x="52" y="30" width="44" height="9" rx="4"/><rect class="sfill" x="102" y="30" width="60" height="9" rx="4"/>
<rect class="sfill" x="66" y="50" width="36" height="9" rx="4"/><rect class="afill" x="108" y="50" width="70" height="9" rx="4"/>
<rect class="sfill" x="66" y="70" width="80" height="9" rx="4"/><rect class="cfill" x="152" y="70" width="22" height="9" rx="4"/>
<rect class="afill" x="66" y="90" width="50" height="9" rx="4"/><rect class="sfill" x="52" y="110" width="20" height="9" rx="4"/>
<g transform="translate(168 16)"><g><path class="c" d="M0 -14v5M0 9v5M-14 0h5M9 0h5M-10 -10l3.5 3.5M6.5 6.5L10 10M10 -10l-3.5 3.5M-6.5 6.5L-10 10"/><circle class="c" r="6"/><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite"/></g></g>`,

types:`<rect class="b" x="14" y="80" width="212" height="44" rx="10"/>
<rect class="s" x="34" y="92" width="26" height="22" rx="3"/><circle class="s" cx="104" cy="103" r="12"/><path class="s" d="M150 114l14-24 14 24z"/><rect class="s" x="196" y="92" width="18" height="22" rx="9"/>
<g><rect class="cf" x="34" y="30" width="26" height="22" rx="3"/><animateTransform attributeName="transform" type="translate" values="0 0;0 52;0 52;0 0" keyTimes="0;.4;.7;1" dur="3.2s" repeatCount="indefinite"/></g>
<circle class="cf" cx="104" cy="40" r="12"/><path class="cf" d="M150 50l14-24 14 24z"/>
<text class="t" x="26" y="20">string</text><text class="t" x="86" y="20">number</text><text class="t" x="142" y="20">boolean</text>`,

comp:`<g transform="translate(60 70)"><ellipse class="c" rx="44" ry="16"/><ellipse class="c" rx="44" ry="16" transform="rotate(60)"/><ellipse class="c" rx="44" ry="16" transform="rotate(-60)"/><circle class="cfill" r="7"/>
<circle class="a" r="4"><animateMotion dur="3s" repeatCount="indefinite" path="M44 0 A44 16 0 1 1 -44 0 A44 16 0 1 1 44 0"/></circle></g>
<rect class="cf" x="150" y="12" width="64" height="24" rx="6"/><text class="tc" x="164" y="28">&lt;App/&gt;</text>
<path class="s" d="M182 36v12M156 48h52M156 48v10M208 48v10"/>
<rect class="b" x="128" y="58" width="56" height="22" rx="6"/><text class="t" x="134" y="73">&lt;List/&gt;</text>
<rect class="b" x="188" y="58" width="48" height="22" rx="6"/><text class="t" x="194" y="73">&lt;Form/&gt;</text>
<path class="s" d="M156 80v12M140 92h32M140 92v8M172 92v8"/>
<rect class="cf" x="126" y="100" width="28" height="20" rx="5"/><rect class="cf" x="158" y="100" width="28" height="20" rx="5"/>
<text class="t" x="128" y="134">props ↓</text>`,

pages:`<rect class="b" x="40" y="14" width="96" height="78" rx="8"/><rect class="b" x="28" y="28" width="96" height="78" rx="8"/><rect class="b" x="16" y="42" width="96" height="84" rx="8"/>
<path class="s" d="M16 58h96"/><text class="tc" x="26" y="53">/</text><path class="c" d="M28 72h60M28 84h70M28 96h44"/><rect class="cf" x="28" y="106" width="36" height="10" rx="3"/>
<text class="t" x="48" y="25">/blog</text><text class="t" x="36" y="39">/about</text>
<path class="s dash" d="M118 72h40"/><path class="s" d="M152 66l6 6-6 6"/>
<path class="cf" d="M190 38l34 18v40l-34 18-34-18V56z"/><path class="c" d="M156 56l34 18 34-18M190 74v40"/>
<text class="t" x="168" y="134">server</text>`,

tests:`<rect class="b" x="30" y="18" width="110" height="112" rx="10"/><rect class="cf" x="62" y="10" width="46" height="16" rx="5"/>
<path class="ok" d="M46 50l6 6 12-12"/><rect class="sfill" x="74" y="46" width="52" height="8" rx="4"/>
<path class="ok" d="M46 78l6 6 12-12"/><rect class="sfill" x="74" y="74" width="44" height="8" rx="4"/>
<path class="bad" d="M47 101l14 14M61 101l-14 14"/><rect class="sfill" x="74" y="104" width="48" height="8" rx="4"/>
<circle class="c" cx="182" cy="62" r="26"/><path class="c" d="M200 82l24 26"/><path class="ok" d="M170 62l8 8 15-15"><animate attributeName="opacity" values="0;1;1;0" dur="2.6s" repeatCount="indefinite"/></path>`,

speed:`<path class="s" d="M30 112a90 90 0 0 1 180 0"/><path class="c thick" d="M30 112a90 90 0 0 1 120 -78"/>
<path class="s" d="M44 70l8 5M74 40l5 7M120 28v9M166 40l-5 7M196 70l-8 5"/>
<g transform="translate(120 112)"><path class="a" d="M0 0L-4 -2 0 -74 4 -2z"><animateTransform attributeName="transform" type="rotate" values="-70;35;20;35" dur="3s" repeatCount="indefinite"/></path><circle class="afill" r="7"/></g>
<text class="t" x="18" y="132">LCP</text><text class="t" x="108" y="132">INP</text><text class="t" x="196" y="132">CLS</text>`,

server:`<rect class="cf" x="6" y="56" width="70" height="26" rx="13"/><text class="tc" x="15" y="73">GET /api</text>
<path class="s" d="M78 69h10"/><rect class="b" x="90" y="56" width="26" height="26" rx="6"/><path class="s" d="M118 69h8"/><rect class="b" x="128" y="56" width="26" height="26" rx="6"/><path class="s" d="M156 69h8"/>
<circle class="a" r="4"><animateMotion dur="2.2s" repeatCount="indefinite" path="M78 69H164"/></circle>
<text class="t" x="92" y="96">mw</text><text class="t" x="130" y="96">mw</text>
<rect class="b" x="166" y="16" width="62" height="108" rx="8"/><path class="s" d="M166 52h62M166 88h62"/>
<circle class="dot" cx="214" cy="34" r="3"/><circle class="dot" cx="214" cy="70" r="3"><animate attributeName="opacity" values="1;.2;1" dur="1.2s" repeatCount="indefinite"/></circle><circle class="dot" cx="214" cy="106" r="3"/>
<path class="c" d="M176 34h24M176 70h24M176 106h24"/>`,

db:`<ellipse class="cf" cx="58" cy="30" rx="40" ry="12"/><path class="c" d="M18 30v74c0 7 18 12 40 12s40-5 40-12V30"/><path class="c" d="M18 54c0 7 18 12 40 12s40-5 40-12M18 79c0 7 18 12 40 12s40-5 40-12"/>
<rect class="b" x="128" y="22" width="102" height="96" rx="8"/><path class="s" d="M128 44h102M128 68h102M128 92h102M164 22v96M198 22v96"/>
<rect class="cfill" x="129" y="23" width="100" height="20" rx="7" opacity=".35"/><text class="t" x="134" y="37">id</text><text class="t" x="170" y="37">name</text><text class="t" x="204" y="37">sum</text>
<rect class="afill" x="129" y="69" width="100" height="22" opacity=".25"><animate attributeName="y" values="45;69;93;45" dur="3.6s" repeatCount="indefinite"/></rect>
<path class="s dash" d="M100 70h24"/>`,

lock:`<path class="cf" d="M70 14l46 16v34c0 32-22 52-46 62-24-10-46-30-46-62V30z"/>
<rect class="b" x="52" y="62" width="36" height="30" rx="6"/><path class="c" d="M58 62v-10a12 12 0 0 1 24 0v10"/><circle class="dot" cx="70" cy="75" r="4"/><path class="c" d="M70 79v7"/>
<circle class="c" cx="168" cy="52" r="18"/><circle class="s" cx="168" cy="52" r="7"/><path class="c" d="M180 66l40 40M204 90l8-8M214 100l8-8"/>
<text class="t" x="132" y="128">httpOnly · bcrypt</text>`,

cache:`<path class="b" d="M30 98l60-20 60 20-60 20z"/><path class="cf" d="M30 76l60-20 60 20-60 20z"/><path class="b" d="M30 54l60-20 60 20-60 20z"/>
<path class="afill" d="M196 16l-28 52h22l-12 44 36-60h-24l14-36z"><animate attributeName="opacity" values="1;.45;1" dur="1.6s" repeatCount="indefinite"/></path>
<text class="t" x="70" y="132">Redis · CDN</text>`,

live:`<rect class="b" x="18" y="30" width="46" height="84" rx="9"/><path class="s" d="M34 106h14"/><rect class="cf" x="26" y="42" width="30" height="14" rx="4"/>
<rect class="b" x="164" y="38" width="64" height="44" rx="6"/><path class="s" d="M152 96h88l-8-14h-72z"/>
<path class="c" d="M84 56a26 26 0 0 1 0 36"><animate attributeName="opacity" values=".2;1;.2" dur="1.5s" repeatCount="indefinite"/></path>
<path class="c" d="M98 46a40 40 0 0 1 0 56"><animate attributeName="opacity" values=".2;1;.2" dur="1.5s" begin=".25s" repeatCount="indefinite"/></path>
<path class="c" d="M146 56a26 26 0 0 0 0 36"><animate attributeName="opacity" values=".2;1;.2" dur="1.5s" begin=".5s" repeatCount="indefinite"/></path>
<path class="c" d="M132 46a40 40 0 0 0 0 56"><animate attributeName="opacity" values=".2;1;.2" dur="1.5s" begin=".75s" repeatCount="indefinite"/></path>
<text class="t" x="96" y="128">WebSocket</text>`,

cloud:`<path class="cf" d="M62 50a24 24 0 0 1 46-10 20 20 0 0 1 32 16 16 16 0 0 1-2 32H66a20 20 0 0 1-4-38z"/>
<path class="s" d="M104 92v12"/><path class="a" d="M98 100l6-8 6 8"><animateTransform attributeName="transform" type="translate" values="0 8;0 -2;0 8" dur="1.8s" repeatCount="indefinite"/></path>
<rect class="b" x="40" y="106" width="56" height="24" rx="3"/><path class="s" d="M50 110v16M60 110v16M70 110v16M80 110v16"/>
<rect class="cf" x="104" y="106" width="56" height="24" rx="3"/><path class="c" d="M114 110v16M124 110v16M134 110v16M144 110v16"/>
<rect class="b" x="168" y="106" width="56" height="24" rx="3"/><path class="s" d="M178 110v16M188 110v16M198 110v16M208 110v16"/>
<text class="t" x="164" y="40">deploy ✓</text>`,

arch:`<rect class="cf" x="56" y="12" width="128" height="26" rx="7"/><text class="tc" x="94" y="29">routes</text>
<path class="s" d="M120 38v10"/><path class="s" d="M115 44l5 5 5-5"/>
<rect class="b" x="56" y="52" width="128" height="26" rx="7"/><text class="t" x="92" y="69">services</text>
<path class="s" d="M120 78v10"/><path class="s" d="M115 84l5 5 5-5"/>
<rect class="b" x="56" y="92" width="128" height="26" rx="7"/><text class="t" x="80" y="109">repositories</text>
<rect class="s dash" x="14" y="52" width="30" height="66" rx="6"/><text class="t" x="16" y="88">UI</text>
<ellipse class="cf" cx="212" cy="98" rx="18" ry="6"/><path class="c" d="M194 98v18c0 3 8 6 18 6s18-3 18-6V98"/><path class="s" d="M186 105h8"/>`,

rocket:`<path class="grid" d="M0 20h240M0 50h240M0 80h240M0 110h240M30 0v140M70 0v140M110 0v140M150 0v140M190 0v140M230 0v140"/>
<g><path class="cf" d="M120 18c18 12 26 34 22 62h-44c-4-28 4-50 22-62z"/><circle class="b2" cx="120" cy="48" r="9"/><path class="c" d="M98 70l-16 18 18-2M142 70l16 18-18-2"/>
<path class="afill" d="M108 82h24l-12 26z"><animate attributeName="opacity" values="1;.4;1" dur=".6s" repeatCount="indefinite"/></path>
<animateTransform attributeName="transform" type="translate" values="0 4;0 -4;0 4" dur="2.4s" repeatCount="indefinite"/></g>
<path class="ok" d="M18 30l5 5 9-9"/><path class="ok" d="M18 58l5 5 9-9"/><path class="s" d="M18 86h14"/><text class="t" x="174" y="128">MVP → прод</text>`,

career:`<rect class="b" x="18" y="16" width="86" height="112" rx="8"/><circle class="cf" cx="44" cy="44" r="14"/><path class="c" d="M66 38h28M66 50h20"/><path class="s" d="M30 72h62M30 84h52M30 96h62M30 108h40"/>
<rect class="cf" x="132" y="58" width="96" height="66" rx="10"/><path class="c" d="M162 58v-10a8 8 0 0 1 8-8h20a8 8 0 0 1 8 8v10M132 84h96"/><rect class="b2" x="172" y="78" width="16" height="12" rx="3"/>
<path class="afill" d="M196 10l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z"><animateTransform attributeName="transform" type="rotate" values="0 196 24;12 196 24;0 196 24" dur="2.6s" repeatCount="indefinite"/></path>`
};

/* иконки заголовков разделов */
const SEC_ICON = {
  "Ситуация":'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  "На пальцах":'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  "Как это работает":'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/>',
  "Пример":'<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
  "Частые ошибки":'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
  "Проверь себя":'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17v.5"/>',
  "Мини-задание":'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>'
};
const SEC_KEY = {"Ситуация":"situ", "На пальцах":"hand", "Как это работает":"how", "Пример":"ex", "Частые ошибки":"err", "Проверь себя":"check", "Мини-задание":"task"};

/* картинка к аналогии «На пальцах»: первое совпадение по ключевым словам */
const ANALOGY = [
  [/ресторан|официант|кухн|повар|меню|блюд|рецепт/, "🍽️"], [/посылк|коробк|упаковк/, "📦"], [/почт[аоуеы]|письм|конверт|адресат/, "✉️"],
  [/библиотек|книг|словар/, "📚"], [/склад|кладовщик|полк|стеллаж/, "🏬"], [/охран|пропуск|турникет|вахт/, "🛂"],
  [/замок|замк|(^|[^а-яё])ключ|сейф|печат/, "🔐"], [/телефон|звон|линия|провод/, "📞"], [/курьер|доставк|такси/, "🛵"],
  [/машин|двигател|водител|автомобил|механик|гараж/, "🚗"], [/поезд|метро|станци|рельс/, "🚇"], [/карт[аеуы]|маршрут|навигатор|компас/, "🗺️"],
  [/конструктор|лего|детал|кубик|пазл/, "🧩"], [/дом[ау ]|здани|квартир|этаж|фундамент|стройк|строител/, "🏗️"], [/магазин|покупател|касс|витрин|прилавок/, "🛒"],
  [/фабрик|завод|конвейер/, "🏭"], [/театр|актёр|спектакл/, "🎭"], [/оркестр|дирижёр|музык/, "🎼"],
  [/судья|соревнован|спорт|тренер|экзамен|площадк/, "🏁"], [/врач|больниц/, "🩺"], [/школ|учител|класс[ае ]/, "🏫"],
  [/банк|деньг|кошел/, "🏦"], [/сад|растени|дерев|ветк|корн/, "🌳"], [/фото|камер|снимок/, "📸"],
  [/часы|будильник|таймер|расписан/, "⏰"], [/лампочк|выключател|свет/, "💡"], [/чемодан|багаж|поездк/, "🧳"],
  [/шкаф|ящик|папк|архив/, "🗄️"], [/аквапарк|браслет|билет/, "🎟️"], [/рыбал|удочк/, "🎣"], [/кафе|кофе|бариста/, "☕"],
  [/переводчик|язык[аеу ]/, "🗣️"], [/карточк/, "🗂️"], [/(^|[^а-яё])мост/, "🌉"], [/труб|(^|[^а-яё])вод[аыу]|(^|[^а-яё])кран/, "🚰"], [/зеркал|отражени/, "🪞"],
  [/шпаргалк|записк|блокнот|заметк/, "📝"], [/картин|художник|галере|рисун/, "🖼️"], [/рыцар|щит|крепост/, "🛡️"], [/ракет|космос/, "🚀"],
  [/детектив|улик|расследова/, "🕵️"], [/лаборатори|эксперимент|пробирк/, "🧪"], [/погод|облак/, "☁️"], [/игр[аыу]|шахмат/, "♟️"],
  [/свадьб|праздник|гост/, "🎉"], [/портн|одежд|костюм/, "🧵"], [/весы|взвес/, "⚖️"], [/лифт/, "🛗"], [/светофор|перекрёст/, "🚦"],
  [/журнал|корабл|капитан/, "🚢"], [/работник|офис|сотрудник/, "🧑‍💼"], [/скелет|мышц/, "💪"], [/инструкци|прибор/, "📖"], [/экскурси/, "🧭"],
  [/буклет|реклам/, "📰"], [/ремонт|обои|стен[ыа]/, "🎨"], [/приказ|начальник/, "📋"], [/двер/, "🚪"], [/вывеск/, "🪧"], [/страховк/, "☂️"],
  [/бухгалтер|отчёт/, "🧾"], [/пицц/, "🍕"], [/матрёшк/, "🪆"], [/анкет|бланк|граф[аы]/, "📋"], [/клавиатур|рук[аой]/, "⌨️"], [/вердикт|приговор/, "⚖️"],
  [/развилк|указател|дорог/, "🛣️"], [/кандидат|собеседован/, "🤝"], [/свидетел|происшестви/, "🕵️"], [/калькулятор/, "🧮"], [/глагол|просьб|разговор/, "💬"],
  [/чертёж|архитектор/, "📐"], [/посетител/, "👀"], [/техосмотр/, "🔧"], [/кнопк/, "🔘"], [/мам[аы]|бабушк|родствен|дет[иея]/, "👪"], [/хозяин|тёмн/, "🌗"],
  [/очеред/, "🚶"], [/комнат|окн[аоы]/, "🪟"], [/мастерск|инструмент/, "🛠️"], [/бухгалтер/, "🧾"]
];
function analogyPic(text){
  const t = String(text || "").toLowerCase();
  for(const [re, e] of ANALOGY) if(re.test(t)) return e;
  return "💡";
}
function artFor(id){
  const svg = ART[ART_CAT[id]] || ART.code;
  const still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  return `<svg viewBox="0 0 240 140" aria-hidden="true" focusable="false">${still ? svg.replace(/<animate[^>]*\/>|<animateMotion[^>]*\/>|<animateTransform[^>]*\/>/g, "") : svg}</svg>`;
}

/* подробный урок: разбивает текст на разделы и оформляет каждый по-своему */
function deepHtml(text, id, i, title, mod){
  const parts = String(text).split(/^###\s+(.+)$/m);
  if(parts.length < 5) return `<div class="ai-text deep-lesson">${md(text)}</div>`;
  const secs = [];
  for(let k = 1; k < parts.length; k += 2) secs.push([parts[k].trim(), (parts[k + 1] || "").trim()]);
  const words = String(text).split(/\s+/).length, mins = Math.max(2, Math.round(words / 160));
  const qs = (String(text).match(/^\?[?!:]\s/gm) || []).length;
  const icon = name => `<svg class="dl-ico" viewBox="0 0 24 24" aria-hidden="true">${SEC_ICON[name] || SEC_ICON["Как это работает"]}</svg>`;
  const nav = secs.map(([n], k) => `<button type="button" class="dl-dot" data-dlgo="${k}" title="${esc(n)}" aria-label="К разделу «${esc(n)}»">${icon(n)}</button>`).join("");
  const body = secs.map(([n, b], k) => {
    const key = SEC_KEY[n] || "how";
    const head = `<h4 class="dl-h">${icon(n)}<span>${esc(n)}</span></h4>`;
    if(key === "hand") return `<section class="dl-sec dl-hand" data-dl="${k}"><div class="dl-pic" aria-hidden="true">${analogyPic(b)}</div><div class="dl-txt">${head}${md(b)}</div></section>`;
    if(key === "check") return `<section class="dl-sec dl-check" data-dl="${k}">${head}<p class="dl-qhint">Ответь сам — вслух или в уме — и только потом открывай ответ.</p>${md(b)}</section>`;
    return `<section class="dl-sec dl-${key}" data-dl="${k}">${head}${md(b)}</section>`;
  }).join("");
  return `<div class="dl" style="--c:var(${(MODULES[mod] || {}).c || "--accent"})">
    <header class="dl-hero">
      <div class="dl-art">${artFor(id)}</div>
      <div class="dl-meta"><span class="dl-k">Разбор · пункт ${i + 1}</span><b class="dl-title">${esc(title)}</b>
        <div class="dl-chips"><span>≈ ${mins} мин</span>${qs ? `<span>${qs} вопрос${qs % 10 === 1 && qs % 100 !== 11 ? "" : qs % 10 >= 2 && qs % 10 <= 4 && (qs % 100 < 10 || qs % 100 >= 20) ? "а" : "ов"}</span>` : ""}<span>мини-задание</span></div>
        <nav class="dl-nav" aria-label="Разделы разбора">${nav}</nav></div>
    </header>
    <div class="ai-text deep-lesson">${body}</div>
  </div>`;
}
