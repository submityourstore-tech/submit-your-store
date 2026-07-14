"use client";

import { getUtilityTool } from "@/lib/tools/utility-registry";
import { resolveToolImpl } from "@/lib/tools/utility-tool-resolver";
import { UtilityToolShell } from "@/components/utility-tools/UtilityToolShell";
import { GeneratorTool } from "@/components/utility-tools/GeneratorTool";
import { CounterTool } from "@/components/utility-tools/CounterTool";
import { TextTransformTool } from "@/components/utility-tools/TextTransformTool";
import { CalculatorTool } from "@/components/utility-tools/CalculatorTool";
import { ImageProcessorTool } from "@/components/utility-tools/ImageProcessorTool";
import type { UtilityToolField } from "@/components/utility-tools/GeneratorTool";

type Props = { slug: string };

export function UtilityToolClient({ slug }: Props) {
  const tool = getUtilityTool(slug);
  const impl = resolveToolImpl(slug);

  if (!tool || !impl) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#111]">Tool not found</h1>
        <p className="mt-2 text-[#717171]">This tool could not be loaded.</p>
      </div>
    );
  }

  return (
    <UtilityToolShell
      title={tool.name}
      description={tool.description}
      icon={tool.icon}
      category={tool.category}
    >
      {impl.kind === "generator" && (
        <GeneratorTool
          fields={impl.fields as UtilityToolField[]}
          generateFn={impl.generate}
          outputFormat={(impl.outputFormat as "text" | "html" | "json" | "code") ?? "code"}
          outputLabel={tool.outputLabel}
        />
      )}
      {impl.kind === "counter" && (
        <CounterTool analyzeFn={impl.analyzeFn} />
      )}
      {impl.kind === "text-transform" && (
        <TextTransformTool
          transformFn={impl.transformFn}
          options={impl.options as { key: string; label: string; values: { value: string; label: string }[] }[]}
        />
      )}
      {impl.kind === "calculator" && (
        <CalculatorTool
          fields={impl.fields as UtilityToolField[]}
          calculateFn={impl.calculate}
        />
      )}
      {impl.kind === "image-processor" && (
        <ImageProcessorTool
          processFn={impl.processFn}
          outputFormat={impl.outputFormat}
          options={impl.fields as UtilityToolField[]}
        />
      )}
    </UtilityToolShell>
  );
}
