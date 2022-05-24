import {
  Box,
  Drawer,
  DrawerProps,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import React, { memo, useCallback } from "react";
import { Button } from "../../components/Button";
import VaultSort from "./VaultSort";
import { FilterDropDown } from "./FilterDropDown";
import { useAppSelector, useAppDispatch } from "../../state/store";
import {
  selectDistinctGenericFilterList,
  setMinTvl,
} from "../../state/reducers/vaultSlice";
import { useAnalytics } from "../../hooks/useAnalytics";
import { formatAsShortNumber } from "../../utils/number";
import { SyncUrlParams } from "./SyncUrlParams";

export const minTvlValues = [0, 10000, 100000, 1000000, 10000000, 100000000];

type VaultFiltersDrawerProps = Omit<DrawerProps, "onClose"> & {
  showSeeResults: boolean;
  onClose: () => void;
  appbarHeight: number;
};

export const VaultFiltersDrawer = memo((props: VaultFiltersDrawerProps) => {
  const { showSeeResults, onClose, appbarHeight, ...rest } = props;

  const dispatch = useAppDispatch();

  const minTvl = useAppSelector((state) => state.vault.minTvl);
  const distinctGenericFilterList = useAppSelector((state) =>
    selectDistinctGenericFilterList(state)
  );

  const analytics = useAnalytics();
  const handleTvlChange = useCallback(
    (event) => {
      analytics?.track(`filter_min_tvl`, { query: event.target.value });
      dispatch(setMinTvl(event.target.value));
    },
    [dispatch, analytics]
  );

  return (
    <>
      <SyncUrlParams />
      <Drawer
        onClose={onClose}
        {...rest}
        sx={(theme) => ({
          width: theme.wido.filterDrawerWidth,
          [`& .MuiDrawer-paper`]: {
            width: theme.wido.filterDrawerWidth,
            boxSizing: "border-box",
            marginTop: `${appbarHeight}px}`,
          },
          [theme.breakpoints.down("sm")]: {
            [`& .MuiDrawer-paper`]: {
              width: `${theme.wido.filterDrawerWidthXS} !important`,
            },
          },
          [theme.breakpoints.up("xl")]: {
            width: theme.wido.filterDrawerWidthXL,
            [`& .MuiDrawer-paper`]: {
              width: `${theme.wido.filterDrawerWidthXL}px !important`,
            },
          },
        })}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        <Box margin={2}>
          <VaultSort />

          <Typography variant="subtitle2" gutterBottom>
            Vault filters
          </Typography>
          <Stack spacing={1}>
            <FormControl variant="standard" fullWidth>
              <InputLabel id="min-tvl-select-label">Minimum TVL</InputLabel>
              <Select
                labelId="min-tvl-select-label"
                value={minTvl}
                label="Minimum TVL"
                onChange={handleTvlChange}
              >
                {minTvlValues.map((value) => (
                  <MenuItem key={value} value={value}>
                    ${formatAsShortNumber(value, 0)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {Object.keys(distinctGenericFilterList).map((filterName) => (
              <FilterDropDown
                key={filterName}
                data={distinctGenericFilterList[filterName]}
                filterName={filterName}
              />
            ))}
            {showSeeResults && (
              <Button variant="outlined" fullWidth onClick={onClose}>
                See results
              </Button>
            )}
          </Stack>
        </Box>
      </Drawer>
    </>
  );
});

VaultFiltersDrawer.displayName = "VaultFiltersDrawer";
