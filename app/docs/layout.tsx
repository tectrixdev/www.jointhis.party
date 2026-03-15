import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { Banner } from "fumadocs-ui/components/banner";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <>
      <Banner id="proxy" variant="rainbow">
        Introducing jointhis.proxy! Check the discord server for more
        information!
      </Banner>
      <DocsLayout tree={source.pageTree} {...baseOptions()}>
        {children}
      </DocsLayout>
    </>
  );
}
