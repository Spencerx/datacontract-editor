import { useMemo } from 'react';
import { useEditorStore } from '../../store.js';
import { toAbsoluteUrl } from '../../lib/urlUtils.js';
import { buildSourcePropertyUri } from './browseInsert.js';

/**
 * Reactive lookups for "is this browse tree element already used in the
 * edited contract?". Both derive from yamlParts, so badges update live with
 * every edit/drop.
 */

const push = (map, key, label) => {
  const list = map.get(key) || [];
  if (label && !list.includes(label)) list.push(label);
  map.set(key, list);
};

/**
 * All authoritativeDefinitions URLs in the contract (schema level and
 * properties, nested included), as Map<absoluteUrl, [names of the linking
 * schemas/properties]>. Matches semantic elements and business definitions
 * alike, since the URL is the identity either way.
 */
export function useLinkedAuthDefUrls() {
  const yamlParts = useEditorStore((state) => state.yamlParts);
  return useMemo(() => {
    const map = new Map();
    const addDefs = (defs, label) => (defs || []).forEach((def) => {
      const abs = def?.url ? toAbsoluteUrl(def.url) : null;
      if (abs) push(map, abs, label);
    });
    const walkProperty = (prop) => {
      if (!prop || typeof prop !== 'object') return;
      addDefs(prop.authoritativeDefinitions, prop.name);
      (prop.properties || []).forEach(walkProperty);
      if (prop.items) walkProperty(prop.items);
    };
    (yamlParts?.schema || []).forEach((schema) => {
      addDefs(schema?.authoritativeDefinitions, schema?.name);
      (schema?.properties || []).forEach(walkProperty);
    });
    return map;
  }, [yamlParts]);
}

export const sourcedPropertyKey = (sourceObject, qualifiedProperty) => `${sourceObject}\u0000${qualifiedProperty}`;

/**
 * All matchable keys of a contract property's transform lineage: each
 * transformSourceObjects entry as-is (URI convention) and, when
 * transformLogic is set, the legacy pair key (id-based convention).
 */
export function propertySourcedKeys(property) {
  if (!Array.isArray(property?.transformSourceObjects)) return [];
  const keys = [];
  property.transformSourceObjects.forEach((sourceObject) => {
    if (!sourceObject) return;
    keys.push(sourceObject);
    const abs = toAbsoluteUrl(sourceObject);
    if (abs && abs !== sourceObject) keys.push(abs);
    if (property.transformLogic) keys.push(sourcedPropertyKey(sourceObject, property.transformLogic));
  });
  return keys;
}

/**
 * The matchable keys of a browse tree property node, for the same lineage:
 * the source-property URI (current convention) plus the legacy id-based key.
 */
export function nodeSourcedKeys(origin, propertyName) {
  const keys = [];
  const uri = buildSourcePropertyUri(origin, propertyName);
  if (uri) keys.push(uri);
  if (origin?.dataProductExternalId && origin?.schemaName && propertyName) {
    keys.push(sourcedPropertyKey(origin.dataProductExternalId, `${origin.schemaName}.${propertyName}`));
  }
  return keys;
}

/**
 * All transform-lineage sources in the contract, as Map<key, [names of the
 * sourced properties]> over every key from propertySourcedKeys, so both the
 * URI convention and the legacy id-based convention match.
 */
export function useSourcedContractProperties() {
  const yamlParts = useEditorStore((state) => state.yamlParts);
  return useMemo(() => {
    const map = new Map();
    const walkProperty = (prop) => {
      if (!prop || typeof prop !== 'object') return;
      propertySourcedKeys(prop).forEach((key) => push(map, key, prop.name));
      (prop.properties || []).forEach(walkProperty);
      if (prop.items) walkProperty(prop.items);
    };
    (yamlParts?.schema || []).forEach((schema) => (schema?.properties || []).forEach(walkProperty));
    return map;
  }, [yamlParts]);
}

/**
 * Whether a contract property matches a hovered browse-panel link criterion
 * (see browsePanelSlice.hoveredContractLink).
 */
export function propertyMatchesLink(property, link) {
  if (!link || !property) return false;
  if (link.type === 'authDef') {
    return (property.authoritativeDefinitions || []).some((def) => def?.url && toAbsoluteUrl(def.url) === link.url);
  }
  if (link.type === 'sourced') {
    const keys = propertySourcedKeys(property);
    return (link.keys || []).some((key) => keys.includes(key));
  }
  return false;
}

/**
 * Link identity of a contract property for the reverse cross-highlight
 * (schema row hover -> browse tree): all its authoritativeDefinitions URLs
 * (absolute) and transform-lineage keys. Null when the property has neither.
 */
export function propertyLinkIdentity(property) {
  if (!property) return null;
  const urls = (property.authoritativeDefinitions || [])
    .map((def) => (def?.url ? toAbsoluteUrl(def.url) : null))
    .filter(Boolean);
  const sourcedKeys = propertySourcedKeys(property);
  if (urls.length === 0 && sourcedKeys.length === 0) return null;
  return { urls, sourcedKeys };
}
