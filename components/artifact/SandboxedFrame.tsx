"use client";

interface SandboxedFrameProps {
  htmlContent: string;
  viewportMode?: "full" | "desktop" | "tablet" | "mobile";
}

export function SandboxedFrame({ htmlContent, viewportMode = "full" }: SandboxedFrameProps) {
  const getViewportStyle = () => {
    switch (viewportMode) {
      case "desktop":
        return "w-[1024px] max-w-full h-full border border-white/20 rounded-xl shadow-2xl";
      case "tablet":
        return "w-[768px] max-w-full h-full border border-white/20 rounded-2xl shadow-2xl";
      case "mobile":
        return "w-[375px] max-w-full h-[667px] max-h-full border-[8px] border-[#1c1c24] rounded-[36px] shadow-2xl";
      default:
        return "w-full h-full border-0 rounded-xl shadow-inner";
    }
  };

  // Inject a top-scroll script into iframe HTML so preview always renders top Hero section first
  const processedHtml = htmlContent.includes("</body>")
    ? htmlContent.replace("</body>", `<script>window.scrollTo(0,0);</script></body>`)
    : htmlContent + `<script>window.scrollTo(0,0);</script>`;

  return (
    <div className="w-full h-full flex items-start justify-center overflow-auto p-2 bg-black/40 backdrop-blur-md">
      <iframe
        srcDoc={processedHtml}
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        onLoad={(e) => {
          try {
            e.currentTarget.contentWindow?.scrollTo(0, 0);
          } catch {
            // Ignore
          }
        }}
        className={`bg-white transition-all duration-300 ${getViewportStyle()}`}
        title="Code Artifact Preview"
      />
    </div>
  );
}
