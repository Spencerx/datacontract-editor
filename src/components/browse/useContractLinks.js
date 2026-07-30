import { useMemo } from 'react';
import { useEditorStore } from '../../store.js';
import { toAbsoluteUrl } from '../../lib/urlUtils.js';

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
 * All transform-lineage sources in the contract, as
 * Map<sourcedPropertyKey(transformSourceObject, transformLogic), [names of
 * the sourced properties]>. Matches the lineage convention the browse panel
 * writes (source object = data product id, logic = schema.property).
 */
export function useSourcedContractProperties() {
  const yamlParts = useEditorStore((state) => state.yamlParts);
  return useMemo(() => {
    const map = new Map();
    const walkProperty = (prop) => {
      if (!prop || typeof prop !== 'object') return;
      if (prop.transformLogic && Array.isArray(prop.transformSourceObjects)) {
        prop.transformSourceObjects.forEach((sourceObject) => {
          push(map, sourcedPropertyKey(sourceObject, prop.transformLogic), prop.name);
        });
      }
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
    if (!property.transformLogic || !Array.isArray(property.transformSourceObjects)) return false;
    return property.transformSourceObjects.some(
      (sourceObject) => sourcedPropertyKey(sourceObject, property.transformLogic) === link.key,
    );
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
  const sourcedKeys = property.transformLogic && Array.isArray(property.transformSourceObjects)
    ? property.transformSourceObjects.map((sourceObject) => sourcedPropertyKey(sourceObject, property.transformLogic))
    : [];
  if (urls.length === 0 && sourcedKeys.length === 0) return null;
  return { urls, sourcedKeys };
}
