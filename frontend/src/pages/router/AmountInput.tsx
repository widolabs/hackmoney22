import {
  Box,
  ButtonGroup,
  FormControl,
  FormHelperText,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback } from "react";
import { Button } from "../../components/Button";
import { ethers } from "ethers";

type AmountInputProps = {
  symbol?: string;
  decimals?: number;
  balance: ethers.BigNumber;
  helper: string;
  amount: string;
  setInputHelper: (helper: string) => void;
  setInputAmount: (amount: string) => void;
};

export function AmountInput(props: AmountInputProps) {
  const {
    symbol,
    helper,
    amount,
    balance,
    decimals,
    setInputHelper,
    setInputAmount,
  } = props;

  const setAmountFromPercentage = useCallback(
    (percent: number) => {
      setInputAmount(
        ethers.utils.formatUnits(
          balance.mul((percent * 100).toFixed()).div(100),
          decimals
        )
      );
    },
    [setInputAmount, balance, decimals]
  );
  return (
    <Box sx={{ marginY: 3 }}>
      <Typography variant="caption">Amount</Typography>
      <FormControl color="secondary" variant="filled" fullWidth>
        <TextField
          color="secondary"
          variant="filled"
          helperText={helper}
          error={!!helper}
          value={amount}
          sx={(theme) => ({
            "& input": {
              textAlign: "right",
              ...theme.typography.number,
              ...theme.typography.monospace,
              paddingTop: 2,
              paddingBottom: 2,
            },
            "& .MuiInputAdornment-root": {
              marginTop: "0px !important",
            },
            "& .MuiFilledInput-root": {
              border: "1px solid",
              borderColor: theme.palette.divider,
              borderRadius: 1,
            },
          })}
          placeholder="0.000000"
          type="number"
          onChange={(event) => {
            if (helper) {
              setInputHelper("");
            }
            setInputAmount(event.target.value);
          }}
          InputProps={{
            disableUnderline: true,
            // TODO(daniel)
            startAdornment: (
              <InputAdornment position="start">{symbol}</InputAdornment>
            ),
          }}
        />
        <Stack
          direction="row"
          justifyContent="space-between"
          flexWrap="wrap"
          marginTop={1}
          gap={1}
          sx={{
            "& > p": { flexGrow: 9 },
            "& > div": { flexGrow: 1, flexBasis: "200px" },
            "& > div > button": { flexGrow: 1 },
          }}
        >
          <FormHelperText id="outlined-weight-helper-text">
            {/* TODO(daniel): move above input */}
            {balance && (
              <>Balance: {ethers.utils.formatUnits(balance, decimals)}</>
            )}
          </FormHelperText>
          <ButtonGroup variant="outlined" size="small" color="secondary">
            <Button onClick={() => setAmountFromPercentage(0.25)}>25%</Button>
            <Button onClick={() => setAmountFromPercentage(0.5)}>50%</Button>
            <Button onClick={() => setAmountFromPercentage(0.75)}>75%</Button>
            <Button onClick={() => setAmountFromPercentage(1)}>MAX</Button>
          </ButtonGroup>
        </Stack>
      </FormControl>
    </Box>
  );
}
