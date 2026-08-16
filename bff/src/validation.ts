import { readFileSync } from "node:fs";
import Ajv2020Module, { type ErrorObject } from "ajv/dist/2020.js";
import type { CalculationRequest } from "./types.js";

const schemaDirectory = new URL("../../contracts/schema/", import.meta.url);
const readSchema = (name: string): object =>
  JSON.parse(readFileSync(new URL(name, schemaDirectory), "utf8"));

const requestSchema = readSchema("calculation-request.schema.json");
const responseSchema = readSchema("calculation-response.schema.json");
const historySchema = readSchema("calculation-history.schema.json");
const ajv = new Ajv2020Module.default({ allErrors: true, strict: true, formats: {
  "date-time": /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/,
} });
ajv.addSchema(requestSchema);
ajv.addSchema(responseSchema);
const validateRequest = ajv.getSchema<CalculationRequest>(
  "https://calorie-compass.local/schema/calculation-request.schema.json",
)!;
const validateResponse = ajv.getSchema(
  "https://calorie-compass.local/schema/calculation-response.schema.json",
)!;
const validateHistory = ajv.compile(historySchema);

const normalizeErrors = (errors: ErrorObject[] | null | undefined) =>
  (errors ?? []).map((error) => ({
    field: error.instancePath.replace(/^\//, "").replaceAll("/", ".") || "request",
    message: error.message ?? "is invalid",
  }));

export function validateCalculation(value: unknown): {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
} {
  const valid = validateRequest(value);
  return {
    valid: Boolean(valid),
    errors: normalizeErrors(validateRequest.errors),
  };
}

export function isCalculationResponse(value: unknown): boolean {
  return Boolean(validateResponse(value));
}

export function isCalculationHistory(value: unknown): boolean {
  return Boolean(validateHistory(value));
}
