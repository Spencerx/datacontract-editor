/** {externalId} placeholder -> encoded id; null when either part is missing. */
export const resolveDetailsUrl = (template, externalId) =>
  template && externalId ? template.replace('{externalId}', encodeURIComponent(externalId)) : null;
