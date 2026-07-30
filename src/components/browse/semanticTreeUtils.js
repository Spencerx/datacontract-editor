/**
 * Pure helpers for the semantic ontology tree, shared by the
 * DefinitionSelectionModal and the browse panel.
 */

/**
 * A node is selectable/addable when it represents a concrete element,
 * not a structural container.
 */
export const isSelectableNode = (node) =>
  node.elementType !== 'namespace' && node.elementType !== 'group';

/**
 * Convert a tree node into the definition shape used when applying a
 * selection to a property (same shape the definitions API returns).
 */
export const nodeToDefinition = (node) => ({
  name: node.externalId,
  url: node.url,
  authDefType: node.authDefType,
  businessName: node.businessName || node.name,
  logicalType: node.logicalType,
  description: node.description,
  tags: node.tags,
  customProperties: [
    { property: 'elementType', value: node.elementType },
    ...(node.owner ? [{ property: 'owner', value: node.owner }] : []),
  ],
});

/**
 * Filter the tree by a query, keeping parents of matching descendants.
 * A matching parent keeps all its children.
 */
export const filterTree = (nodes, q) => {
  if (!q) return nodes;
  const lower = q.toLowerCase();
  return nodes.reduce((acc, node) => {
    const match = node.name?.toLowerCase().includes(lower)
      || node.externalId?.toLowerCase().includes(lower)
      || node.description?.toLowerCase().includes(lower);
    const filteredChildren = node.children ? filterTree(node.children, q) : [];
    if (match || filteredChildren.length > 0) {
      acc.push({ ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children });
    }
    return acc;
  }, []);
};

/**
 * Collect the externalIds of all nodes that have children (for auto-expanding
 * the tree while filtering).
 */
export const collectExpandableIds = (nodes) => {
  const ids = new Set();
  const collect = (list) => list.forEach((n) => {
    if (n.children?.length) { ids.add(n.externalId); collect(n.children); }
  });
  collect(nodes);
  return ids;
};
