import type { MetadataRoute } from "next";
import { source } from "@/lib/source";
import { baseUrl } from "@/lib/metadata";

export const url = (path: string): string => new URL(path, baseUrl).toString(); // modification by me
export const revalidate = false;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await Promise.all(
    source.getPages().map(async (page) => {
      const lastModified = page.data.lastModified; // modification by me

      return {
        url: url(page.url),
        lastModified: lastModified ? new Date(lastModified) : undefined,
        changeFrequency: "weekly",
        priority: 0.5,
      } as MetadataRoute.Sitemap[number];
    }),
  );

  return [
    {
      url: url("/"),
      changeFrequency: "monthly",
      priority: 1,
    },
    // obviously modification by me ;)
    {
      url: url("/tool"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: url("/docs"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // obviously modification by me ;)
    {
      url: url("/discord"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // Until here
    ...items.filter((v) => v !== undefined),
  ];
}

// Attribution for this file:
// https://raw.githubusercontent.com/techwithanirudh/fumadocs-starter/refs/heads/main/src/app/sitemap.ts
//
// MIT License
//
// Copyright (c) 2025 Anirudh
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
