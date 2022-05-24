import React, { useCallback, useState, useMemo } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import { useAppDispatch, useAppSelector } from "../../state/store";
import { useAnalytics } from "../../hooks/useAnalytics";
import { setLastGenericFilterList } from "../../state/reducers/vaultSlice";
import { Chip, Stack, Typography } from "@mui/material";
import { TokenAvatar } from "../../components/TokenAvatar";
import { networkAvatarStyles } from "../../components/NetworkAvatar";
import { NetworkChip } from "../../components/NetworkChip";
import { getChainId } from "../../utils/label";
import { TokenChip } from "../../components/TokenChip";

const stringifiedProps = {
  exclude_base_token: "Exclude Exposure Token",
  base_token: "Exposure Token",
  chain: "Blockchain",
  provider: "Protocol",
};

type FilterDropDownProps = {
  filterName: string;
  data: string[];
};

const SELECT_ALL_OPTION = "Select all";
const SELECT_NONE_OPTION = "Select none";
const BUILT_IN_OPTIONS = [SELECT_ALL_OPTION, SELECT_NONE_OPTION];

// This component is responsible for creating an autocomplete multiple select dropdown
// We use it for filtering out the vault list by chain_id, base_token and provider
// ref: https://mui.com/components/autocomplete/#multiple-values
export const FilterDropDown = (props: FilterDropDownProps) => {
  const { data, filterName } = props;

  const options = useMemo(
    () => BUILT_IN_OPTIONS.concat(Object.keys(data)),
    [data]
  );

  const analytics = useAnalytics();
  const dispatch = useAppDispatch();

  const lastGenericFilterList = useAppSelector(
    (state) => state.vault.lastGenericFilterList
  );

  const [value, setInternalState] = useState(lastGenericFilterList[filterName]);

  const updateGenericFilter = useCallback(
    (event, value) => {
      const opts = { ...lastGenericFilterList };

      if (value.includes(SELECT_ALL_OPTION)) {
        opts[filterName] = Object.keys(data);
      } else if (value.includes(SELECT_NONE_OPTION)) {
        opts[filterName] = [];
      } else {
        opts[filterName] = value;
      }

      setInternalState(opts[filterName]);
      // debounce to next tick
      setTimeout(() => {
        analytics?.track(`filter_${filterName}`, { query: opts[filterName] });
        dispatch(setLastGenericFilterList(opts));
      }, 0);
    },
    [dispatch, analytics, filterName, lastGenericFilterList, data]
  );

  return (
    <Autocomplete
      limitTags={4}
      multiple
      disableClearable
      disableCloseOnSelect
      options={options}
      id={filterName}
      onChange={updateGenericFilter}
      value={value}
      renderTags={(value: string[], getTagProps) =>
        value.map((option: string, index: number) => {
          if (filterName === "chain") {
            return (
              <NetworkChip
                size="small"
                chainId={getChainId(option)}
                {...getTagProps({ index })}
              />
            );
          }

          if (["base_token", "exclude_base_token"].includes(filterName)) {
            return (
              <TokenChip
                size="small"
                label={option}
                icon={data[option]}
                {...getTagProps({ index })}
              />
            );
          }

          return (
            // eslint-disable-next-line react/jsx-key
            <Chip size="small" label={option} {...getTagProps({ index })} />
          );
        })
      }
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            sx={{ marginRight: 1.5, padding: 0, color: "transparent" }}
            readOnly
            size="small"
            disableRipple
            checked={selected}
          />
          <Stack direction="row" spacing={0.5} alignItems="center">
            {data[option] && (
              <TokenAvatar
                alt={option}
                src={data[option]}
                sx={networkAvatarStyles}
              />
            )}
            <Typography variant="body2" noWrap>
              {option}
            </Typography>
          </Stack>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          label={stringifiedProps[filterName]}
        />
      )}
    />
  );
};
