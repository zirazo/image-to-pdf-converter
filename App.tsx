import React, { useState, useCallback, useEffect, useRef } from 'react';
import { UploadIcon } from './components/icons/UploadIcon';
import { PdfFileIcon } from './components/icons/PdfFileIcon';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { ResetIcon } from './components/icons/ResetIcon';
import { CloseIcon } from './components/icons/CloseIcon';
import { TrashIcon } from './components/icons/TrashIcon';
import { ArrowUpIcon } from './components/icons/ArrowUpIcon';
import { ArrowDownIcon } from './components/icons/ArrowDownIcon';
import { AddIcon } from './components/icons/AddIcon';
import { DownloadIcon } from './components/icons/DownloadIcon';


// TypeScript declaration for the jsPDF library loaded from CDN
declare global {
  interface Window {
    jspdf: {
      jsPDF: new (options?: any) => any;
    };
  }
}

// --- Helper Components ---

const Header: React.FC = () => (
  <header className="text-center p-4 md:p-6">
    <div className="flex items-center justify-center gap-4">
      <PdfFileIcon className="w-10 h-10 text-indigo-400" />
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">Image to PDF Converter 🖼️&rarr;📄</h1>
        <p className="text-slate-400 mt-1 max-w-2xl mx-auto">
          Quickly combine multiple JPG & PNG files into a single PDF. 
          <br className="hidden md:block" />
          Fast, free, and secure—your files never leave your browser. 🚀
        </p>
      </div>
    </div>
  </header>
);

interface UploaderProps {
  onFileUpload: (files: FileList) => void;
  error: string | null;
}

const Uploader: React.FC<UploaderProps> = ({ onFileUpload, error }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLabelClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onFileUpload(e.target.files);
        }
        e.target.value = ''; // Allow re-uploading the same file
    }

    return (
        <div className="w-full max-w-lg mx-auto">
            <label
              onClick={handleLabelClick}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLabelClick(); }}
              tabIndex={0}
              className="relative block w-full h-60 sm:h-64 rounded-lg border-2 border-dashed border-slate-600 hover:border-indigo-500 transition-colors duration-300 group cursor-pointer flex flex-col items-center justify-center text-center p-4"
              aria-label="Upload images"
              role="button"
            >
              <div className="flex flex-col items-center justify-center space-y-4 text-slate-400 group-hover:text-indigo-400 transition-colors duration-300">
                <UploadIcon className="w-16 h-16" />
                <span className="font-semibold text-base sm:text-lg">Click to upload or drag and drop 👇</span>
                <span className="text-sm">Supports: PNG, JPG ✅</span>
              </div>
              <input
                ref={fileInputRef}
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept="image/png, image/jpeg"
                multiple
                onChange={handleFileChange}
              />
            </label>
            {error && <p role="alert" className="mt-4 text-center text-red-400 font-medium">⚠️ {error}</p>}
        </div>
    );
}

interface Preview {
    file: File;
    url: string;
}
  
interface PreviewerProps {
    previews: Preview[];
    isConverting: boolean;
    imageQuality: number;
    onConvert: () => void;
    onReset: () => void;
    onRemove: (index: number) => void;
    onReorder: (fromIndex: number, toIndex: number) => void;
    onAddMoreFiles: (files: FileList) => void;
    onQualityChange: (quality: number) => void;
}

