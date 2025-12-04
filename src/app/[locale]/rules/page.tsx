"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  Search,
  ShieldCheck,
  Ban,
  Tent,
  Car,
  Baby,
  Camera,
  AlertTriangle,
  Ticket,
  Flame,
  Package,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define rule sections with keywords for search
const getRulesData = (locale: string) => {
  if (locale === "ru") {
    return [
      {
        id: "registration",
        icon: Ticket,
        title: "Регистрация и браслеты",
        keywords: ["билет", "браслет", "вход", "регистрация", "проход", "идентификация"],
        content: [
          "Все посетители обязаны зарегистрироваться при входе и получить браслет соответствующий типу приобретённого билета.",
          "Браслет является основным средством идентификации на территории фестиваля, каждый участник несёт ответственность за его сохранность.",
          "В случае повреждения, потери или изменения браслета посетитель обязан немедленно обратиться в пункт контроля билетов для замены, обязательно предъявив оригинальный браслет.",
          "Посетители могут покидать территорию фестиваля и возвращаться только при наличии действительного браслета.",
        ],
      },
      {
        id: "security",
        icon: ShieldCheck,
        title: "Контроль безопасности",
        keywords: ["безопасность", "охрана", "проверка", "досмотр", "медицина", "помощь"],
        content: [
          "При входе на территорию фестиваля каждый посетитель подвергается проверке безопасности для выявления запрещённых предметов и веществ.",
          "Организаторы просят посетителей проявить понимание — эта мера необходима для обеспечения безопасности всех участников.",
          "Охрана и медицинские службы работают круглосуточно на территории фестиваля.",
        ],
      },
      {
        id: "general",
        icon: Users,
        title: "Общие правила",
        keywords: ["мусор", "курение", "природа", "заповедник", "правила", "поведение"],
        content: [
          "Все отходы следует выбрасывать только в специально оборудованные контейнеры.",
          "Курение разрешено исключительно в отведённых для этого зонах.",
          "Фестиваль проходит на территории природного заповедника — посетители принимают на себя все риски, связанные с природной средой.",
        ],
      },
      {
        id: "prohibited",
        icon: Ban,
        title: "Запрещённые предметы и вещества",
        keywords: ["алкоголь", "еда", "вода", "оружие", "наркотики", "запрещено", "нельзя", "пиротехника", "дрон", "лекарства", "спрей"],
        content: [
          "Строго запрещён вход с:",
          "• Алкогольными или слабоалкогольными напитками в любой таре",
          "• Продуктами питания и напитками, за исключением негазированной воды",
          "Разрешённые исключения:",
          "• Детское питание",
          "• Диетические продукты по медицинским показаниям (с документальным подтверждением)",
          "• Оружием любого типа (огнестрельным, пневматическим, газовым, холодным)",
          "• Взрывчатыми веществами, фейерверками и пиротехникой",
          "• Лампами на горючем, горелками, мангалами, баллонами, легковоспламеняющимися жидкостями",
          "• Аэрозольными спреями, дезодорантами, репеллентами, средствами для укладки",
          "• Острыми или опасными предметами",
          "• Лазерами, генераторами, мегафонами",
          "• Наркотическими веществами",
          "• Медикаментами, за исключением жизненно необходимых, противоаллергических и растворов для линз (в оригинальной запечатанной упаковке)",
          "• Дронами и квадрокоптерами",
        ],
      },
      {
        id: "forbidden-actions",
        icon: AlertTriangle,
        title: "Запрещено на территории фестиваля",
        keywords: ["забор", "костёр", "огонь", "палатка", "реклама", "торговля", "вандализм"],
        content: [
          "• Проход без действительного браслета",
          "• Перелезание через заборы, конструкции и деревья",
          "• Повреждение оборудования и декораций",
          "• Вмешательство в техническую работу",
          "• Разведение огня в любой форме",
          "• Установка палаток за пределами кемпинга или парковки",
          "• Несанкционированная рекламная деятельность",
          "• Незаконная торговля",
          "• Проход в закрытые зоны",
          "• Вандализм и нарушение общественного порядка",
        ],
      },
      {
        id: "liability",
        icon: Package,
        title: "Ответственность организаторов",
        keywords: ["вещи", "палатка", "машина", "ответственность", "имущество"],
        content: [
          "Организаторы не несут ответственности за:",
          "• Сохранность палаток и вещей внутри них",
          "• Повреждения транспортных средств на парковке",
          "• Личные вещи, оставленные без присмотра",
        ],
      },
      {
        id: "transport",
        icon: Car,
        title: "Личный транспорт",
        keywords: ["парковка", "машина", "мотоцикл", "автомобиль", "транспорт"],
        content: [
          "Парковка бесплатна для автомобилей и мотоциклов.",
          "При въезде в зону кемпинга все пассажиры транспортного средства должны предъявить действительные билеты на кемпинг.",
          "Транспортные средства подвергаются проверке безопасности.",
        ],
      },
      {
        id: "children",
        icon: Baby,
        title: "Дети",
        keywords: ["дети", "ребёнок", "родители", "документы", "возраст", "семья"],
        content: [
          "• Дети до 14 лет допускаются только в сопровождении родителей",
          "• Необходим документ, удостоверяющий личность, и свидетельство о рождении (копия)",
          "• Дети до 7 лет — вход бесплатный",
          "• С 7 лет обязательно наличие билета",
          "Без документов — вход может быть отказан.",
        ],
      },
      {
        id: "camping",
        icon: Tent,
        title: "Правила кемпинга",
        keywords: ["кемпинг", "палатка", "camping", "семейный", "тишина", "душ", "туалет"],
        content: [
          "• Кемпинг разрешён только в специально отведённых зонах",
          "• Въезд и установка палаток: 09 августа 2024, с 18:00",
          "• FAMILY CAMPING — зона тишины с 23:00 до 07:00",
          "• Чистота — ответственность каждого участника",
          "• Мусор выбрасывается только в специально оборудованных местах",
          "• Санитарные группы должны использоваться ответственно",
          "• Демонтаж палаток — до 12 августа, 12:00",
          "• Место необходимо оставить чистым и без вещей",
        ],
      },
      {
        id: "photo",
        icon: Camera,
        title: "Фото и видео",
        keywords: ["фото", "видео", "съёмка", "камера", "согласие"],
        content: [
          "Приобретая билет, посетитель даёт согласие на использование фото/видео/аудио материалов с его участием в промо-целях организаторов.",
        ],
      },
    ];
  }

  // Romanian version
  return [
    {
      id: "registration",
      icon: Ticket,
      title: "Înregistrare și brățări",
      keywords: ["bilet", "brățară", "intrare", "înregistrare", "acces", "identificare"],
      content: [
        "Toți vizitatorii sunt obligați să se înregistreze la intrare și să primească brățara corespunzătoare tipului de bilet achiziționat.",
        "Brățara reprezintă principalul mijloc de identificare pe teritoriul festivalului, iar fiecare participant este responsabil pentru integritatea acesteia.",
        "În cazul deteriorării, pierderii sau modificării brățării, vizitatorul este obligat să se prezinte imediat la punctul de control al biletelor pentru înlocuire, prezentând obligatoriu brățara originală.",
        "Vizitatorii pot părăsi teritoriul festivalului și reveni ulterior, doar cu brățară valabilă.",
      ],
    },
    {
      id: "security",
      icon: ShieldCheck,
      title: "Control de securitate",
      keywords: ["securitate", "pază", "control", "verificare", "medical", "ajutor"],
      content: [
        "La intrarea pe teritoriul festivalului fiecare vizitator este supus controlului de securitate pentru depistarea obiectelor și substanțelor interzise.",
        "Organizatorii roagă vizitatorii să fie înțelegători — măsura este necesară pentru asigurarea siguranței tuturor participanților.",
        "Paza și serviciile medicale sunt disponibile 24/7 pe teritoriul festivalului.",
      ],
    },
    {
      id: "general",
      icon: Users,
      title: "Reguli generale",
      keywords: ["gunoi", "fumat", "natură", "rezervație", "reguli", "comportament"],
      content: [
        "Toate deșeurile trebuie aruncate doar în containerele special amenajate.",
        "Fumatul este permis exclusiv în zonele desemnate.",
        "Festivalul are loc într-o rezervație naturală — vizitatorii își asumă orice risc asociat mediului natural.",
      ],
    },
    {
      id: "prohibited",
      icon: Ban,
      title: "Obiecte și substanțe interzise",
      keywords: ["alcool", "mâncare", "apă", "arme", "droguri", "interzis", "pirotehnice", "dronă", "medicamente", "spray"],
      content: [
        "Este strict interzis accesul cu:",
        "• Băuturi alcoolice sau slab alcoolice în orice recipient",
        "• Produse alimentare și băuturi, cu excepția apei plate",
        "Excepții permise:",
        "• Alimente pentru copii",
        "• Produse dietetice prescrise medical (cu dovadă medicală)",
        "• Arme de orice tip (de foc, pneumatic, cu gaz, arme albe)",
        "• Substanțe explozive, artificii și articole pirotehnice",
        "• Lămpi cu combustibil, arzătoare, grătare, butelii, lichide inflamabile",
        "• Spray-uri aerosol, deodorante, repelente, produse pentru coafat",
        "• Obiecte tăioase sau periculoase",
        "• Lasere, generatoare, megafoane",
        "• Substanțe narcotice",
        "• Medicamente, cu excepția celor vitale, antialergice și soluții pentru lentile (în ambalaj original sigilat)",
        "• Drone și quadcoptere",
      ],
    },
    {
      id: "forbidden-actions",
      icon: AlertTriangle,
      title: "Este interzis pe teritoriul festivalului",
      keywords: ["gard", "foc", "cort", "publicitate", "comerț", "vandalism"],
      content: [
        "• Accesul fără brățara valabilă",
        "• Escaladarea gardurilor, structurilor și arborilor",
        "• Distrugerea echipamentului și decorurilor",
        "• Intervenția în activitatea tehnică",
        "• Aprinderea oricărei forme de foc",
        "• Instalarea corturilor în afara campingului sau parcării",
        "• Activități promoționale neautorizate",
        "• Comerț ilegal",
        "• Accesul în zonele restricționate",
        "• Vandalismul și tulburarea ordinii publice",
      ],
    },
    {
      id: "liability",
      icon: Package,
      title: "Responsabilitatea organizatorilor",
      keywords: ["bunuri", "cort", "mașină", "responsabilitate", "obiecte"],
      content: [
        "Organizatorii nu sunt responsabili pentru:",
        "• Siguranța corturilor și bunurilor din interior",
        "• Daune aduse vehiculelor parcate",
        "• Obiecte personale lăsate nesupravegheate",
      ],
    },
    {
      id: "transport",
      icon: Car,
      title: "Transport personal",
      keywords: ["parcare", "mașină", "motocicletă", "automobil", "transport"],
      content: [
        "Parcarea este gratuită pentru automobile și motociclete.",
        "La accesul în zona camping, toți ocupanții vehiculului trebuie să prezinte bilete valabile pentru camping.",
        "Vehiculele vor fi supuse controlului de securitate.",
      ],
    },
    {
      id: "children",
      icon: Baby,
      title: "Copii",
      keywords: ["copii", "copil", "părinți", "documente", "vârstă", "familie"],
      content: [
        "• Accesul copiilor sub 14 ani este permis doar cu părinți",
        "• Este necesar un document de identitate și certificat de naștere (copie)",
        "• Copiii sub 7 ani au intrare gratuită",
        "• De la 7 ani este obligatoriu biletul",
        "Fără documente — accesul poate fi refuzat.",
      ],
    },
    {
      id: "camping",
      icon: Tent,
      title: "Regulament camping",
      keywords: ["camping", "cort", "family", "liniște", "duș", "toaletă"],
      content: [
        "• Campingul este permis numai în zonele autorizate",
        "• Accesul și instalarea corturilor: 09 august 2024, ora 18:00",
        "• FAMILY CAMPING este zonă de liniște între 23:00 – 07:00",
        "• Curățenia este responsabilitatea fiecărui participant",
        "• Deșeurile se aruncă doar în spațiile special amenajate",
        "• Grupurile sanitare trebuie utilizate responsabil",
        "• Demontarea corturilor — până pe 12 august la ora 12:00",
        "• Locul trebuie lăsat curat și fără obiecte",
      ],
    },
    {
      id: "photo",
      icon: Camera,
      title: "Foto și video",
      keywords: ["foto", "video", "filmare", "cameră", "acord"],
      content: [
        "Prin achiziționarea biletului, vizitatorul își dă acordul pentru utilizarea imaginilor foto/video/audio în scopuri promoționale de către organizatori.",
      ],
    },
  ];
};

