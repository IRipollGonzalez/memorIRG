/** Only place in the frontend allowed to read import.meta.env. */
export const IS_STATIC = import.meta.env.VITE_DATA_SOURCE === "static";
