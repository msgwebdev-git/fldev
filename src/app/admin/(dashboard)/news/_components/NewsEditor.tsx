"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Loader2,
  ImageIcon,
  Trash2,
  Pencil,
  Monitor,
  Calendar,
  Tag,
  ExternalLink,
  Check,
  AlertCircle,
  Languages,
} from "lucide-react";

interface NewsData {
  id?: number;
  slug: string;
  title_ru: string;
  title_ro: string;
  excerpt_ru: string;
  excerpt_ro: string;
  content_ru: string;
  content_ro: string;
  image: string;
  date: string;
  category: string;
  published: boolean;
}

interface NewsEditorProps {
  initialData?: NewsData;
  isEdit?: boolean;
}

const defaultData: NewsData = {
  slug: "",
  title_ru: "",
  title_ro: "",
  excerpt_ru: "",
  excerpt_ro: "",
  content_ru: "",
  content_ro: "",
  image: "",
  date: new Date().toISOString().split("T")[0],
  category: "",
  published: true,
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function NewsEditor({ initialData, isEdit = false }: NewsEditorProps) {
  const router = useRouter();
  const [data, setData] = useState<NewsData>(initialData || defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!isEdit);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [activeLang, setActiveLang] = useState<"ru" | "ro">("ru");
  const [previewLang, setPreviewLang] = useState<"ru" | "ro">("ru");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [hasChanges, setHasChanges] = useState(false);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9а-яё\s-]/gi, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  useEffect(() => {
    if (autoSlug && data.title_ru) {
      setData((prev) => ({ ...prev, slug: generateSlug(prev.title_ru) }));
    }
  }, [data.title_ru, autoSlug]);

  // Track changes
  useEffect(() => {
    if (initialData) {
      const changed = JSON.stringify(data) !== JSON.stringify(initialData);
      setHasChanges(changed);
    } else {
      setHasChanges(
        data.title_ru !== "" || data.title_ro !== "" ||
        data.content_ru !== "" || data.content_ro !== ""
      );
    }
  }, [data, initialData]);

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const handleSave = useCallback(
    async (asDraft = false) => {
      if (!data.title_ru.trim() && !data.title_ro.trim()) {
        alert("Введите заголовок хотя бы на одном языке");
        return;
      }

      setIsSaving(true);
      setSaveStatus("idle");
      const supabase = createClient();

      const { id, ...saveData } = {
        ...data,
        published: asDraft ? false : data.published,
      };

      try {
        if (isEdit && data.id) {
          const { error } = await supabase
            .from("news")
            .update(saveData)
            .eq("id", data.id);

          if (error) {
            console.error("Error updating:", error.message, error);
            setSaveStatus("error");
            setIsSaving(false);
            return;
          }
        } else {
          const { error } = await supabase.from("news").insert(saveData);

          if (error) {
            console.error("Error creating:", error.message, error);
            setSaveStatus("error");
            setIsSaving(false);
            return;
          }
        }

        setSaveStatus("saved");
        setHasChanges(false);
        setTimeout(() => {
          router.push("/admin/news");
          router.refresh();
        }, 500);
      } catch (err) {
        console.error("Error saving:", err);
        setSaveStatus("error");
      }

      setIsSaving(false);
    },
    [data, isEdit, router]
  );

  const handleDelete = async () => {
    if (!data.id || !confirm("Удалить эту новость?")) return;

    setIsDeleting(true);
    const supabase = createClient();

    await supabase.from("news").delete().eq("id", data.id);

    setIsDeleting(false);
    router.push("/admin/news");
    router.refresh();
  };

  const togglePublished = () => {
    setData((prev) => ({ ...prev, published: !prev.published }));
  };

  // Get content for current language with fallback
  const getTitle = (lang: "ru" | "ro") =>
    lang === "ru" ? (data.title_ru || data.title_ro) : (data.title_ro || data.title_ru);
  const getExcerpt = (lang: "ru" | "ro") =>
    lang === "ru" ? (data.excerpt_ru || data.excerpt_ro) : (data.excerpt_ro || data.excerpt_ru);
  const getContent = (lang: "ru" | "ro") =>
    lang === "ru" ? (data.content_ru || data.content_ro) : (data.content_ro || data.content_ru);

  // Check if language has content
  const hasRuContent = data.title_ru || data.content_ru;
  const hasRoContent = data.title_ro || data.content_ro;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 -mx-6 -mt-6 px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/news">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {isEdit ? "Редактирование новости" : "Новая новость"}
                </h1>
                {hasChanges && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    Не сохранено
                  </Badge>
                )}
                {saveStatus === "saved" && (
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    <Check className="w-3 h-3 mr-1" />
                    Сохранено
                  </Badge>
                )}
                {saveStatus === "error" && (
                  <Badge variant="outline" className="text-red-600 border-red-300">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Ошибка
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{data.published ? "Опубликовано" : "Черновик"}</span>
                {data.slug && <span>• /news/{data.slug}</span>}
                <span>•</span>
                {hasRuContent && <Badge variant="secondary" className="text-xs">RU</Badge>}
                {hasRoContent && <Badge variant="secondary" className="text-xs">RO</Badge>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEdit && data.slug && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`/ru/news/${data.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Открыть
                </a>
              </Button>
            )}
            {isEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={togglePublished}>
              {data.published ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Снять
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Опубликовать
                </>
              )}
            </Button>
            <Button onClick={() => handleSave()} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Сохранить
              <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-white/20 rounded hidden sm:inline">
                ⌘S
              </kbd>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")}>
        <TabsList className="mb-6">
          <TabsTrigger value="edit" className="gap-2">
            <Pencil className="w-4 h-4" />
            Редактирование
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Monitor className="w-4 h-4" />
            Превью
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Slug */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slug" className="text-gray-700 font-medium">
                      URL (slug)
                    </Label>
                    <label className="flex items-center gap-2 text-sm text-gray-500">
                      <input
                        type="checkbox"
                        checked={autoSlug}
                        onChange={(e) => setAutoSlug(e.target.checked)}
                        className="rounded"
                      />
                      Авто из RU заголовка
                    </label>
                  </div>
                  <Input
                    id="slug"
                    value={data.slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setData((prev) => ({ ...prev, slug: e.target.value }));
                    }}
                    placeholder="news-url-slug"
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              {/* Language Tabs */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as "ru" | "ro")}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Languages className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-700">Контент</span>
                    </div>
                    <TabsList>
                      <TabsTrigger value="ru" className="gap-1.5">
                        🇷🇺 Русский
                        {hasRuContent && <Check className="w-3 h-3 text-green-600" />}
                      </TabsTrigger>
                      <TabsTrigger value="ro" className="gap-1.5">
                        🇷🇴 Română
                        {hasRoContent && <Check className="w-3 h-3 text-green-600" />}
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="ru" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="title_ru" className="text-gray-700 font-medium">
                        Заголовок (RU)
                      </Label>
                      <Input
                        id="title_ru"
                        value={data.title_ru}
                        onChange={(e) =>
                          setData((prev) => ({ ...prev, title_ru: e.target.value }))
                        }
                        placeholder="Введите заголовок на русском"
                        className="text-lg font-medium h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excerpt_ru" className="text-gray-700 font-medium">
                        Краткое описание (RU)
                      </Label>
                      <Textarea
                        id="excerpt_ru"
                        value={data.excerpt_ru}
                        onChange={(e) =>
                          setData((prev) => ({ ...prev, excerpt_ru: e.target.value }))
                        }
                        placeholder="Краткое описание для карточек..."
                        rows={3}
                        className="resize-none"
                      />
                      <p className="text-xs text-gray-400 text-right">
                        {data.excerpt_ru.length} символов
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Содержимое (RU)
                      </Label>
                      <RichTextEditor
                        content={data.content_ru}
                        onChange={(content) =>
                          setData((prev) => ({ ...prev, content_ru: content }))
                        }
                        placeholder="Начните писать текст новости на русском..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="ro" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="title_ro" className="text-gray-700 font-medium">
                        Titlu (RO)
                      </Label>
                      <Input
                        id="title_ro"
                        value={data.title_ro}
                        onChange={(e) =>
                          setData((prev) => ({ ...prev, title_ro: e.target.value }))
                        }
                        placeholder="Introduceți titlul în română"
                        className="text-lg font-medium h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="excerpt_ro" className="text-gray-700 font-medium">
                        Descriere scurtă (RO)
                      </Label>
                      <Textarea
                        id="excerpt_ro"
                        value={data.excerpt_ro}
                        onChange={(e) =>
                          setData((prev) => ({ ...prev, excerpt_ro: e.target.value }))
                        }
                        placeholder="Descriere scurtă pentru carduri..."
                        rows={3}
                        className="resize-none"
                      />
                      <p className="text-xs text-gray-400 text-right">
                        {data.excerpt_ro.length} simboluri
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">
                        Conținut (RO)
                      </Label>
                      <RichTextEditor
                        content={data.content_ro}
                        onChange={(content) =>
                          setData((prev) => ({ ...prev, content_ro: content }))
                        }
                        placeholder="Începeți să scrieți textul știrii în română..."
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Image */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-4">
                  <Label className="text-gray-700 font-medium">
                    Обложка статьи
                  </Label>

                  {data.image ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={data.image}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => setData((prev) => ({ ...prev, image: "" }))}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors">
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Нет изображения</p>
                        <p className="text-xs text-gray-400 mt-1">1200x630</p>
                      </div>
                    </div>
                  )}

                  <Input
                    value={data.image}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, image: e.target.value }))
                    }
                    placeholder="https://..."
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Meta */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-4">
                  <Label className="text-gray-700 font-medium">Мета-данные</Label>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm text-gray-600">
                      Категория
                    </Label>
                    <Input
                      id="category"
                      value={data.category}
                      onChange={(e) =>
                        setData((prev) => ({ ...prev, category: e.target.value }))
                      }
                      placeholder="Анонс"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm text-gray-600">
                      Дата публикации
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={data.date}
                      onChange={(e) =>
                        setData((prev) => ({ ...prev, date: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-4">
                  <Label className="text-gray-700 font-medium">Статус</Label>

                  <button
                    onClick={togglePublished}
                    className={`w-full p-4 rounded-lg transition-colors ${
                      data.published
                        ? "bg-green-50 border border-green-200 hover:bg-green-100"
                        : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {data.published ? (
                        <Eye className="w-5 h-5 text-green-600" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      )}
                      <div className="text-left">
                        <p className={`font-medium ${data.published ? "text-green-700" : "text-gray-700"}`}>
                          {data.published ? "Опубликовано" : "Черновик"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {data.published ? "Видна всем" : "Только в админке"}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Language Status */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-4">
                  <Label className="text-gray-700 font-medium">Языки</Label>

                  <div className="space-y-2">
                    <div className={`p-3 rounded-lg flex items-center gap-3 ${hasRuContent ? "bg-green-50" : "bg-gray-50"}`}>
                      <span className="text-lg">🇷🇺</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Русский</p>
                      </div>
                      {hasRuContent ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <span className="text-xs text-gray-400">Не заполнено</span>
                      )}
                    </div>

                    <div className={`p-3 rounded-lg flex items-center gap-3 ${hasRoContent ? "bg-green-50" : "bg-gray-50"}`}>
                      <span className="text-lg">🇷🇴</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Română</p>
                      </div>
                      {hasRoContent ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <span className="text-xs text-gray-400">Nu este completat</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          {/* Preview Language Selector */}
          <div className="flex justify-center mb-6">
            <TabsList>
              <button
                onClick={() => setPreviewLang("ru")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  previewLang === "ru" ? "bg-white shadow-sm" : "hover:bg-gray-100"
                }`}
              >
                🇷🇺 Русский
              </button>
              <button
                onClick={() => setPreviewLang("ro")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  previewLang === "ro" ? "bg-white shadow-sm" : "hover:bg-gray-100"
                }`}
              >
                🇷🇴 Română
              </button>
            </TabsList>
          </div>

          {/* Preview */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Preview Header */}
              <div className="relative h-[300px] md:h-[400px]">
                {data.image ? (
                  <Image
                    src={data.image}
                    alt={getTitle(previewLang) || "Preview"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    {data.category && (
                      <Badge className="bg-primary/90">
                        <Tag className="w-3 h-3 mr-1" />
                        {data.category}
                      </Badge>
                    )}
                    <span className="text-white/70 text-sm flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(data.date)}
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                    {getTitle(previewLang) || (previewLang === "ru" ? "Заголовок новости" : "Titlul știrii")}
                  </h1>
                </div>
              </div>

              <article className="p-6 md:p-8">
                {getExcerpt(previewLang) && (
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {getExcerpt(previewLang)}
                  </p>
                )}

                {getContent(previewLang) ? (
                  <div
                    className="prose prose-lg max-w-none prose-headings:font-bold prose-p:text-gray-700 prose-a:text-primary"
                    dangerouslySetInnerHTML={{ __html: getContent(previewLang) }}
                  />
                ) : (
                  <p className="text-gray-400 text-center py-12">
                    {previewLang === "ru"
                      ? "Начните писать содержимое новости..."
                      : "Începeți să scrieți conținutul știrii..."}
                  </p>
                )}
              </article>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
