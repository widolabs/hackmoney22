import { Alert, AlertTitle, Typography } from "@mui/material";
import React from "react";
// import { Button } from "../../components/Button";
import { Vault } from "../../state/apiSlice";
import { ChainId } from "../../state/reducers/tokenListSlice";
import { hasBatchTx } from "../../utils/wido_together";

function getAlertDescription(chainId: ChainId) {
  if (chainId === 1) {
    return (
      <Typography variant="body2" component="div">
        <div>This vault supports Wido Batch transactions.</div>
        <div>
          Wido will let you save up to 80% in gas by batching your transaction
          with others and splitting the gas fee.
        </div>
      </Typography>
    );
  }

  return (
    <Typography variant="body2" component="div">
      <div>This vault is eligible for gas-free deposits & withdrawals.</div>
      <div>Gas will be fully covered by Wido.</div>
    </Typography>
  );
}

type GasSavingsAlertProps = {
  vault: Vault;
};

export function GasSavingsAlert(props: GasSavingsAlertProps) {
  const { vault } = props;

  if (vault.wido_together.length === 0) return null;

  const alertTitle = hasBatchTx(vault.chain_id)
    ? "Gasless transactions"
    : "Gas-free transactions";

  const alertDescription = getAlertDescription(vault.chain_id);

  return (
    <Alert
      elevation={21}
      severity="info"
      // action={
      //   <Button color="inherit" size="small">
      //     Dismiss
      //   </Button>
      // }
      // onClose={console.log}
      icon="⛽️"
    >
      <AlertTitle>{alertTitle}</AlertTitle>
      {alertDescription}
    </Alert>
  );
}
