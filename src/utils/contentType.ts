export type ContentType = "blog" | "project"

// Route params are typed `string | string[]`, so narrow them before querying
export const isContentType = (value: unknown): value is ContentType => value === "blog" || value === "project"
