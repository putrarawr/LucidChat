"use client";

interface SandboxedFrameProps {
  htmlContent: string;
}

export function SandboxedFrame({ htmlContent }: SandboxedFrameProps) {
  return (
    <iframe
      srcDoc={htmlContent}
      // sandbox WITHOUT allow-same-origin for maximum isolation
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      className="w-full h-full border-0 bg-white rounded-xl shadow-inner transition-all duration-300"
      title="Code Artifact Preview"
    />
  );
}
