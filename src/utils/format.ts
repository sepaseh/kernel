export const camelCaseToTitle = (input: string) => {
  if (!input) return input;

  return input
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const imageToDimensions = (
  file: File,
): Promise<{ height: number; width: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ height: img.height, width: img.width });
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(objectUrl);
      reject(e);
    };
  });
};

export const kebabCaseToTitle = (input: string) => {
  if (!input) return input;

  return input
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const match = <T extends string | number | symbol, V>(
  value: T,
  handlers: { [key in T]: () => V },
): V => {
  const handler = handlers[value];

  return handler();
};

export const parseBase64DataUrl = (
  dataUrl: string,
): { mime: string; base64: string } => {
  const [prefix, base64 = ""] = dataUrl.split(",");

  const mimeMatch = prefix.match(/data:(.*);base64/);
  const mime = mimeMatch ? mimeMatch[1] : "";

  return { mime, base64 };
};

export const snakeCaseToTitle = (input: string) => {
  if (!input) return input;

  return input
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const tinyId = () => {
  return Math.random().toString(36).slice(2, 8);
};

