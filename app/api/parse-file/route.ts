import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import * as XLSX from "xlsx";
import JSZip from "jszip";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    const fileName = file.name;
    const fileType = file.type;
    const buffer = Buffer.from(await file.arrayBuffer());

    let extractedText = "";

    // 1. PDF Files
    if (fileName.endsWith(".pdf") || fileType === "application/pdf") {
      try {
        const data = await pdfParse(buffer);
        extractedText = data.text;
      } catch (err: any) {
        console.error("PDF parse error:", err);
        return NextResponse.json(
          { error: `Gagal membaca berkas PDF (${err?.message || "Format tidak valid"})` },
          { status: 400 }
        );
      }
    }
    // 2. Excel & CSV Files (.xlsx, .xls, .csv)
    else if (
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls") ||
      fileName.endsWith(".csv") ||
      fileType.includes("spreadsheet") ||
      fileType.includes("excel") ||
      fileType.includes("csv")
    ) {
      try {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetNames = workbook.SheetNames;
        const sheetsContent: string[] = [];

        sheetNames.forEach((name) => {
          const worksheet = workbook.Sheets[name];
          const csvText = XLSX.utils.sheet_to_csv(worksheet);
          sheetsContent.push(`--- Lembar Kerja (Sheet): ${name} ---\n${csvText}`);
        });

        extractedText = sheetsContent.join("\n\n");
      } catch (err: any) {
        console.error("Excel parse error:", err);
        return NextResponse.json(
          { error: `Gagal membaca berkas Excel/CSV (${err?.message || "Format tidak valid"})` },
          { status: 400 }
        );
      }
    }
    // 3. Word Files (.docx)
    else if (fileName.endsWith(".docx") || fileType.includes("wordprocessingml")) {
      try {
        const zip = await JSZip.loadAsync(buffer);
        const docXml = await zip.file("word/document.xml")?.async("string");
        if (docXml) {
          // Remove XML tags to get clean paragraph text
          extractedText = docXml
            .replace(/<w:p[^>]*>/g, "\n")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        } else {
          extractedText = "Isi berkas DOCX tidak dapat diekstrak.";
        }
      } catch (err: any) {
        console.error("DOCX parse error:", err);
        return NextResponse.json(
          { error: `Gagal membaca berkas DOCX (${err?.message || "Format tidak valid"})` },
          { status: 400 }
        );
      }
    }
    // 4. Plain Text & Code Files (.txt, .json, .md, .js, .py, .csv, etc.)
    else {
      extractedText = buffer.toString("utf-8");
    }

    // Limit extracted text length to prevent huge context overflow (e.g. max 100k chars)
    const maxChars = 100000;
    const isTruncated = extractedText.length > maxChars;
    const finalText = isTruncated
      ? extractedText.substring(0, maxChars) + "\n\n[...Teks dipotong karena melebihi batas 100,000 karakter...]"
      : extractedText;

    return NextResponse.json({
      success: true,
      fileName,
      charCount: extractedText.length,
      isTruncated,
      content: finalText,
    });
  } catch (error: any) {
    console.error("File parsing API error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat memproses berkas" },
      { status: 500 }
    );
  }
}
