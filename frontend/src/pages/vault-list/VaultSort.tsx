import React from "react";

import { useDispatch, useSelector } from "react-redux";

import { FormControl, Select, MenuItem, Typography } from "@mui/material";

import {
  setSortByKey,
  VAULT_SORT_CONFIG,
} from "../../state/reducers/vaultSlice";

export default function VaultSort() {
  const sortByKey = useSelector((state) => state.vault.sortByKey);

  const dispatch = useDispatch();

  const handleSortByChange = (event) => {
    // TODO: don't forget about analytics

    dispatch(setSortByKey(event.target.value));
  };

  return (
    <>
      <Typography variant="subtitle2" gutterBottom>
        Sort vaults by
      </Typography>

      <FormControl variant="standard" fullWidth sx={{ mb: 4 }}>
        <Select
          size="small"
          value={sortByKey}
          label="Sort by"
          onChange={handleSortByChange}
        >
          {Object.keys(VAULT_SORT_CONFIG).map((key) => (
            <MenuItem key={key} value={key}>
              {VAULT_SORT_CONFIG[key].label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}
