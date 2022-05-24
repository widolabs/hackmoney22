import * as React from "react";
import PropTypes from "prop-types";

import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Avatar, Stack } from "@mui/material";

import { useFetchUserProfileQuery } from "../state/apiSlice";

import { shortenWalletAddress } from "../utils/utils";
import { Button } from "./Button";

export default function UserProfile(props) {
  const walletAddress = props.walletAddress,
    handleDisconnectWalletClick = props.onDisconnectWalletClick;

  const { data: userAccountData = {}, isFetching } =
    useFetchUserProfileQuery(walletAddress);

  return (
    <Card variant="outlined" sx={{ margin: 3 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar alt="User Profile Pic" src={userAccountData.profile_pic} />
          <Typography variant="subtitle2">
            {shortenWalletAddress(walletAddress)}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions>
        <Button
          variant="text"
          color="secondary"
          size="small"
          onClick={handleDisconnectWalletClick}
        >
          Disconnect Wallet
        </Button>
      </CardActions>
    </Card>
  );
}

UserProfile.propTypes = {
  walletAddress: PropTypes.string.isRequired,
  onDisconnectWalletClick: PropTypes.func.isRequired,
};
