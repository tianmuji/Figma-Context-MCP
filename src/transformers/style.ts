import type { Node as FigmaDocumentNode } from "@figma/rest-api-spec";
import type { SimplifiedFill } from "~/services/simplify-node-response.js";
import { generateCSSShorthand, isVisible, parsePaint } from "~/utils/common.js";
import { hasValue, isStrokeWeights } from "~/utils/identity.js";
export type SimplifiedStroke = {
  colors: SimplifiedFill[];
  strokeWeight?: string;
  strokeDashes?: number[];
  strokeWeights?: string;
  strokeAlign?: "INSIDE" | "OUTSIDE" | "CENTER";
};
export function buildSimplifiedStrokes(n: FigmaDocumentNode): SimplifiedStroke {
  let strokes: SimplifiedStroke = { colors: [] };
  if (hasValue("strokes", n) && Array.isArray(n.strokes) && n.strokes.length) {
    strokes.colors = n.strokes.filter(isVisible).map(parsePaint);
  }

  if (hasValue("strokeWeight", n) && typeof n.strokeWeight === "number" && n.strokeWeight > 0) {
    strokes.strokeWeight = `${n.strokeWeight}px`;
  }

  if (hasValue("strokeDashes", n) && Array.isArray(n.strokeDashes) && n.strokeDashes.length) {
    strokes.strokeDashes = n.strokeDashes;
  }

  if (hasValue("individualStrokeWeights", n, isStrokeWeights)) {
    strokes.strokeWeights = generateCSSShorthand(n.individualStrokeWeights);
  }

  if (hasValue("strokeAlign", n) && typeof n.strokeAlign === "string") {
    const validStrokeAligns = ["INSIDE", "OUTSIDE", "CENTER"] as const;
    if (validStrokeAligns.includes(n.strokeAlign as any)) {
      strokes.strokeAlign = n.strokeAlign as "INSIDE" | "OUTSIDE" | "CENTER";
    }
  }

  return strokes;
}
