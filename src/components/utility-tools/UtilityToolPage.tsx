"use client";

import type { UtilityToolDefinition } from "@/types/utility-tools";
import type { ToolImpl } from "@/lib/tools/utility-tool-resolver";
import { UtilityToolShell } from "./UtilityToolShell";
import { GeneratorTool } from "./GeneratorTool";
import { CounterTool } from "./CounterTool";
import { TextTransformTool } from "./TextTransformTool";
import { CalculatorTool } from "./CalculatorTool";
import { ImageProcessorTool } from "./ImageProcessorTool";
import type { UtilityToolField } from "./GeneratorTool";

type Props = {
  tool: UtilityToolDefinition;
  impl: ToolImpl;
};

export function UtilityToolPage({ tool, impl }: Props) {
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