const Previewer: React.FC<PreviewerProps> = ({ previews, isConverting, imageQuality, onConvert, onReset, onRemove, onReorder, onAddMoreFiles, onQualityChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleAddMoreClick = () => fileInputRef.current?.click();
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onAddMoreFiles(e.target.files);
        }
        e.target.value = ''; // Allow re-uploading the same file
    }

    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6">
        <div role="list" className="w-full max-h-[50vh] overflow-y-auto space-y-3 bg-slate-800/50 border border-slate-700 rounded-lg p-3">
          {previews.map((preview, index) => (
            <div role="listitem" key={preview.url} className="flex flex-col sm:flex-row items-center justify-between gap-x-4 gap-y-3 p-2 bg-slate-800 rounded-md shadow-md animate-fade-in">
              <div className="flex items-center gap-3 flex-grow min-w-0 w-full">
                <span className="text-slate-400 font-semibold w-6 text-center">{index + 1}.</span>
                <img src={preview.url} alt={`Preview of ${preview.file.name}`} className="w-16 h-16 object-cover rounded-md border-2 border-slate-700 flex-shrink-0" />
                <div className="flex-grow text-sm text-slate-300 truncate" title={preview.file.name}>
                  {preview.file.name}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onReorder(index, index - 1)}
                  disabled={index === 0}
                  className="p-3 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label={`Move ${preview.file.name} up in the list`}
                  title="Move Up"
                >
                  <ArrowUpIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onReorder(index, index + 1)}
                  disabled={index === previews.length - 1}
                  className="p-3 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label={`Move ${preview.file.name} down in the list`}
                  title="Move Down"
                >
                  <ArrowDownIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onRemove(index)}
                  className="p-3 rounded-full text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                  aria-label={`Remove ${preview.file.name}`}
                  title="Remove Image"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="w-full max-w-md px-4">
            <label htmlFor="quality-slider" className="block text-sm font-medium text-slate-300 mb-2 text-center">
                Image Quality: <span className="font-bold text-indigo-400">{imageQuality}%</span>
            </label>
            <input
                id="quality-slider"
                type="range"
                min="50"
                max="100"
                value={imageQuality}
                onChange={(e) => onQualityChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
                disabled={isConverting}
                aria-label="Image quality"
                aria-valuetext={`${imageQuality} percent`}
                aria-valuemin={50}
                aria-valuemax={100}
            />
            <p className="text-xs text-slate-500 text-center mt-1">Lower quality significantly reduces PDF file size.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-5 py-3 font-semibold text-white bg-slate-600 hover:bg-slate-500 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
            disabled={isConverting}
            title="Start Over with New Images"
            aria-label="Start over with new images"
          >
            <ResetIcon className="w-5 h-5" />
            Start Over 🔄
          </button>
           <button
            onClick={handleAddMoreClick}
            className="flex items-center justify-center gap-2 px-5 py-3 font-semibold text-white bg-indigo-500 hover:bg-indigo-400 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
            disabled={isConverting}
            title="Add More Images"
            aria-label="Add more images to the list"
          >
            <AddIcon className="w-5 h-5" />
            Add More ➕
          </button>
           <input type="file" ref={fileInputRef} multiple accept="image/png, image/jpeg" onChange={handleFileChange} className="sr-only" />
          <button
            onClick={onConvert}
            disabled={isConverting || previews.length === 0}
            className="flex items-center justify-center gap-3 w-48 px-5 py-3 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-75 disabled:cursor-not-allowed"
            aria-label="Convert images to PDF"
            aria-live="polite"
            aria-busy={isConverting}
          >
            {isConverting ? (
              <>
                <SpinnerIcon />
                <span>Converting... ⏳</span>
              </>
            ) : (
              <span>Convert to PDF ✨</span>
            )}
          </button>
        </div>
      </div>
    );
  };
  
interface DownloadReadyProps {
  url: string;
  onReset: () => void;
}

const DownloadReady: React.FC<DownloadReadyProps> = ({ url, onReset }) => (
  <div className="w-full max-w-md mx-auto text-center bg-slate-800/50 border border-slate-700 rounded-lg p-8 animate-fade-in">
    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Your PDF is Ready! 🎉</h2>
    <p className="text-slate-400 mb-8">Click the button below to download your file.</p>
    <div className="flex flex-col items-center gap-4">
      <a
        href={url}
        download="converted-images.pdf"
        className="flex items-center justify-center gap-3 w-full max-w-xs px-5 py-3 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        aria-label="Download the generated PDF"
      >
        <DownloadIcon className="w-6 h-6" />
        <span>Download PDF</span>
      </a>
      <button
        onClick={onReset}
        className="flex items-center justify-center gap-2 w-full max-w-xs px-5 py-3 font-semibold text-white bg-slate-600 hover:bg-slate-500 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
        aria-label="Create another PDF"
      >
        <ResetIcon className="w-5 h-5" />
        Create Another PDF 🔄
      </button>
    </div>
  </div>
);

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-700">
      <header className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 id="modal-title" className="text-xl font-semibold text-white">{title}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close modal">
          <CloseIcon className="w-6 h-6" />
        </button>
      </header>
      <div className="p-6 overflow-y-auto text-slate-300 space-y-4">
        {children}
      </div>
    </div>
  </div>
);

