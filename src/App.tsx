import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { MediaUploader } from '@/components/MediaUploader';
import { MetadataResult } from '@/components/MetadataResult';
import { generateStockMetadata, StockMetadata } from '@/lib/gemini';
import { Sparkles, RefreshCw, Wand2, Info, LayoutGrid, List, CheckCircle2, Loader2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface ProcessedItem {
  file: File;
  previewUrl: string;
  metadata: StockMetadata | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export default function App() {
  const [items, setItems] = useState<ProcessedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const handleFilesSelect = (selectedFiles: File[]) => {
    const newItems: ProcessedItem[] = selectedFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      metadata: null,
      status: 'pending'
    }));
    
    // Allow up to 5 files
    setItems(prev => [...prev, ...newItems].slice(0, 5));
    if (selectedFiles.length > 5) {
      toast.info('Maximum 5 files allowed. Only the first 5 were added.');
    }
  };

  const processAll = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].status === 'completed') continue;
      
      setCurrentIndex(i);
      setItems(prev => prev.map((item, idx) => 
        idx === i ? { ...item, status: 'processing' } : item
      ));

      try {
        const file = items[i].file;
        const base64 = await fileToBase64(file);
        const result = await generateStockMetadata(base64, file.type);
        
        setItems(prev => prev.map((item, idx) => 
          idx === i ? { ...item, metadata: result, status: 'completed' } : item
        ));
      } catch (error) {
        console.error('Error processing media:', error);
        setItems(prev => prev.map((item, idx) => 
          idx === i ? { ...item, status: 'error' } : item
        ));
        toast.error(`Failed to process ${items[i].file.name}`);
      }
    }

    setIsProcessing(false);
    setCurrentIndex(null);
    toast.success('All files processed successfully!');
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const reset = () => {
    items.forEach(item => URL.revokeObjectURL(item.previewUrl));
    setItems([]);
    setCurrentIndex(null);
  };

  const removeItem = (index: number) => {
    URL.revokeObjectURL(items[index].previewUrl);
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary">
        <div className="mx-auto max-w-5xl px-6 py-12 md:py-20">
          {/* Header */}
          <header className="mb-16 space-y-4 text-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-widest text-primary uppercase border border-primary/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Stock Assistant
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tighter text-foreground"
            >
              metageniec<span className="text-primary">.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed"
            >
              Generate high-converting titles, descriptions, and keywords for your stock media in seconds. 
              Bulk processing enabled for up to 5 files.
            </motion.p>
          </header>

          <main className="space-y-12">
            <AnimatePresence mode="wait">
              {items.length === 0 ? (
                <motion.div
                  key="uploader"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <MediaUploader onFilesSelect={handleFilesSelect} isProcessing={isProcessing} />
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  {/* Bulk Controls */}
                  <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium">
                        {items.length} Files Selected
                      </div>
                      <div className="h-4 w-px bg-white/10" />
                      <div className="text-sm text-muted-foreground">
                        {items.filter(i => i.status === 'completed').length} / {items.length} Processed
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={reset} disabled={isProcessing}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Clear All
                      </Button>
                      {items.some(i => i.status !== 'completed') && (
                        <Button size="sm" onClick={processAll} disabled={isProcessing}>
                          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                          Process All
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.previewUrl}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "group relative overflow-hidden rounded-2xl border bg-white/50 backdrop-blur-sm p-4 transition-all hover:shadow-md",
                          currentIndex === index && "ring-2 ring-primary border-primary/50 bg-primary/5"
                        )}
                      >
                        <div className="flex gap-6">
                          {/* Thumbnail */}
                          <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg border bg-black">
                            {item.file.type.startsWith('video/') ? (
                              <video src={item.previewUrl} className="h-full w-full object-cover" />
                            ) : (
                              <img src={item.previewUrl} alt="Preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.status === 'completed' ? (
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                              ) : item.status === 'processing' ? (
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                              ) : (
                                <Info className="h-8 w-8 text-white/50" />
                              )}
                            </div>
                          </div>

                          {/* Info & Results */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-bold truncate pr-4">{item.file.name}</h4>
                              <div className="flex items-center gap-2">
                                {item.status === 'pending' && <Badge variant="secondary">Pending</Badge>}
                                {item.status === 'processing' && <Badge className="bg-primary/20 text-primary animate-pulse border-primary/30">Processing</Badge>}
                                {item.status === 'completed' && <Badge className="bg-green-500/10 text-green-700 border-green-500/30">Completed</Badge>}
                                {item.status === 'error' && <Badge variant="destructive">Error</Badge>}
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => removeItem(index)} disabled={isProcessing}>
                                  <RefreshCw className="h-4 w-4 rotate-45" />
                                </Button>
                              </div>
                            </div>

                            {item.metadata ? (
                              <MetadataResult metadata={item.metadata} originalFile={item.file} />
                            ) : (
                              <div className="h-24 flex items-center justify-center border border-dashed rounded-lg text-xs text-muted-foreground">
                                {item.status === 'processing' ? "AI is analyzing your media..." : "Waiting to process..."}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Footer Info */}
          <footer className="mt-24 pt-12 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 text-left">
              <div className="space-y-4">
                <h4 className="text-lg font-bold tracking-tighter">metageniec<span className="text-primary">.</span></h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The ultimate AI assistant for stock contributors. Generate metadata that sells.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/70">Resources</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Adobe Stock Guide</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Keyword Best Practices</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/70">Connect</h4>
                <div className="flex gap-4">
                  <a 
                    href="https://www.tiktok.com/@walid.microstocke" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity text-sm font-bold"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-1.13-.32-2.43-.2-3.41.49-.9.63-1.44 1.73-1.43 2.85.01 1.1.4 2.2 1.22 2.94.97.85 2.39 1.13 3.64.78 1.14-.3 2.1-1.2 2.43-2.33.08-.34.1-.69.1-1.04-.01-4.73-.01-9.46-.01-14.19z"/>
                    </svg>
                    Follow on TikTok
                  </a>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-widest">
                <Info className="h-3 w-3" />
                Adobe Stock accepts up to 50 keywords. We generate the most relevant ones first.
              </div>
              <p className="text-xs text-muted-foreground">
                © 2026 metageniec AI. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
        <Toaster position="bottom-center" theme="light" />
      </div>
    </TooltipProvider>
  );
}

function Badge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "secondary" | "destructive" }) {
  const variants = {
    default: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-muted text-muted-foreground border-border",
    destructive: "bg-red-500/10 text-red-600 border-red-500/20"
  };
  
  return (
    <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm", variants[variant], className)}>
      {children}
    </div>
  );
}
