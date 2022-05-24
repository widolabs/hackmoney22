import React, {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import Box from "@mui/material/Box";
import { Container } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import debounce from "lodash.debounce";
import { useFetchVaultsQuery } from "../../state/apiSlice";
import {
  incrementPageNumber,
  resetPageNumber,
  selectFilteredVaultList,
  selectPageFromFilteredVaultList,
  setLastSearchedVault,
} from "../../state/reducers/vaultSlice";
import { Stack } from "@mui/material";
import { useAnalytics } from "../../hooks/useAnalytics";
import useElementSizeDebounced from "../../hooks/useElementSizeDebounced";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { VaultFiltersDrawer } from "./VaultFiltersDrawer";
import { VaultErrorFallback } from "./VaultErrorFallback";
import { VaultListAppBar } from "./VaultListAppBar";
import { ErrorBoundary } from "@sentry/react";
import Vault from "./Vault";
import CONFIG from "../../config";
import { toggleMenu } from "../../state/reducers/appSlice";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { Navigate, useSearchParams } from "react-router-dom";
import { fetchAllUserBalances } from "../../state/covalentApi.slice";

export default function VaultsListPage() {
  const analytics = useAnalytics();
  const dispatch = useAppDispatch();
  const { isFetching } = useFetchVaultsQuery();
  const observer = useRef<IntersectionObserver>();

  const [searchParams] = useSearchParams();

  useEffect(() => {
    document.title = "Wido - Grow your stablecoins 🌱";
  }, []);

  const userAddress = useAppSelector(
    (state) => state.currentUser.selectedAddress
  );
  const pageNumber = useAppSelector((state) => state.vault.pageNumber);

  useEffect(() => {
    if (!userAddress) return;
    dispatch(fetchAllUserBalances(userAddress));
  }, [dispatch, userAddress]);

  const handleMenuClick = useCallback(() => {
    dispatch(toggleMenu());
  }, [dispatch]);

  const filteredVaultData = useAppSelector(
    selectPageFromFilteredVaultList(pageNumber)
  );

  // that match the search criteria
  const numberOfVaults = useAppSelector(
    (state) => selectFilteredVaultList(state).length
  );

  const totalNumberOfVaults = useAppSelector(
    (state) => state.vault.vaultList.length
  );

  const hasMoreVaults = useMemo(
    () => CONFIG.UX.VAULTS_PER_PAGE * pageNumber < numberOfVaults,
    [pageNumber, numberOfVaults]
  );

  const lastVaultElementRef = useCallback(
    (node) => {
      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver((entries) => {
        const visible = entries[0].isIntersecting;
        if (visible && hasMoreVaults) {
          dispatch(incrementPageNumber());
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [dispatch, hasMoreVaults]
  );

  const theme = useTheme();
  const matchesMediumAndUp = useMediaQuery(theme.breakpoints.up("md"));

  const [filterIsOpen, setFilterIsOpen] = useState(false);

  let loadingVaults;
  if (isFetching) {
    loadingVaults = <div>Loading vaults</div>;
  } else if (filteredVaultData.length == 0) {
    loadingVaults = <div>No vault matches the search criteria.</div>;
  }

  const handleSearch = useMemo(
    () =>
      debounce((searchValue: string) => {
        analytics?.track("filter_vault_name_or_address", {
          query: [searchValue],
        });
        dispatch(setLastSearchedVault(searchValue));
        dispatch(resetPageNumber());
      }, 500),
    [dispatch, analytics]
  );

  const toggleFilterDrawer = useCallback(() => {
    setFilterIsOpen((value) => !value);
  }, [setFilterIsOpen]);

  const [appbarRef, { height: appbarHeight }] = useElementSizeDebounced();

  if (searchParams.get("page") === "detail") {
    const address = searchParams.get("address");
    const chainId = searchParams.get("chain_id") || 1;

    return <Navigate to={`/vault/${address}/${chainId}`} replace />;
  }

  return (
    <Stack sx={{ flexGrow: 1, overflowX: "hidden" }}>
      <VaultListAppBar
        ref={appbarRef}
        onMenuClick={handleMenuClick}
        onFilterClick={toggleFilterDrawer}
        onSearch={handleSearch}
        showFilterIcon={!matchesMediumAndUp}
      />
      <Stack direction="row">
        <Container
          component="main"
          sx={{
            paddingBottom: 3,
            overflowX: "hidden",
            marginTop: `${appbarHeight}px}`,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              display: "flex",
              flexWrap: "wrap",
              marginTop: 3,
              marginBottom: 2,
            }}
            color="text.secondary"
          >
            The best USD stablecoin yield in all of DeFi.
          </Typography>
          <Typography
            variant="body2"
            sx={{ display: "flex", flexWrap: "wrap", marginBottom: 2 }}
            color="text.secondary"
          >
            Showing <b>&nbsp;{numberOfVaults}&nbsp;</b> vaults out of
            <b>&nbsp;{totalNumberOfVaults}&nbsp;</b> in total.
          </Typography>
          {loadingVaults}
          <Stack spacing={1}>
            {filteredVaultData.map((vault, index, array) => (
              <ErrorBoundary
                key={`${vault.address}/${vault.chain_id}`}
                fallback={<VaultErrorFallback />}
              >
                <Vault
                  data={vault}
                  ref={array.length - 1 === index ? lastVaultElementRef : null}
                />
              </ErrorBoundary>
            ))}
            {hasMoreVaults && <LoadingIndicator />}
          </Stack>
        </Container>
        <Box
          sx={{
            flexShrink: { md: 0 },
            flexBasis: { xs: 0 },
          }}
          aria-label="filter vaults"
        >
          <VaultFiltersDrawer
            appbarHeight={appbarHeight}
            open={filterIsOpen}
            onClose={toggleFilterDrawer}
            variant={matchesMediumAndUp ? "permanent" : "temporary"}
            anchor="right"
            showSeeResults={!matchesMediumAndUp}
          />
        </Box>
      </Stack>
    </Stack>
  );
}
