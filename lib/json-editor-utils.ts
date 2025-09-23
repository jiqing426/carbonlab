// JSON类型定义
export type JsonObject = { [key: string]: JsonValue };
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export type JsonArray = JsonValue[];