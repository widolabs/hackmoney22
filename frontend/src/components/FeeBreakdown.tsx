import React from "react";
import { Alert, Chip, Stack, Typography } from "@mui/material";
import { NetworkName } from "../state/reducers/widoSlice";
import { VaultActionType } from "../state/apiSlice";
import { SafeLink } from "./SafeLink";
import { InfoTooltip } from "./InfoTooltip";
import { hasBatchTx } from "../utils/wido_together";

const FreeTxLabel = () => (
  <>
    <Chip label="Free" size="small" sx={{ borderRadius: 1 }} /> paid by Wido
  </>
);

function getApproveGasFee(
  network: NetworkName,
  type: VaultActionType,
  approvalTokenSymbol: string,
  alreadyApproved: boolean
) {
  if (hasBatchTx(network)) {
    return (
      <>
        paid by you in ETH
        <InfoTooltip
          title={`You only need to approve ${approvalTokenSymbol} once for all transactions on Wido.`}
        />
      </>
    );
  }

  if (network === "fantom" && type === "WITHDRAW" && !alreadyApproved) {
    return (
      <>
        paid by you in FTM
        <InfoTooltip
          title={`${approvalTokenSymbol} does not support EIP-712 approvals so it is technically impossible for Wido to cover the gas.`}
        />
      </>
    );
  }
  if (network === "fantom" && type === "WITHDRAW" && alreadyApproved) {
    return (
      <>
        <Chip label="Free" size="small" sx={{ borderRadius: 1 }} /> already paid
      </>
    );
  }
  return <FreeTxLabel />;
}

function getActionGasFeeLabel(type: VaultActionType) {
  if (type === "DEPOSIT") {
    return "Deposit gas fee";
  }

  if (type === "WITHDRAW") {
    return "Withdraw gas fee";
  }

  if (type === "MINT") {
    return "Mint gas fee";
  }

  return "Migrate gas fee";
}

export function getActionGasFee(network: NetworkName) {
  if (hasBatchTx(network)) {
    return `split across batch participants`;
  }
  return <FreeTxLabel />;
}

type FeeBreakdownProps = {
  network: NetworkName;
  type: VaultActionType;
  approvalTokenSymbol: string;
  alreadyApproved: boolean;
  feeTokenSymbol: string;
};

export function FeeBreakdown(props: FeeBreakdownProps) {
  const { network, type, approvalTokenSymbol, alreadyApproved } = props;

  const approveGasFee = getApproveGasFee(
    network,
    type,
    approvalTokenSymbol,
    alreadyApproved
  );
  const actionGasFeeLabel = getActionGasFeeLabel(type);
  const actionGasFee = getActionGasFee(network);

  return (
    <>
      <Stack sx={{ marginTop: 3, padding: 1.5, gap: 0.5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          gap={0.5}
          flexWrap="wrap"
        >
          <Typography variant="caption" fontWeight={500}>
            Approve gas fee
          </Typography>
          <Typography variant="caption">{approveGasFee}</Typography>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          gap={0.5}
          flexWrap="wrap"
        >
          <Typography variant="caption" fontWeight={500}>
            {actionGasFeeLabel}
          </Typography>
          <Typography variant="caption">{actionGasFee}</Typography>
        </Stack>
      </Stack>
    </>
  );
}
