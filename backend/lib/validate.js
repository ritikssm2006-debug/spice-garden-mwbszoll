/**
 * Checks a request body against a model's field list.
 * Unknown fields are dropped; values are converted to the right type.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/[^\s]+$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;
const IMAGE_DATA = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/;

function validate(fields, body = {}, { partial = false } = {}) {
  const value = {};
  const errors = [];

  for (const field of fields) {
    let v = body[field.name];
    const empty = v === undefined || v === null || v === "";

    if (empty) {
      if (field.type === "boolean" && !partial) value[field.name] = false;
      else if (field.required && !partial) errors.push(`${field.label} is required`);
      else if (partial && body[field.name] !== undefined && !field.required && field.type !== "select") value[field.name] = field.type === "boolean" ? false : "";
      continue;
    }

    switch (field.type) {
      case "number":
      case "price":
        v = Number(v);
        if (!Number.isFinite(v)) errors.push(`${field.label} must be a number`);
        if (field.type === "price" && v < 0) errors.push(`${field.label} can't be negative`);
        break;
      case "boolean":
        v = v === true || v === "true" || v === "on" || v === 1 || v === "1";
        break;
      case "select":
        v = String(v);
        if (!field.options.includes(v)) errors.push(`${field.label} must be one of: ${field.options.join(", ")}`);
        break;
      case "email":
        v = String(v).trim();
        if (!EMAIL.test(v)) errors.push(`${field.label} must be a valid email`);
        break;
      case "url":
        v = String(v).trim();
        if (!URL_RE.test(v)) errors.push(`${field.label} must be a link starting with http:// or https://`);
        break;
      case "image":
        v = String(v).trim();
        if (!URL_RE.test(v) && !IMAGE_DATA.test(v)) errors.push(`${field.label} must be an uploaded image or an image link`);
        else if (v.length > 2500000) errors.push(`${field.label} is too large (max about 1.8 MB)`);
        break;
      case "relation":
        v = String(v).trim();
        if (!/^[A-Za-z0-9_-]{1,64}$/.test(v)) errors.push(`Please choose a valid ${field.label.toLowerCase()}`);
        break;
      case "date":
        v = String(v).slice(0, 10);
        if (!DATE.test(v)) errors.push(`${field.label} must be a date (YYYY-MM-DD)`);
        break;
      case "time":
        v = String(v).slice(0, 5);
        if (!TIME.test(v)) errors.push(`${field.label} must be a time (HH:MM)`);
        break;
      default:
        v = String(v).trim().slice(0, field.type === "textarea" ? 5000 : 300);
    }
    value[field.name] = v;
  }

  return { value, errors };
}

module.exports = { validate };