// Quick access topics
const getQuickTopics = (locale: string) => {
  if (locale === "ru") {
    return [
      { keyword: "алкоголь", label: "Алкоголь" },
      { keyword: "еда", label: "Еда" },
      { keyword: "вода", label: "Вода" },
      { keyword: "дети", label: "Дети" },
      { keyword: "кемпинг", label: "Кемпинг" },
      { keyword: "парковка", label: "Парковка" },
      { keyword: "браслет", label: "Браслеты" },
      { keyword: "наркотики", label: "Наркотики" },
      { keyword: "дрон", label: "Дроны" },
      { keyword: "курение", label: "Курение" },
    ];
  }
  return [
    { keyword: "alcool", label: "Alcool" },
    { keyword: "mâncare", label: "Mâncare" },
    { keyword: "apă", label: "Apă" },
    { keyword: "copii", label: "Copii" },
    { keyword: "camping", label: "Camping" },
    { keyword: "parcare", label: "Parcare" },
    { keyword: "brățară", label: "Brățări" },
    { keyword: "droguri", label: "Droguri" },
    { keyword: "dronă", label: "Drone" },
    { keyword: "fumat", label: "Fumat" },
  ];
};

export default function RulesPage() {
  const t = useTranslations("Rules");
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeSection, setActiveSection] = React.useState<string | null>(null);
  const sectionRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const rulesData = React.useMemo(() => getRulesData(locale), [locale]);
  const quickTopics = React.useMemo(() => getQuickTopics(locale), [locale]);

  // Filter rules based on search query
  const filteredRules = React.useMemo(() => {
    if (!searchQuery.trim()) return rulesData;

    const query = searchQuery.toLowerCase().trim();
    return rulesData.filter(
      (rule) =>
        rule.title.toLowerCase().includes(query) ||
        rule.keywords.some((keyword) => keyword.toLowerCase().includes(query)) ||
        rule.content.some((item) => item.toLowerCase().includes(query))
    );
  }, [searchQuery, rulesData]);

  // Handle quick topic click
  const handleTopicClick = (keyword: string) => {
    setSearchQuery(keyword);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 relative">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToHome")}
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <ShieldCheck className="h-3 w-3 mr-1" />
            {t("badge")}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("pageTitle")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("pageSubtitle")}
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Quick Topics */}
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">{t("quickTopics")}:</p>
            <div className="flex flex-wrap gap-2">
              {quickTopics.map((topic) => (
                <Badge
                  key={topic.keyword}
                  variant={searchQuery === topic.keyword ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary/80 transition-colors"
                  onClick={() => handleTopicClick(topic.keyword)}
                >
                  {topic.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Search Results Count */}
        {searchQuery && (
          <div className="text-center mb-6">
            <p className="text-muted-foreground">
              {t("foundSections", { count: filteredRules.length })}
            </p>
          </div>
        )}

        {/* Rules Content with Sidebar */}
        <div className="xl:flex xl:gap-8 xl:justify-center">
          {/* Table of Contents - Desktop */}
          <aside className="hidden xl:block xl:w-[280px] xl:flex-shrink-0">
            <div className="sticky top-28">
              <Card className="p-4">
                <p className="text-sm font-medium mb-3">{t("tableOfContents")}</p>
                <nav className="space-y-1">
                  {rulesData.map((rule) => {
                    const Icon = rule.icon;
                    const isFiltered = filteredRules.some((r) => r.id === rule.id);
                    return (
                      <button
                        key={rule.id}
                        onClick={() => scrollToSection(rule.id)}
                        className={`flex items-center gap-2 text-sm py-2 px-2 rounded-md transition-colors w-full text-left ${
                          activeSection === rule.id
                            ? "bg-primary/10 text-primary"
                            : isFiltered
                            ? "hover:bg-muted text-foreground"
                            : "text-muted-foreground/50"
                        }`}
                        disabled={!isFiltered}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="leading-tight">{rule.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </Card>
            </div>
          </aside>

          {/* Rules Content */}
          <div className="max-w-3xl w-full space-y-8">
          {filteredRules.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">{t("noResults")}</p>
              <Button variant="link" onClick={clearSearch} className="mt-2">
                {t("clearSearch")}
              </Button>
            </Card>
          ) : (
            filteredRules.map((rule, index) => {
              const Icon = rule.icon;
              return (
                <div
                  key={rule.id}
                  ref={(el) => {
                    sectionRefs.current[rule.id] = el;
                  }}
                  className="scroll-mt-32"
                >
                  <Card className="p-6 md:p-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold">{rule.title}</h2>
                      </div>
                    </div>
                    <Separator className="mb-4" />
                    <div className="space-y-3">
                      {rule.content.map((item, itemIndex) => (
                        <p
                          key={itemIndex}
                          className={`text-muted-foreground leading-relaxed ${
                            item.startsWith("•") ? "pl-4" : ""
                          }`}
                        >
                          {item}
                        </p>
                      ))}
                    </div>
                  </Card>
                  {index < filteredRules.length - 1 && <div className="h-2" />}
                </div>
              );
            })
          )}
          </div>
        </div>

        {/* Important Notice */}
        <div className="max-w-3xl mx-auto mt-12">
          <Card className="p-6 bg-destructive/5 border-destructive/20">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-lg mb-2">{t("importantTitle")}</h3>
                <p className="text-muted-foreground">{t("importantText")}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">{t("ctaTitle")}</h2>
          <p className="text-muted-foreground mb-6">{t("ctaDescription")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/tickets">{t("ctaBuyTickets")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contacts">{t("ctaContacts")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
