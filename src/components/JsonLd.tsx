/**
 * Renders a schema.org JSON-LD <script> tag.
 * `<` is escaped to prevent breaking out of the script context.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
