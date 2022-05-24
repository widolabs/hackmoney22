import {
  Dialog,
  Stack,
  Tooltip,
  Typography,
  DialogContent,
  useTheme,
  useMediaQuery,
  Box,
  styled,
} from "@mui/material";
import React, { useState } from "react";
import ContentLoader from "react-content-loader";
import { TokenAvatar } from "../../components/TokenAvatar";
import {
  useFetchCoinDataQuery,
  useFetchMarketDataQuery,
} from "../../state/coingeckoApiSlice";
import { Monospace } from "../../components/Monospace";
import { Button } from "../../components/Button";
import {
  ChainId,
  selectTokenByAddress,
} from "../../state/reducers/tokenListSlice";
import { formatAsCurrency, formatAsShortNumber } from "../../utils/number";
import { SafeLink } from "../../components/SafeLink";
import { getNetworkExplorerURL } from "../../utils/network";
import { shortenWalletAddress } from "../../utils/utils";
import {
  ResponsiveContainer,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { shortDateFormat } from "../../utils/date";
import { BootstrapDialogTitle } from "../../components/WidoTogetherForm";
import { widoChartStyles } from "../../hooks/widoChartStyles";
import { useAppSelector } from "../../state/store";

const MISSING_DESCRIPTION_TEXT = "This token does not have a description yet.";

const BaseTokenLoader = () => (
  <ContentLoader width={60} height={18} viewBox="0 0 60 18">
    <rect x="0" y="0" rx="4" ry="4" width="60" height="18" />
  </ContentLoader>
);

type BaseTokenCardProps = {
  address: string;
  chainId: ChainId;
};

const StyledLineChart = styled(LineChart)(widoChartStyles);

export function BaseTokenCard(props: BaseTokenCardProps) {
  const { address, chainId } = props;

  const token = useAppSelector(selectTokenByAddress(chainId, address));

  const theme = useTheme();
  const mobileDevice = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);
  const { data, isFetching } = useFetchCoinDataQuery({
    chainId,
    contractAddress: address,
  });

  const { data: marketData } = useFetchMarketDataQuery(data ? data.id : "", {
    skip: !open || !data,
  });

  const endOfText = data ? data.description.en.indexOf(".", 100) : -1;
  const description =
    endOfText === -1
      ? data?.description.en
      : data?.description.en.slice(0, endOfText + 1);

  return (
    <>
      <Tooltip
        disableInteractive
        title={`Click to learn more about ${token.symbol}`}
      >
        <Button
          color="secondary"
          sx={{ marginX: -1, textTransform: "none" }}
          onClick={() => setOpen(true)}
        >
          <Stack flexGrow={1} direction="row" justifyContent="space-between">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <TokenAvatar alt={token.symbol} src={token.logoURI} />
              <Typography variant="body2">{token.symbol}</Typography>
            </Stack>
            {isFetching ? (
              <BaseTokenLoader />
            ) : (
              <Typography variant="body2">
                <Monospace number>
                  {data
                    ? formatAsCurrency(data.market_data.current_price.usd, 4)
                    : "≈ $1.0000"}
                </Monospace>
              </Typography>
            )}
          </Stack>
        </Button>
      </Tooltip>
      <Dialog
        fullScreen={mobileDevice}
        open={open}
        onClose={() => setOpen(false)}
      >
        <BootstrapDialogTitle onClose={() => setOpen(false)}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TokenAvatar alt={token.symbol} src={token.logoURI} size="large" />
            <Box
              component="span"
              sx={{
                maxWidth: "280px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {token.name}
            </Box>
          </Stack>
        </BootstrapDialogTitle>
        <DialogContent sx={{ width: "400px", maxWidth: "100%" }}>
          <Stack gap={0.5}>
            <Typography variant="body2" sx={{ marginBottom: 1 }}>
              {description || MISSING_DESCRIPTION_TEXT}
            </Typography>
            <Box
              style={{ height: marketData ? "100px" : "0px" }}
              sx={(theme) => ({
                marginRight: -1,
                height: "0px",
                overflow: "hidden",
                transition: theme.transitions.create("height"),
              })}
            >
              {marketData && (
                <ResponsiveContainer width={"100%"} height={100}>
                  <StyledLineChart
                    data={marketData.prices}
                    margin={{ top: 10, right: 0, left: 0 }}
                  >
                    <XAxis
                      minTickGap={14}
                      padding={{ left: 4, right: 4 }}
                      dataKey={(dataPoint) => dataPoint[0]}
                      tickFormatter={shortDateFormat}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      orientation="right"
                      interval="preserveStartEnd"
                      padding={{ bottom: 4 }}
                      dataKey={(dataPoint) => dataPoint[1]}
                      domain={["dataMin", "dataMax"]}
                      yAxisId="priceAxis"
                      tickFormatter={(value) => formatAsCurrency(value, 4)}
                    />
                    <ReferenceLine yAxisId="priceAxis" y={1} />
                    <RechartsTooltip
                      labelFormatter={shortDateFormat}
                      formatter={(value) => formatAsCurrency(value, 4)}
                    />
                    <Line
                      type="monotone"
                      dot={false}
                      dataKey={(dataPoint) => dataPoint[1]}
                      yAxisId="priceAxis"
                      stroke={theme.palette.positive.main}
                    />
                  </StyledLineChart>
                </ResponsiveContainer>
              )}
            </Box>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">Symbol</Typography>
              <Typography variant="body2">
                <Monospace number>{token.symbol}</Monospace>
              </Typography>
            </Stack>
            {data && (
              <>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Price</Typography>
                  <Typography variant="body2">
                    <Monospace number>
                      {formatAsCurrency(data?.market_data.current_price.usd, 4)}
                    </Monospace>
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Market cap</Typography>
                  <Typography variant="body2">
                    <Monospace number>
                      $
                      {formatAsShortNumber(data?.market_data.market_cap.usd, 1)}
                    </Monospace>
                  </Typography>
                </Stack>
              </>
            )}
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">Contract address</Typography>
              <Typography variant="body2">
                <SafeLink
                  showLinkIcon
                  href={`${getNetworkExplorerURL(chainId)}/address/${
                    token.address
                  }`}
                >
                  <Monospace number>
                    {shortenWalletAddress(token.address)}
                  </Monospace>
                </SafeLink>
              </Typography>
            </Stack>
            {data?.links.homepage[0] && (
              <Stack direction="row" justifyContent="space-between" gap={1}>
                <Typography variant="body2">Homepage</Typography>
                <Typography variant="body2" noWrap>
                  <SafeLink showLinkIcon href={data?.links.homepage[0]}>
                    {data?.links.homepage[0]
                      .replace("www.", "")
                      .replace("https://", "")
                      .replace("http://", "")}
                  </SafeLink>
                </Typography>
              </Stack>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
