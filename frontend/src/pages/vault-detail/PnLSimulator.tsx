import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  styled,
} from "@mui/material";
import { roundOff } from "../../utils/utils";
import InfoIcon from "@mui/icons-material/Info";
import debounce from "lodash.debounce";
import { useAnalytics } from "../../hooks/useAnalytics";
import { CardHeaderStyled } from "./VaultDetailPage";
import { SafeLink } from "../../components/SafeLink";
import { useFetchROIv3Query, Vault } from "../../state/apiSlice";
import { LoadingIndicator } from "../../components/LoadingIndicator";

const TableCellRed = styled(TableCell)(({ theme }) => ({
  color: theme.palette.negative.main,
  fontWeight: 600,
}));

const TableCellGreen = styled(TableCell)(({ theme }) => ({
  color: theme.palette.positive.main,
  fontWeight: 600,
}));

type PnLSimulatorProps = {
  vault: Vault;
};

export function PnLSimulator(props: PnLSimulatorProps) {
  const { vault } = props;

  const analytics = useAnalytics();
  const [depositAmount, setDepositAmount] = useState("1000");
  const [depositTerm, setDepositTerm] = useState("3"); // in months
  const { data, isFetching } = useFetchROIv3Query(vault);

  const tokenSymbol = data?.token_symbol;

  const debounceChangeDepositFunction = useMemo(
    () =>
      debounce((amount) => {
        analytics?.track("pnl_sim_change_deposit_amount", {
          amount: amount,
          token: tokenSymbol,
        });
      }, 500),
    [analytics, tokenSymbol]
  );

  if (isFetching) {
    return <LoadingIndicator />;
  }

  if (!data) {
    throw new Error("API returned nothing");
  }

  const pricing = data.pricing;
  const apy = roundOff(vault.apy * 100);

  const changeDepositTerm = (event, depTerm) => {
    if (depTerm !== null) {
      analytics?.track("pnl_sim_change_deposit_term", {
        deposit_term: depTerm,
        token: tokenSymbol,
      });
      setDepositTerm(depTerm);
    }
  };

  const changeDepositAmount = (e) => {
    debounceChangeDepositFunction(e.target.value);
    setDepositAmount(e.target.value);
  };

  const predictedAmount = [
    (parseFloat(depositAmount) - parseFloat(pricing[0].deposit_fee)) * // wido together
      (1 + (apy / 100) * (parseFloat(depositTerm) / 12)) -
      parseFloat(pricing[0].withdraw_fee),
    (parseFloat(depositAmount) - parseFloat(pricing[1].deposit_fee_token)) * // zaps
      (1 + (apy / 100) * (parseFloat(depositTerm) / 12)) -
      parseFloat(pricing[1].withdraw_fee_token),
  ];

  const profitability = [
    ((parseFloat(depositAmount) + parseFloat(pricing[0].withdraw_fee)) /
      (parseFloat(depositAmount) - parseFloat(pricing[0].deposit_fee)) -
      1) *
      (365 / (apy / 100)),
    ((parseFloat(depositAmount) + parseFloat(pricing[1].withdraw_fee_token)) /
      (parseFloat(depositAmount) - parseFloat(pricing[1].deposit_fee_token)) -
      1) *
      (365 / (apy / 100)),
  ];

  return (
    <Card elevation={21}>
      <CardHeaderStyled
        titleTypographyProps={{ variant: "h6" }}
        title="P&L Simulator"
      />
      <CardContent>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item container xs={12} spacing={2}>
            <Grid item xs={6}>
              <TextField
                placeholder={depositAmount}
                label="Deposit Amount"
                onChange={changeDepositAmount}
                value={depositAmount}
                type="number"
                size="small"
                sx={{ width: "100%" }}
                InputProps={{
                  inputProps: { min: 0 },
                  startAdornment: (
                    <InputAdornment position="start">USDC</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Current APY"
                onChange={changeDepositAmount}
                value={`${apy}%`}
                size="small"
                sx={{ width: "100%" }}
                InputProps={{
                  inputProps: { min: 0 },
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>
          <Grid
            item
            container
            xs={12}
            spacing={2}
            alignItems="center"
            sx={(theme) => ({
              justifyContent: "space-between",

              [theme.breakpoints.up("sm")]: {
                justifyContent: "flex-start",
              },
            })}
          >
            <Grid item>Term</Grid>
            <Grid item>
              <ToggleButtonGroup
                color="primary"
                value={depositTerm}
                exclusive
                onChange={changeDepositTerm}
                size="small"
              >
                <ToggleButton value="1">1 month</ToggleButton>
                <ToggleButton value="3">3 months</ToggleButton>
                <ToggleButton value="12">12 months</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ overflow: "auto" }}>
          <Table
            size="small"
            sx={{ minWidth: 500 }}
            aria-label="P&L Simulator gas fees breakdown and returns"
          >
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>
                  <SafeLink
                    href="https://www.joinwido.com/wido-together"
                    color="inherit"
                  >
                    Wido gasless&batch
                  </SafeLink>
                </TableCell>
                <TableCell>Regular Transaction</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ pl: 0 }}>
                  Deposit Gas
                  <Tooltip
                    title="Gas fee to deposit tokens in to the vault."
                    enterTouchDelay={0}
                  >
                    <IconButton>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>{pricing[0].deposit_fee}</TableCell>
                <TableCell sx={{ pr: 0 }}>
                  {`${pricing[1].deposit_fee} (${pricing[1].deposit_fee_token} ${tokenSymbol})`}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: 0 }}>
                  Withdraw Gas
                  <Tooltip
                    title="Gas fee to withdraw tokens from the vault."
                    enterTouchDelay={0}
                  >
                    <IconButton>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>{pricing[0].withdraw_fee}</TableCell>
                <TableCell sx={{ pr: 0 }}>
                  {`${pricing[1].withdraw_fee} (${pricing[1].withdraw_fee_token} ${tokenSymbol})`}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: 0 }}>
                  Total Fees
                  <Tooltip
                    title="Total Gas fee to deposit and withdraw tokens to and from the vault."
                    enterTouchDelay={0}
                  >
                    <IconButton>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCellGreen>{pricing[0].total_fee}</TableCellGreen>
                <TableCellRed sx={{ pr: 0 }}>
                  {`${pricing[1].total_fee} (${pricing[1].total_fee_token} ${tokenSymbol})`}
                </TableCellRed>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: 0 }}>
                  {`After ${depositTerm} months`}
                  <Tooltip
                    title="Estimated tokens received from the vault after the given period, assuming that the yield remains constant."
                    enterTouchDelay={0}
                  >
                    <IconButton>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCellGreen>
                  {`${roundOff(predictedAmount[0])} USDC`}
                </TableCellGreen>
                <TableCellRed sx={{ pr: 0 }}>
                  {`${roundOff(predictedAmount[1])} USDC`}
                </TableCellRed>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: 0 }}>
                  Days till profitability
                  <Tooltip
                    title="The minimum number of days your tokens should be kept in the vault to recoup the transaction fees spent for deposit."
                    enterTouchDelay={0}
                  >
                    <IconButton>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCellGreen>
                  {`${Math.round(profitability[0])} days`}
                </TableCellGreen>
                <TableCellRed sx={{ pr: 0 }}>
                  {`${Math.round(profitability[1])} days`}
                </TableCellRed>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
        <Typography variant="caption">
          *Calculations based on current gas and ETH price.
        </Typography>
      </CardContent>
    </Card>
  );
}
