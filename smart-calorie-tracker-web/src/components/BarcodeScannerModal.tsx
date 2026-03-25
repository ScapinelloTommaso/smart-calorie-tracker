import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductFound: (productName: string) => void;
}

// Optimized scanner config for EAN barcodes
const SCANNER_CONFIG = {
  fps: 10,
  qrbox: { width: 250, height: 150 },
  aspectRatio: 1.0,
  formatsToSupport: [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
  ],
  videoConstraints: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
  },
};

export default function BarcodeScannerModal({ isOpen, onClose, onProductFound }: BarcodeScannerModalProps) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);

  const lookupProduct = async (barcode: string) => {
    setScannedBarcode(barcode);
    setIsLookingUp(true);
    
    try {
      const { data } = await axios.get(
        `https://it.openfoodfacts.org/api/v0/product/${barcode}.json`
      );

      if (data.status === 1 && data.product) {
        const name = data.product.product_name_it || data.product.product_name || '';
        if (name && mountedRef.current) {
          onProductFound(name);
          onClose();
          return;
        }
      }
      
      if (mountedRef.current) {
        setError(`Prodotto non trovato per il codice ${barcode}. Prova un altro.`);
        setIsLookingUp(false);
      }
    } catch {
      if (mountedRef.current) {
        setError('Errore nella ricerca del prodotto. Riprova.');
        setIsLookingUp(false);
      }
    }
  };

  const createScanCallback = (scanner: Html5Qrcode) => {
    return async (decodedText: string) => {
      if (!mountedRef.current) return;
      
      try { await scanner.stop(); } catch { /* may already be stopped */ }
      await lookupProduct(decodedText);

      // If lookup failed and we're still mounted, restart scanner for retry
      if (mountedRef.current && !isLookingUp) {
        try {
          await scanner.start(
            SCANNER_CONFIG.videoConstraints,
            { fps: SCANNER_CONFIG.fps, qrbox: SCANNER_CONFIG.qrbox, aspectRatio: SCANNER_CONFIG.aspectRatio },
            createScanCallback(scanner),
            () => {}
          );
        } catch { /* silent */ }
      }
    };
  };

  useEffect(() => {
    mountedRef.current = true;
    
    if (!isOpen) return;

    const startScanner = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const scanner = new Html5Qrcode('barcode-reader', {
          formatsToSupport: SCANNER_CONFIG.formatsToSupport,
          verbose: false,
        });
        scannerRef.current = scanner;

        await scanner.start(
          SCANNER_CONFIG.videoConstraints,
          {
            fps: SCANNER_CONFIG.fps,
            qrbox: SCANNER_CONFIG.qrbox,
            aspectRatio: SCANNER_CONFIG.aspectRatio,
          },
          createScanCallback(scanner),
          () => { /* ignore scan failures */ }
        );

        if (mountedRef.current) {
          setIsLoading(false);
        }
      } catch (err: any) {
        if (mountedRef.current) {
          setIsLoading(false);
          const msg = err?.message ?? '';
          const isPermissionError = 
            msg.includes('NotAllowedError') || 
            msg.includes('Permission') || 
            msg.includes('denied') ||
            msg.includes('permission');
          if (isPermissionError) {
            setError('Accesso alla fotocamera negato o non disponibile. Verifica i permessi nella barra degli indirizzi del browser.');
          } else {
            setError('Impossibile avviare la fotocamera. Verifica che il dispositivo abbia una fotocamera disponibile.');
          }
        }
      }
    };

    startScanner();

    return () => {
      mountedRef.current = false;
      cleanupScanner();
    };
  }, [isOpen]);

  const cleanupScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING
          await scannerRef.current.stop();
        }
      } catch { /* already stopped */ }
      scannerRef.current = null;
    }
  };

  const handleClose = () => {
    cleanupScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700/50 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4">
          <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Camera size={22} className="text-cyan-400" /> Scanner
          </h3>
          <button 
            onClick={handleClose} 
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 bg-slate-50 dark:bg-slate-900 rounded-full"
          >
            <X size={22} strokeWidth={3} />
          </button>
        </div>

        {/* Scanner viewport */}
        <div className="px-6 pb-2">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
            <div id="barcode-reader" className="w-full h-full" />
            
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 text-white">
                <Loader2 size={32} className="animate-spin text-cyan-400 mb-3" />
                <p className="text-sm font-bold">Avvio fotocamera...</p>
              </div>
            )}

            {isLookingUp && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 text-white">
                <Loader2 size={32} className="animate-spin text-emerald-400 mb-3" />
                <p className="text-sm font-bold">Cerco: {scannedBarcode}</p>
              </div>
            )}
          </div>
        </div>

        {/* Error / Info */}
        <div className="px-6 py-4">
          {error ? (
            <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl p-3 border border-rose-200 dark:border-rose-800/40">
              <AlertCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          ) : (
            <p className="text-center text-xs font-bold text-slate-400 dark:text-slate-500">
              Inquadra il codice a barre del prodotto
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
