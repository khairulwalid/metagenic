import React from 'react';
import { Copy, Check, Hash, Type, AlignLeft, Download, FileEdit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { StockMetadata } from '@/lib/gemini';
import { motion, AnimatePresence } from 'motion/react';

interface MetadataResultProps {
  metadata: StockMetadata;
  originalFile: File | null;
}

export function MetadataResult({ metadata, originalFile }: MetadataResultProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadRenamedFile = () => {
    if (!originalFile) return;

    // Create a slug from the title
    const extension = originalFile.name.split('.').pop();
    const slug = metadata.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Trim hyphens
    
    const newFileName = `${slug}.${extension}`;

    const url = URL.createObjectURL(originalFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = newFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`File successfully downloaded as: ${newFileName}`);
  };

  const keywordsString = metadata.keywords.join(', ');

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Action Bar */}
          <div className="flex justify-end mb-4">
            <Button 
              onClick={downloadRenamedFile}
              className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-6 shadow-md shadow-green-500/20 transition-all hover:scale-105"
            >
              <Download className="mr-2 h-4 w-4" />
              Download with New Name
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Title & Description */}
            <div className="space-y-6">
              <Card className="overflow-hidden border border-border shadow-sm bg-white/50 backdrop-blur-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Type className="h-4 w-4 text-primary" />
                    Title
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(metadata.title, 'Title')}
                    >
                      {copiedField === 'Title' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold leading-tight">{metadata.title}</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border border-border shadow-sm bg-white/50 backdrop-blur-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlignLeft className="h-4 w-4 text-primary" />
                    Description
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyToClipboard(metadata.description, 'Description')}
                  >
                    {copiedField === 'Description' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{metadata.description}</p>
                </CardContent>
              </Card>
            </div>

            {/* Keywords */}
            <Card className="border border-border shadow-sm bg-white/50 backdrop-blur-sm flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" />
                  Keywords ({metadata.keywords.length})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(keywordsString, 'Keywords')}
                >
                  {copiedField === 'Keywords' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-[240px] pr-4">
                  <div className="flex flex-wrap gap-2">
                    {metadata.keywords.map((keyword, i) => (
                      <Badge key={i} variant="secondary" className="font-mono text-[10px] py-1 px-2 bg-white border-border hover:bg-primary/10 hover:text-primary transition-colors shadow-sm">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
