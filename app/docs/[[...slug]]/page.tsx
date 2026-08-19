import { getPageImageUrl, source } from "@/lib/source";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  PageLastUpdate,
} from "fumadocs-ui/layouts/docs/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { Pencil, PencilIcon, SeparatorHorizontal } from "lucide-react";
import { Card } from "fumadocs-ui/components/card";
import { baseUrl } from "@/lib/metadata";
import GitLab from "@/components/gitlabicon";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();
  const { toc, lastModified } = await page.data.load();
  const MDX = page.data.body;

  return (
    <DocsPage
      tableOfContent={{ style: "clerk" }}
      toc={toc}
      full={page.data.full}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
      <Card
        className="mt-5"
        title={"Edit on GitLab"}
        href={`https://gitlab.com/jointhisparty/www.jointhis.party/edit/main/content/docs/${page.path}`}
        icon={
          <div className="flex items-center justify-center gap-3 px-1 **:select-none">
            <PencilIcon />
            <div className="h-5 rounded-full border border-current" />
            <GitLab />
          </div>
        }
      >
        Found a mistake? Want to improve the documentation?
      </Card>
      {lastModified && <PageLastUpdate date={lastModified} />}
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImageUrl(page).url,
    },
    metadataBase: new URL(baseUrl),
  };
}