const Footer: React.FC<{ onLinkClick: (page: 'about' | 'privacy' | 'contact') => void }> = ({ onLinkClick }) => (
    <footer className="text-center p-4 text-slate-500 text-sm">
      <div className="flex justify-center gap-x-6 gap-y-2 flex-wrap mb-2">
        <button onClick={() => onLinkClick('about')} className="hover:text-indigo-400 transition-colors">About Us</button>
        <button onClick={() => onLinkClick('privacy')} className="hover:text-indigo-400 transition-colors">Privacy Policy</button>
        <button onClick={() => onLinkClick('contact')} className="hover:text-indigo-400 transition-colors">Contact</button>
      </div>
      <p>© 2025 All rights reserved.</p>
    </footer>
);

const SeoContent: React.FC = () => (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12 text-slate-300">
      <div className="space-y-12">
        
        {/* How it works */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">How It Works in 3 Simple Steps 🚀</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
              <div className="text-4xl mb-3">1.</div>
              <h3 className="text-lg sm:text-xl font-semibold text-indigo-400 mb-2">Upload Your Images</h3>
              <p className="text-slate-400">Click the upload area to select multiple JPG or PNG files, or simply drag and drop them.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
              <div className="text-4xl mb-3">2.</div>
              <h3 className="text-lg sm:text-xl font-semibold text-indigo-400 mb-2">Arrange & Adjust</h3>
              <p className="text-slate-400">Reorder your images as needed. Use the quality slider to balance file size and clarity.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
              <div className="text-4xl mb-3">3.</div>
              <h3 className="text-lg sm:text-xl font-semibold text-indigo-400 mb-2">Convert & Download</h3>
              <p className="text-slate-400">Click 'Convert to PDF'. Your file will be generated instantly and downloaded to your device.</p>
            </div>
          </div>
        </section>
  
        {/* Features */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">Key Features You'll Love ❤️</h2>
          <ul className="grid md:grid-cols-2 gap-x-8 gap-y-4 max-w-3xl mx-auto text-left">
            <li className="flex items-start gap-3"><span className="text-indigo-400 mt-1">✓</span><span><strong>Total Privacy Guaranteed:</strong> All conversions are processed locally in your browser. Your files never leave your computer.</span></li>
            <li className="flex items-start gap-3"><span className="text-indigo-400 mt-1">✓</span><span><strong>Batch Conversion:</strong> Combine multiple images into a single, organized PDF document with ease.</span></li>
            <li className="flex items-start gap-3"><span className="text-indigo-400 mt-1">✓</span><span><strong>Image Quality Control:</strong> Adjust the compression level to optimize PDF file size without sacrificing too much quality.</span></li>
            <li className="flex items-start gap-3"><span className="text-indigo-400 mt-1">✓</span><span><strong>Completely Free, No Limits:</strong> Convert unlimited images without watermarks, sign-ups, or hidden costs.</span></li>
            <li className="flex items-start gap-3"><span className="text-indigo-400 mt-1">✓</span><span><strong>Supports Popular Formats:</strong> Effortlessly convert both PNG and JPG/JPEG files.</span></li>
            <li className="flex items-start gap-3"><span className="text-indigo-400 mt-1">✓</span><span><strong>Instant & Offline:</strong> The tool is lightning-fast and works even without an internet connection after the initial load.</span></li>
          </ul>
        </section>
  
        {/* FAQ */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">Frequently Asked Questions 🤔</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <details className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 cursor-pointer">
              <summary className="font-semibold text-white list-none flex justify-between items-center">Are my images secure? <span className="text-slate-500">+</span></summary>
              <p className="text-slate-400 mt-2">Absolutely. This tool operates 100% on your device. Your images are never uploaded to any server, ensuring complete privacy and security. What happens on your computer, stays on your computer.</p>
            </details>
            <details className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 cursor-pointer">
              <summary className="font-semibold text-white list-none flex justify-between items-center">Is this image to PDF converter really free? <span className="text-slate-500">+</span></summary>
              <p className="text-slate-400 mt-2">Yes, it's completely free to use with no limitations. We believe in providing simple, accessible tools for everyone.</p>
            </details>
            <details className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 cursor-pointer">
              <summary className="font-semibold text-white list-none flex justify-between items-center">Can I use this on my Mac, Windows, or mobile device? <span className="text-slate-500">+</span></summary>
              <p className="text-slate-400 mt-2">Yes! Since it's a web-based tool, it works on any modern operating system with a compatible browser, including Windows, macOS, Linux, iOS, and Android.</p>
            </details>
            <details className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 cursor-pointer">
              <summary className="font-semibold text-white list-none flex justify-between items-center">Can I reorder the images before converting? <span className="text-slate-500">+</span></summary>
              <p className="text-slate-400 mt-2">Of course. Once you've uploaded your images, you can use the up and down arrows next to each preview to arrange them in the perfect order for your final PDF document.</p>
            </details>
          </div>
        </section>
        
      </div>
    </div>
  );

// --- Main App Component ---

export default function App() {
  const [imagePreviews, setImagePreviews] = useState<Preview[]>([]);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<{title: string; content: React.ReactNode} | null>(null);
  const [imageQuality, setImageQuality] = useState<number>(92);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Using a ref to hold the current previews for cleanup on unmount.
  // This prevents the effect from re-running every time previews are added,
  // which was causing premature URL revocation.
  const previewsRef = useRef(imagePreviews);
  previewsRef.current = imagePreviews;

  useEffect(() => {
    // This effect cleans up the PDF blob URL when it's no longer needed (e.g., on reset or unmount).
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  useEffect(() => {
    // This effect cleans up all image preview URLs on component unmount to prevent memory leaks.
    return () => {
      previewsRef.current.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount.
  
  const processFiles = (files: FileList) => {
    setError(null);
    const validFiles = Array.from(files).filter(file =>
        file.type === 'image/png' || file.type === 'image/jpeg'
    );

    if (validFiles.length !== files.length) {
        setError('Some files were not valid. Only PNG and JPG are accepted.');
    }

    if (validFiles.length > 0) {
        const newPreviews = validFiles.map(file => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleReset = useCallback(() => {
    imagePreviews.forEach(p => URL.revokeObjectURL(p.url));
    setImagePreviews([]);
    setError(null);
    // The useEffect for pdfUrl will handle revoking the object URL when state is set to null
    setPdfUrl(null);
  }, [imagePreviews]);

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    const previewToRemove = imagePreviews[indexToRemove];
    if (previewToRemove) {
      URL.revokeObjectURL(previewToRemove.url);
      setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    }
  }, [imagePreviews]);

  const handleReorderImage = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= imagePreviews.length) return;
    const newPreviews = [...imagePreviews];
    const [movedItem] = newPreviews.splice(fromIndex, 1);
    newPreviews.splice(toIndex, 0, movedItem);
    setImagePreviews(newPreviews);
  }, [imagePreviews]);

  const handleConvertToPdf = useCallback(async () => {
    if (imagePreviews.length === 0) return;

    setIsConverting(true);
    setError(null);

    try {
        const { jsPDF } = window.jspdf;
        let pdf: any = null; // jsPDF instance
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not create canvas context');
        }

        for (const [index, preview] of imagePreviews.entries()) {
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                const image = new Image();
                image.src = preview.url;
                image.onload = () => resolve(image);
                image.onerror = (err) => reject(new Error(`Failed to load image: ${preview.file.name}`));
            });

            const width = img.naturalWidth;
            const height = img.naturalHeight;
            const orientation = width > height ? 'l' : 'p';
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // Get compressed image data URL
            const dataUrl = canvas.toDataURL('image/jpeg', imageQuality / 100);

            if (index === 0) {
                pdf = new jsPDF({
                    orientation,
                    unit: 'px',
                    format: [width, height],
                });
            } else {
                pdf.addPage([width, height], orientation);
            }
            
            pdf.addImage(dataUrl, 'JPEG', 0, 0, width, height);
        }

        if (pdf) {
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);

            imagePreviews.forEach(p => URL.revokeObjectURL(p.url));
            setImagePreviews([]);
        }

    } catch (err: any) {
        setError(err.message || 'An error occurred during PDF conversion.');
        console.error(err);
    } finally {
        setIsConverting(false);
    }
}, [imagePreviews, imageQuality]);

  const pages = {
    'about': {
      title: 'About Us',
      content: (
        <>
          <p>This Image to PDF Converter is a free, simple, and powerful tool designed to make your life easier. Our mission is to provide a fast, secure, and user-friendly solution for converting your images (PNG, JPG) into high-quality PDF documents without any hassle. ✨</p>
          <h3 className="text-lg font-semibold text-white mt-4">Why Choose Us? 🤔</h3>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li><strong>🛡️ Privacy First:</strong> We respect your privacy. All conversions happen directly in your browser. Your files are never uploaded to any server, ensuring your data remains completely private and secure.</li>
            <li><strong>⚡ Blazing Fast:</strong> Since there are no uploads or downloads from a server, the conversion process is almost instantaneous.</li>
            <li><strong>💯 No Limits:</strong> Convert as many images as you want, for free. There are no watermarks, file size limits, or registration requirements.</li>
            <li><strong>🎨 Simple Interface:</strong> We believe in simplicity. Our clean and intuitive interface allows you to convert your images in just a few clicks.</li>
          </ul>
        </>
      )
    },
    'privacy': {
      title: 'Privacy Policy',
      content: (
        <>
          <p>Your privacy is critically important to us. 🔒 This policy outlines how we handle your information.</p>
          <h3 className="text-lg font-semibold text-white mt-4">No Data Collection</h3>
          <p>We do not collect, store, or transmit any of your personal data or the files you process. The entire conversion process from image to PDF is performed locally on your computer, within your web browser.</p>
          <h3 className="text-lg font-semibold text-white mt-4">Client-Side Processing</h3>
          <p>Your images are not uploaded to our servers or any third-party service. They remain on your device at all times. This ensures the highest level of security and privacy for your sensitive documents.</p>
           <h3 className="text-lg font-semibold text-white mt-4">Cookies</h3>
          <p>We do not use cookies or any tracking technologies to monitor your activity on our site.</p>
          <p className="mt-4">If you have any questions about our Privacy Policy, please feel free to contact us.</p>
        </>
      )
    },
    'contact': {
      title: 'Contact Us',
      content: (
        <p>Have questions, feedback, or suggestions? We'd love to hear from you! 👋 Please reach out to us at <a href="mailto:support@imagetopdf.com" className="text-indigo-400 hover:underline">📧 support@imagetopdf.com</a>.</p>
      )
    }
  };

  const openModal = (page: 'about' | 'privacy' | 'contact') => {
    setModalContent(pages[page]);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col p-2 sm:p-4">
      <Header />
      <main className="flex-grow flex items-center justify-center py-8">
        {pdfUrl ? (
          <DownloadReady url={pdfUrl} onReset={handleReset} />
        ) : imagePreviews.length === 0 ? (
          <Uploader onFileUpload={processFiles} error={error} />
        ) : (
          <Previewer
            previews={imagePreviews}
            isConverting={isConverting}
            imageQuality={imageQuality}
            onConvert={handleConvertToPdf}
            onReset={handleReset}
            onRemove={handleRemoveImage}
            onReorder={handleReorderImage}
            onAddMoreFiles={processFiles}
            onQualityChange={setImageQuality}
          />
        )}
      </main>
      
      <div className="my-8">
        <hr className="border-t border-slate-700/50 max-w-4xl mx-auto" />
      </div>
      <SeoContent />

      <Footer onLinkClick={openModal} />
       {modalContent && (
        <Modal title={modalContent.title} onClose={closeModal}>
          {modalContent.content}
        </Modal>
      )}
    </div>
  );
}
