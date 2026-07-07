import { getActiveStories } from "@/lib/data/stories";
import { Stories } from "./Stories";

export async function StoriesSection() {
  const stories = await getActiveStories();
  if (stories.length === 0) return null;

  return (
    <section className="relative z-10 -mt-12 pb-8 md:-mt-16 md:pb-12">
      <div className="container mx-auto px-4">
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/95 py-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)] backdrop-blur-md md:py-6">
          <Stories stories={stories} />
        </div>
      </div>
    </section>
  );
}
