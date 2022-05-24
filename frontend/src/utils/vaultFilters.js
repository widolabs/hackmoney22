export const filterByDisplayNameOrAddress = (vaultData, searchQuery) => {
  if (searchQuery === "") return vaultData;
  return vaultData.filter((data) => {
    return (
      data.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
};

export const filterByBaseToken = (
  vaultData,
  searchBaseTokenList,
  tokenList
) => {
  if (searchBaseTokenList.length === 0) return vaultData;
  return vaultData.filter((data) => {
    const baseTokenNames = data.base_token.map(
      (x) => tokenList[data.chain_id][x]?.symbol
    );
    return searchBaseTokenList.some((t) => baseTokenNames.includes(t));
  });
};

export const filterByExcludeBaseToken = (
  vaultData,
  searchBaseTokenList,
  tokenList
) => {
  if (searchBaseTokenList.length === 0) return vaultData;
  return vaultData.filter((data) => {
    const baseTokenNames = data.base_token.map(
      (x) => tokenList[data.chain_id][x]?.symbol
    );
    return !searchBaseTokenList.some((t) => baseTokenNames.includes(t));
  });
};

export const filterByChainId = (vaultData, chain, chainIdMapping) => {
  if (chain.length === 0) return vaultData;
  return vaultData.filter((data) => {
    return chain.includes(chainIdMapping[data.chain_id]);
  });
};

export const filterByProvider = (vaultData, provider) => {
  if (provider.length === 0) return vaultData;
  return vaultData.filter((data) => {
    return provider.includes(data.provider);
  });
};

export const filterByTvl = (vaultData, minTvl) => {
  if (minTvl === 0) return vaultData;
  return vaultData.filter((data) => {
    return data.tvl.tvl_in_usd >= minTvl;
  });
};
