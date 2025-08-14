import { Values } from "@/types";
import dayjs from "dayjs";

export const extractRecursiveKeys = (obj: any, prefix = "") => {
  let result: any = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const nestedKeys = extractRecursiveKeys(value, fullKey); // Chiamata ricorsiva se il valore è un oggetto
        Object.assign(result, nestedKeys); // Unisci le chiavi dell'oggetto ricorsivo nel risultato
      } else {
        result[fullKey] = value; // Assegna il valore corrente alla chiave nell'oggetto risultante
      }
    }
  }

  return result;
};

const isValidDate = (value: any) => {
  /**
   *
   * 12/10/2023 => true
   * 12/10/2023 23:45 => true
   * Tue, 01 Aug 2023 15:12:54 GMT => true
   * 01743940239 => false, before fix this value is converted to date
   *
   **/
  const dateRegex =
    /^(\d{2}\/\d{2}\/\d{4}|\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}|[A-Z][a-z]{2},\s\d{2}\s[A-Z][a-z]{2}\s\d{4}\s\d{2}:\d{2}:\d{2}\s[A-Z]{3})$/;

  return dateRegex.test(value);
};

const convertDate = (value: string) => {
  if (isValidDate(value)) {
    if (dayjs(value, "DD/MM/YYYY").isValid()) {
      value = dayjs(value, "DD/MM/YYYY").format("YYYY-MM-DD");
    } else if (dayjs(value, "DD/MM/YYYY HH:mm").isValid()) {
      value = dayjs(value, "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm");
    }
  }

  return value;
};

export const formatValues = (values: Values) => {
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      const valuesFormatted = value.map((element) => {
        return convertDate(element);
      });

      values[key] = valuesFormatted;
    } else if (value === null) {
      values[key] = null;
    } else if (typeof value === "object") {
      values[key] = formatValues(value);
    } else {
      values[key] = convertDate(value);
    }
  }

  return values;
};

export const pluralize = (word: string): string => {
  if (word.endsWith("y")) {
    return word.slice(0, -1) + "ies";
  }
  if (word.endsWith("s")) {
    return word;
  }
  return word + "s";
};