export class PastedValue {
  type: "success" | "error";
  error?: Error;
  value: string;
}