import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { Banner } from "fumadocs-ui/components/banner";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <>
      <Banner id="newyear" variant="rainbow">
        Happy new year everyone! Welcome to JoinThisParty 1.0.
      </Banner>
      <DocsLayout tree={source.pageTree} {...baseOptions()}>
        {children}
      </DocsLayout>
    </>
  );
}
