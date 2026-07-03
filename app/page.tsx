import { ArrowUpRight, Blocks, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 py-10 text-foreground">
      <Card className="w-full max-w-xl">
        <CardHeader className="gap-5">
          <div className="flex items-center justify-between gap-4">
            <Badge variant="secondary" className="w-fit gap-1.5">
              <CheckCircle2 className="size-3.5" />
              Ready
            </Badge>
            <Blocks className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <CardTitle className="text-2xl">QA New Starter</CardTitle>
            <CardDescription>
              Next.js App Router, TypeScript, Biome, shadcn/ui, and lucide-react
              are wired for a clean starting point.
            </CardDescription>
          </div>
          <Button className="w-fit">
            Dummy action
            <ArrowUpRight data-icon="inline-end" />
          </Button>
        </CardHeader>
      </Card>
    </main>
  );
}
