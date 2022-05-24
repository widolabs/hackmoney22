import { memo, useEffect } from "react";
import { createSearchParams } from "react-router-dom";
import {
  setLastGenericFilterList,
  setLastSearchedVault,
  setMinTvl,
  setSortByKey,
  SortByType,
  SORT_VALUES,
} from "../../state/reducers/vaultSlice";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { minTvlValues } from "./VaultFiltersDrawer";

export const SyncUrlParams = memo(() => {
  const dispatch = useAppDispatch();

  const lastSearchedVault = useAppSelector(
    (state) => state.vault.lastSearchedVault
  );
  const lastGenericFilterList = useAppSelector(
    (state) => state.vault.lastGenericFilterList
  );
  const sortByKey = useAppSelector((state) => state.vault.sortByKey);
  const minTvl = useAppSelector((state) => state.vault.minTvl);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const minTvl = searchParams.get("min_tvl");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const base_token = searchParams.getAll("base_token");
    const exclude_base_token = searchParams.getAll("exclude_base_token");
    const chain = searchParams.getAll("chain");
    const provider = searchParams.getAll("provider");

    dispatch(
      setLastGenericFilterList({
        base_token,
        exclude_base_token,
        chain,
        provider,
      })
    );

    if (minTvl && minTvlValues.includes(Number(minTvl))) {
      dispatch(setMinTvl(Number(minTvl)));
    }
    if (sort && SORT_VALUES.includes(sort)) {
      dispatch(setSortByKey(sort as SortByType));
    }
    if (search) {
      dispatch(setLastSearchedVault(search));
    }
  }, [dispatch]);

  useEffect(() => {
    // TODO: current implementation removes any other search params that were present
    const searchParams = createSearchParams({
      min_tvl: String(minTvl),
      search: lastSearchedVault,
      sort: sortByKey,
      ...lastGenericFilterList,
    }).toString();

    if (window.location.search.includes(searchParams)) return;

    window.history.pushState({}, "", `/?${searchParams.toString()}`);
    // window.history.replaceState({}, "", `/?${searchParams.toString()}`);
  }, [lastGenericFilterList, minTvl, lastSearchedVault, sortByKey]);

  return null;
});

SyncUrlParams.displayName = "SyncUrlParams";
