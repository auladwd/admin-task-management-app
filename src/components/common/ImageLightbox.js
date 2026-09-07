'use client';

import { useState, useEffect } from 'react';
import {
  FiX,
  FiExternalLink,
  FiDownload,
  FiFileText,
  FiImage,
  FiChevronLeft,
  FiChevronRight,
  FiZoomIn,
  FiZoomOut,
  FiRotateCcw,
  FiLayers,
  FiMaximize2,
  FiInfo,
} from 'react-icons/fi';
import { isPdfUrl, getPdfPageUrl } from '@/utils/helpers';

/**
 * Modern Media Lightbox Modal for previewing Images and Multi-page PDF Documents
 * Includes built-in high-resolution rasterized page reader with zoom and navigation,
 * plus optional native browser PDF viewer.
 */
export default function ImageLightbox({
  isOpen,
  onClose,
  src,
  title = 'Document Preview',
}) {
  const [isPdf, setIsPdf] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [viewerMode, setViewerMode] = useState('page'); // 'page' | 'browser'
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && isPdf && viewerMode === 'page') handleNextPage();
      if (e.key === 'ArrowLeft' && isPdf && viewerMode === 'page') handlePrevPage();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setCurrentPage(1);
      setZoom(100);
      setViewerMode('page');
      setHasReachedEnd(false);
      setImageLoading(true);
      setIsPdf(isPdfUrl(src));
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, src]);

  if (!isOpen || !src) return null;

  const handleNextPage = () => {
    if (!hasReachedEnd) {
      setImageLoading(true);
      setCurrentPage(p => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setImageLoading(true);
      setHasReachedEnd(false);
      setCurrentPage(p => p - 1);
    }
  };

  const handleZoomIn = () => {
    setZoom(z => Math.min(z + 25, 250));
  };

  const handleZoomOut = () => {
    setZoom(z => Math.max(z - 25, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const currentPdfPageUrl = isPdf ? getPdfPageUrl(src, currentPage, 1600) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-fadeIn">
      {/* Modal Dialog */}
      <div className="relative max-w-5xl max-h-[96vh] w-full flex flex-col items-center bg-base-100 rounded-2xl overflow-hidden shadow-2xl border border-base-300/40">
        
        {/* ── Top Header ── */}
        <div className="w-full flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 bg-base-200/90 border-b border-base-300">
          <div className="flex items-center gap-2 max-w-[55%] sm:max-w-[60%] min-w-0">
            {isPdf ? (
              <span className="badge badge-error badge-sm text-white font-bold gap-1 flex-shrink-0">
                <FiFileText className="w-3 h-3" /> PDF
              </span>
            ) : (
              <span className="badge badge-primary badge-sm font-semibold gap-1 flex-shrink-0">
                <FiImage className="w-3 h-3" /> Image
              </span>
            )}
            <h4
              className="font-semibold text-xs sm:text-sm truncate text-base-content"
              title={title}
            >
              {title}
            </h4>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* View Mode Switcher for PDF */}
            {isPdf && (
              <div className="join border border-base-300 rounded-lg overflow-hidden hidden sm:inline-flex">
                <button
                  type="button"
                  onClick={() => setViewerMode('page')}
                  className={`btn btn-xs join-item font-medium ${
                    viewerMode === 'page'
                      ? 'btn-primary text-primary-content'
                      : 'btn-ghost'
                  }`}
                >
                  <FiLayers className="w-3 h-3" /> Document View
                </button>
                <button
                  type="button"
                  onClick={() => setViewerMode('browser')}
                  className={`btn btn-xs join-item font-medium ${
                    viewerMode === 'browser'
                      ? 'btn-primary text-primary-content'
                      : 'btn-ghost'
                  }`}
                >
                  Browser Reader
                </button>
              </div>
            )}

            {/* Direct Open in New Tab */}
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-xs gap-1 text-base-content/80 hover:text-primary"
              title="Open direct file in new tab"
            >
              <FiExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Open</span>
            </a>

            {/* Download */}
            <a
              href={src}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-xs gap-1 text-base-content/80 hover:text-primary"
              title="Download file"
            >
              <FiDownload className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Download</span>
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              className="btn btn-ghost btn-xs btn-circle text-base-content hover:bg-base-300"
              title="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Sub-toolbar for PDF Page View ── */}
        {isPdf && viewerMode === 'page' && (
          <div className="w-full flex flex-wrap items-center justify-between px-4 py-2 bg-base-300/60 border-b border-base-300 text-xs gap-2">
            {/* Page Navigation */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="btn btn-xs btn-outline btn-neutral gap-1"
                title="Previous Page (Left Arrow)"
              >
                <FiChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <span className="font-semibold px-2 py-0.5 bg-base-100 rounded-md shadow-xs border border-base-300">
                Page {currentPage}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={hasReachedEnd}
                className="btn btn-xs btn-outline btn-neutral gap-1"
                title="Next Page (Right Arrow)"
              >
                Next <FiChevronRight className="w-3.5 h-3.5" />
              </button>
              {hasReachedEnd && (
                <span className="text-[11px] text-warning font-medium ml-1">
                  (End of document)
                </span>
              )}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="btn btn-ghost btn-xs btn-circle"
                title="Zoom Out"
              >
                <FiZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] min-w-[40px] text-center font-bold">
                {zoom}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 250}
                className="btn btn-ghost btn-xs btn-circle"
                title="Zoom In"
              >
                <FiZoomIn className="w-3.5 h-3.5" />
              </button>
              {zoom !== 100 && (
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="btn btn-ghost btn-xs text-[11px]"
                  title="Reset Zoom"
                >
                  <FiRotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Main Display Body ── */}
        <div className="relative w-full flex-1 flex items-center justify-center bg-base-300/20 overflow-auto max-h-[calc(96vh-110px)] p-2 sm:p-4">
          {/* PDF Page Mode (High-res Rasterized View) */}
          {isPdf && viewerMode === 'page' && (
            <div className="relative flex flex-col items-center justify-center min-h-[50vh] w-full">
              {imageLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-100/60 z-10 backdrop-blur-xs">
                  <span className="loading loading-spinner loading-md text-primary"></span>
                  <span className="text-xs text-base-content/70 mt-2 font-medium">
                    Rendering page {currentPage}...
                  </span>
                </div>
              )}

              <div
                className="transition-transform origin-top duration-200 flex justify-center shadow-xl rounded-lg bg-white overflow-hidden border border-base-300"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                <img
                  key={`${src}-page-${currentPage}`}
                  src={currentPdfPageUrl}
                  alt={`Page ${currentPage} of ${title}`}
                  className="max-h-[75vh] w-auto max-w-full object-contain select-none"
                  onLoad={() => {
                    setImageLoading(false);
                  }}
                  onError={() => {
                    setImageLoading(false);
                    if (currentPage > 1) {
                      setHasReachedEnd(true);
                      setCurrentPage(p => p - 1);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* PDF Browser Iframe Mode */}
          {isPdf && viewerMode === 'browser' && (
            <div className="w-full h-[78vh] flex flex-col bg-base-100 rounded-lg overflow-hidden border border-base-300">
              <div className="p-2 bg-info/10 text-info border-b border-info/20 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FiInfo className="w-4 h-4 flex-shrink-0" />
                  সরাসরি ব্রাউজারে PDF লোড না হলে উপরের <b>"Document View"</b> বাটনে ক্লিক করুন।
                </span>
                <button
                  type="button"
                  onClick={() => setViewerMode('page')}
                  className="btn btn-xs btn-primary ml-2"
                >
                  Switch to Document View
                </button>
              </div>
              <iframe
                src={`${src}#toolbar=1&navpanes=1`}
                className="w-full flex-1 border-0 bg-white"
                title={title}
              />
            </div>
          )}

          {/* Standard Image View */}
          {!isPdf && (
            <div className="relative w-full flex items-center justify-center max-h-[78vh] overflow-auto">
              <img
                src={src}
                alt={title}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-lg select-none transition-transform"
              />
            </div>
          )}
        </div>
      </div>

      {/* Backdrop Click to Close */}
      <div className="fixed inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
}
