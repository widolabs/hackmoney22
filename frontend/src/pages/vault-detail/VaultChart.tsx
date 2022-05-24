import React, { useCallback, useMemo, useRef, useState } from "react";
import { HistoricalAPYRaw, Vault } from "../../state/apiSlice";
import { formatAsPercentage } from "../../utils/number";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import { useFetchVaultHistoricalApyQuery } from "../../state/apiSlice";
import { HistoricalAPYChart } from "./HistoricalAPYChart";
import { throttle } from "lodash";
import { Monospace } from "../../components/Monospace";
import { longDateFormatWithTimezone } from "../../utils/date";
import { LoadingIndicator } from "../../components/LoadingIndicator";

type VaultChartProps = {
  vault: Vault;
};

function currencyFormat(num, digits = 2) {
  if (!num) return "";
  return num.toFixed(digits).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function getCurrentValue(vault: Vault) {
  return {
    tvl: vault.tvl.tvl_in_usd,
    net_apy: vault.apy,
    timestamp: new Date().getTime(),
    total_assets: 0,
  };
}

export function VaultChart(props: VaultChartProps) {
  const { vault } = props;

  const todaysValue = useMemo(() => getCurrentValue(vault), [vault]);
  const [value, setValue] = useState(todaysValue);
  const valueRef = useRef<HistoricalAPYRaw>();
  valueRef.current = value;

  const [inactiveAxis, setInactiveAxis] = useState<"tvl" | "net_apy" | "">("");

  const { data, isFetching } = useFetchVaultHistoricalApyQuery({
    vaultAddress: vault.address,
    days: 90,
  });

  const handleMouseLeave = useCallback(() => {
    setTimeout(() => {
      setValue(todaysValue);
    }, 60);
  }, [todaysValue, setValue]);

  const tooltipFormatter = useMemo(
    () =>
      throttle((_, __, tooltipProps: { payload: HistoricalAPYRaw }) => {
        const { payload } = tooltipProps;

        // Wrapped in a setTimeout because we need this to run on the next tick
        setTimeout(() => {
          if (payload.timestamp !== valueRef.current?.timestamp) {
            setValue(payload);
          }
        }, 0);
      }, 50),
    [valueRef, setValue]
  );

  if (!isFetching && !data) {
    throw new Error("API returned nothing");
  }

  return (
    <Card elevation={21}>
      <CardContent>
        <Grid container spacing={2} alignItems="flex-end" marginBottom={2}>
          <Grid item xs={12} marginBottom={-2}>
            <Typography variant="body1">
              <Monospace>{longDateFormatWithTimezone(value.timestamp)}</Monospace>
            </Typography>
          </Grid>
          {inactiveAxis !== "net_apy" && (
            <Grid item xs={3}>
              <Typography variant="h6" color="positive.main">
                <Monospace number>
                  {formatAsPercentage(value.net_apy)}
                </Monospace>
              </Typography>
              <Typography variant="body2" color="text.secondary" lineHeight={1}>
                <Monospace>APY</Monospace>
              </Typography>
            </Grid>
          )}
          {inactiveAxis !== "tvl" && (
            <Grid item xs={9}>
              <Typography variant="h6">
                <Monospace number>{`$${currencyFormat(
                  value.tvl,
                  0
                )}`}</Monospace>
              </Typography>
              <Typography variant="body2" color="text.secondary" lineHeight={1}>
                <Monospace>Total Value Locked</Monospace>
              </Typography>
            </Grid>
          )}
        </Grid>
        <Box sx={{ height: 400 }}>
          {isFetching && <LoadingIndicator label="Fetching chart data..." />}
          {data && (
            <HistoricalAPYChart
              data={data}
              todaysValue={todaysValue}
              handleMouseLeave={handleMouseLeave}
              tooltipFormatter={tooltipFormatter}
              inactiveAxis={inactiveAxis}
              setInactiveAxis={setInactiveAxis}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
