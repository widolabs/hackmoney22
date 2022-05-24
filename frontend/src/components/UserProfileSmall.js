import * as React from "react";
import PropTypes from "prop-types";

import Typography from "@mui/material/Typography";
import { Avatar, IconButton, Menu, MenuItem, Stack } from "@mui/material";

import { useFetchUserProfileQuery } from "../state/apiSlice";

import { shortenWalletAddress } from "../utils/utils";
import { ArrowDropDown } from "@mui/icons-material";

export default function UserProfileSmall(props) {
  const walletAddress = props.walletAddress,
    handleDisconnectWalletClick = props.onDisconnectWalletClick;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const isDropdownOpen = Boolean(anchorEl);

  const { data: userAccountData = {} } =
    useFetchUserProfileQuery(walletAddress);

  const handleDropdownOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Avatar
        alt="User Profile Pic"
        src={userAccountData.profile_pic}
        sx={{ width: 28, height: 28 }}
      />
      <Typography variant="subtitle2">
        {shortenWalletAddress(walletAddress)}
      </Typography>
      <IconButton color="secondary" size="small" onClick={handleDropdownOpen}>
        <ArrowDropDown />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={isDropdownOpen}
        onClose={handleDropdownClose}
      >
        <MenuItem onClick={handleDisconnectWalletClick}>Disconnect</MenuItem>
      </Menu>
    </Stack>
  );
}

UserProfileSmall.propTypes = {
  walletAddress: PropTypes.string.isRequired,
  onDisconnectWalletClick: PropTypes.func.isRequired,
};
