/*
 * QR Code Modal — Generate QR code for an event's Partiful link
 */
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { X, Download } from "lucide-react";
import type { Event } from "@/data/types";

function cleanTitle(title: string): string {
  return title.replace(/\s*-?\s*#\s*AZTECHWEEK/gi, "").replace(/\s*#AZTECHWEEK/gi, "").replace(/\s+/g, " ").trim();
}

interface QRCodeModalProps {
  event: Event | null;
  onClose: () => void;
}

export default function QRCodeModal({ event, onClose }: QRCodeModalProps) {
  if (!event) return null;

  const handleDownload = () => {
    const svg = document.querySelector("#qr-code-svg svg") as SVGElement;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      const link = document.createElement("a");
      link.download = `aztw-${event.id}-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-xs w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Event QR Code</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div id="qr-code-svg" className="flex justify-center mb-4 p-4 bg-white rounded-xl">
            <QRCodeSVG
              value={event.link}
              size={200}
              level="M"
              bgColor="#ffffff"
              fgColor="#0d9488"
              includeMargin={false}
            />
          </div>

          <p className="text-xs font-semibold text-gray-900 dark:text-white text-center mb-1 line-clamp-2">
            {cleanTitle(event.title)}
          </p>
          <p className="text-[10px] text-gray-500 text-center mb-4">
            Scan to RSVP on Partiful
          </p>

          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Download QR Code
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
