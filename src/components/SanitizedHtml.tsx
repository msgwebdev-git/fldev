"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";

interface SanitizedHtmlProps {
  html: string;
  className?: string;
  allowScripts?: boolean;
}

export function SanitizedHtml({ html, className, allowScripts }: SanitizedHtmlProps) {
  const clean = useMemo(() => {
    if (allowScripts) {
      return DOMPurify.sanitize(html, {
        ADD_TAGS: ["script"],
        ADD_ATTR: ["async", "defer", "src"],
      });
    }
    return DOMPurify.sanitize(html);
  }, [html, allowScripts]);

  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
