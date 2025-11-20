/**
 * File parsing utilities for extracting text from various document formats
 *
 * All imports are dynamic to avoid SSR issues in Next.js
 */

/**
 * Extract text content from a PDF file
 * @param file - PDF file to extract text from
 * @returns Promise resolving to extracted text
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Dynamically import pdfjs-dist to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');

    // Configure worker using CDN (more reliable in browser environments)
    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Extract text content from a Word document (.doc or .docx)
 * @param file - Word document file to extract text from
 * @returns Promise resolving to extracted text
 */
export async function extractTextFromWord(file: File): Promise<string> {
  try {
    // Dynamically import mammoth to avoid SSR issues
    const mammoth = await import('mammoth');

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (result.messages && result.messages.length > 0) {
      console.warn('Word document conversion warnings:', result.messages);
    }

    return result.value.trim();
  } catch (error) {
    console.error('Word document parsing error:', error);
    throw new Error(
      `Failed to extract text from Word document: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Determine file type and extract text accordingly
 * @param file - File to extract text from
 * @returns Promise resolving to extracted text
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  // Handle based on file type
  if (file.type === 'application/pdf' || fileExtension === 'pdf') {
    return await extractTextFromPDF(file);
  } else if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.type === 'application/msword' ||
    fileExtension === 'docx' ||
    fileExtension === 'doc'
  ) {
    return await extractTextFromWord(file);
  } else {
    // For text-based formats (.txt, .md, .json, .srt, .vtt), use native text()
    return await file.text();
  }
}
