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

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-2 bg-black/40 backdrop-blur-md">
      <iframe
        srcDoc={htmlContent}
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
        className={`bg-white transition-all duration-300 ${getViewportStyle()}`}
        title="Code Artifact Preview"
      />
    </div>
  );
}
