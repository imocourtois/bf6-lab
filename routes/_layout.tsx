import { define } from "@/utils.ts";
import { Footer, Nav, Strip, TopBar } from "@/components/Chrome.tsx";

export default define.page(function Layout({ Component, url }) {
  return (
    <div class="wrap">
      <TopBar />
      <Nav active={url.pathname} />
      <Strip />
      <Component />
      <Footer />
    </div>
  );
});
