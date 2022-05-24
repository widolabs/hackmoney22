import React from "react";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Box,
  DialogTitleProps,
  Chip,
  Stack,
  Tooltip,
  Paper,
} from "@mui/material";

import {
  useFetchTransactionQueueQuery,
  VaultActionType,
} from "../../state/apiSlice";
import { shortenWalletAddress } from "../../utils/utils";
import { longDateFormat } from "../../utils/date";
import { CloseRounded } from "@mui/icons-material";
import { NetworkName } from "../../state/reducers/widoSlice";

import { Token } from "../../state/reducers/tokenListSlice";

export const BootstrapDialogTitle = (
  props: DialogTitleProps & { onClose?: () => void }
) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle
      sx={{ padding: 2, display: "flex", justifyContent: "space-between" }}
      {...other}
    >
      {children}
      {onClose && (
        <IconButton
          aria-label="close"
          onClick={onClose}
          edge="end"
          sx={{ marginY: -0.5 }}
        >
          <CloseRounded />
        </IconButton>
      )}
    </DialogTitle>
  );
};

export type WidoBatchProps = {
  type: VaultActionType;
  network: NetworkName;
  protocolLabel: string;
  onClose?: () => void;
  fromTokens: Token[];
  toTokens: Token[];
  unsupported: boolean;
};

export default function WidoBatch(props: WidoBatchProps) {
  const { type, network, fromTokens, toTokens, unsupported } = props;

  const selectedFromToken = fromTokens[0];
  const selectedToToken = toTokens[0];

  const { data: vaultQueue, isSuccess: isVaultQueueLoaded } =
    useFetchTransactionQueueQuery(
      {
        type,
        fromTokenAddress: selectedFromToken.address,
        toTokenAddress: selectedToToken.address,
      },
      {
        skip: unsupported || (network !== "mainnet" && network !== "phuture"),
      }
    );

  let queueElement = (
    <Typography gutterBottom>Fetching current batch</Typography>
  );

  if (isVaultQueueLoaded && vaultQueue) {
    queueElement = (
      <Box>
        <Stack direction="row" spacing={1} mb={2} alignItems="baseline">
          <Typography gutterBottom variant="subtitle2">
            Current batch
          </Typography>
          <Tooltip title="Minimum 5k USDC total required to execute the batch">
            <Chip
              size="small"
              label={`Amount: ${vaultQueue.total_display_amount}/5K ${selectedFromToken.symbol}`}
            />
          </Tooltip>
          <Tooltip title="At least 3 participants required to execute the batch">
            <Chip
              size="small"
              label={`Participants: ${vaultQueue.pending_txs.length}/3`}
            />
          </Tooltip>
        </Stack>

        <List dense={true}>
          {vaultQueue.pending_txs.map((item, index) => (
            <ListItem key={index} disableGutters>
              <ListItemAvatar>
                <Avatar src={item.profile_pic}></Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`Amount: ${
                  item.display_amount
                } USDC  •  Joined: ${longDateFormat(
                  item.joined_timestamp * 1000
                )}`} // Multiplied by 1000 so that the argument is in milliseconds, not seconds.
                secondary={`${shortenWalletAddress(item.user)}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  }

  let message =
    "* Batch minting occurs after at least 5K USDC and 3 people join this batch.";
  if (
    vaultQueue?.pending_txs?.length >= 3 &&
    vaultQueue?.total_amount >= 5000
  ) {
    message =
      "* This batch meets minimum criteria and will execute soon! You can still join to maximise gas savings.";
  }

  return (
    <Paper elevation={0}>
      <DialogContent>
        {queueElement}
        <Typography variant="body2" mt={2} color="secondary">
          {message}
        </Typography>
      </DialogContent>
    </Paper>
  );
}
