import React, { ForwardedRef, forwardRef, memo } from "react";
import IconButton from "@mui/material/IconButton";
import FilterListIcon from "@mui/icons-material/FilterList";
import WidoAppBar from "../../app/AppBar";
import { VaultSearch } from "./VaultSearch";
import { useAppSelector } from "../../state/store";
import { Badge } from "@mui/material";

type VaultListAppBarProps = {
  onSearch: () => void;
  onMenuClick: () => void;
  onFilterClick: () => void;
  showFilterIcon: boolean;
};

let VaultListAppBar = forwardRef(
  (props: VaultListAppBarProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { onSearch, onMenuClick, onFilterClick, showFilterIcon } = props;

    const lastSearchedVault = useAppSelector(
      (state) => state.vault.lastSearchedVault
    );

    const filterCount = useAppSelector((state) => {
      let filterCount = 0;

      if (state.vault.lastGenericFilterList.base_token.length > 0) {
        filterCount++;
      }
      if (state.vault.lastGenericFilterList.exclude_base_token.length > 0) {
        filterCount++;
      }
      if (state.vault.lastGenericFilterList.chain.length > 0) {
        filterCount++;
      }
      if (state.vault.lastGenericFilterList.provider.length > 0) {
        filterCount++;
      }
      if (state.vault.minTvl > 0) {
        filterCount++;
      }

      return filterCount;
    });

    return (
      <WidoAppBar
        ref={ref}
        onIconClick={onMenuClick}
        title="Stablecoin Vaults"
        titleContent={
          <VaultSearch
            initialValue={lastSearchedVault}
            onValueChange={onSearch}
          />
        }
        subContent={
          showFilterIcon ? (
            <div>
              <IconButton
                onClick={onFilterClick}
                aria-label="filter"
                edge="end"
                color="inherit"
              >
                <Badge badgeContent={filterCount} color="tertiary">
                  <FilterListIcon />
                </Badge>
              </IconButton>
            </div>
          ) : undefined
        }
        hideTitleOnMobile
      />
    );
  }
);

VaultListAppBar = memo(VaultListAppBar);
VaultListAppBar.displayName = "VaultListAppBar";

export { VaultListAppBar };
