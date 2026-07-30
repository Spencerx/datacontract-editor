/**
 * API utilities for browsing upstream data products and their contract schemas.
 */

/**
 * Fetch the upstream data products of the data product(s) this contract
 * belongs to, with their data contract schemas inlined.
 *
 * Expected response shape:
 * [{
 *   dataProduct: { externalId, name },
 *   contracts: [{ externalId, title, version, schemas: [{ name, description, properties: [...] }] }]
 * }]
 *
 * @param {string} upstreamUrl - Full URL of the upstream data products endpoint
 * @returns {Promise<Array>}
 */
export const fetchUpstreamDataProducts = async (upstreamUrl) => {
  return fetchJsonList(upstreamUrl, 'upstream data products');
};

/**
 * Fetch all data products of the organization that publish data contracts
 * (lightweight list: [{externalId, name}]). Contracts are fetched lazily per
 * product via fetchDataProductContracts.
 * @param {string} productsUrl - Full URL of the data products list endpoint
 */
export const fetchAllDataProducts = async (productsUrl) => {
  return fetchJsonList(productsUrl, 'data products');
};

/**
 * Fetch the data contracts (schemas inlined) published by one data product.
 * @param {string} contractsBaseUrl - Base URL, extended to `{base}/{externalId}/contracts`
 * @param {string} dataProductExternalId
 */
export const fetchDataProductContracts = async (contractsBaseUrl, dataProductExternalId) => {
  if (!contractsBaseUrl || !dataProductExternalId) return [];
  return fetchJsonList(`${contractsBaseUrl}/${encodeURIComponent(dataProductExternalId)}/contracts`, 'data product contracts');
};

const fetchJsonList = async (url, what) => {
  if (!url) {
    console.warn(`Cannot fetch ${what}: url not provided`);
    return [];
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${what}:`, response.status, response.statusText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${what}:`, error);
    return [];
  }
};
