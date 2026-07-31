import Markdown from "react-markdown";
import React from "react";
import remarkGfm from "remark-gfm";
import styles from "./styles.module.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui";
import { DiscoveryCallButton, ScrollArea } from "@/features/chat";
import { Download } from "lucide-react";
import { IPdfSection } from "@/shared/api";
import { v4 as uuidV4 } from "uuid";

interface IQuoteArtifact {
  handleDownload(): void;
  onScheduleCall(name: string, email: string, message: string): Promise<void>;
  pdfContent: string;
  pdfSections: IPdfSection[];
}

function QuoteArtifactComponent(props: Readonly<IQuoteArtifact>) {
  const { handleDownload, onScheduleCall, pdfContent, pdfSections } = props;

  return (
    <div className="flex flex-col h-full bg-[#00171d]">
      <div className="border-b border-white/10 p-4">
        <h2 className="text-xl font-raleway font-semibold text-white">
          Leanware Project Quote
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-8 p-4">
          <section
            aria-label="Protected quote content"
            className={styles.protected}
            onContextMenu={(event) => event.preventDefault()}
            onCopy={(event) => event.preventDefault()}
          >
            {pdfSections.length > 0 ? (
              <div className="flex flex-col gap-4">
                {pdfSections.map((pdfSection) => (
                  <Card
                    className="bg-white/5 border-white/10 text-white"
                    key={uuidV4()}
                  >
                    <CardHeader>
                      <CardTitle className="text-primary">
                        {pdfSection.title}
                      </CardTitle>
                      {pdfSection.sub_title && (
                        <CardDescription className="text-white/70">
                          {pdfSection.sub_title}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 text-white/80">
                        <Markdown
                          className="markdown"
                          remarkPlugins={[remarkGfm]}
                        >
                          {pdfSection.content}
                        </Markdown>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Markdown className="markdown" remarkPlugins={[remarkGfm]}>
                {pdfContent}
              </Markdown>
            )}
          </section>
        </div>
      </ScrollArea>

      <div className="border-t border-white/10 p-4 mt-auto">
        <Card className="bg-primary/20 border-primary/30 text-white">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">
              Ready to get started?
            </h3>
            <p className="mb-4">
              Our team is prepared to begin development right away. The next
              step is a detailed discovery call to finalize requirements.
            </p>
            <div className="flex items-center gap-2">
              <DiscoveryCallButton onScheduleCall={onScheduleCall} />
              <button
                className="border border-white/20 text-white px-4 py-2 rounded-md font-medium cursor-pointer hover:bg-white/5 transition-colors flex items-center"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDownload();
                }}
                type="button"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Quote
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const QuoteArtifact = React.memo(QuoteArtifactComponent);
