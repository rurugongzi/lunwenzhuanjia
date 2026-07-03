import { UploadForm } from "@/components/UploadForm";

export default function CheckPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">校验论文引文</h1>
        <p className="text-sm text-gray-500 mt-1">
          上传论文或注释段 → 选目标期刊 → 1 分钟拿到逐条校验报告
        </p>
      </header>

      <UploadForm />
    </div>
  );
}