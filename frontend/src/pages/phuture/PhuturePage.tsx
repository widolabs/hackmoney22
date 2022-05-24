import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import WidoTogetherFormPhuture from "./WidoTogetherFormPhuture";
import { Footer } from "../../app/Footer";
import WidoTogetherForm from "../../components/WidoTogetherForm";
import WidoBatch from "./WidoBatch";

import { ChainId } from "../../state/reducers/tokenListSlice";
import {
  getChainLabel,
  WIDO_TOGETHER_LABEL,
  WIDO_TOGETHER_MAPPING,
} from "../../utils/label";
import { getNetwork } from "../../utils/network";
import phutureTestnetTokens from "./phuture-testnet-tokens";
import phutureVault from "./phuture-vault";
import { ExpandMore } from "@mui/icons-material";
import { SafeLink } from "../../components/SafeLink";
import { Box } from "@mui/system";

export function PhuturePage() {
  const actionType = "DEPOSIT";
  const widoTogetherAction = WIDO_TOGETHER_MAPPING[actionType];

  const vault = phutureVault;

  useEffect(() => {
    if (!vault) return;
    document.title = `Wido - ${vault.display_name}`;
  }, [vault]);

  const network = getNetwork(vault.chain_id as ChainId);
  const chainLabel = getChainLabel(vault.chain_id as ChainId);
  const protocolLabel = vault.provider;

  return (
    <Stack
      sx={{
        maxWidth: 600,
        display: "flex",
        flexDirection: "column",
        margin: "32px auto",
      }}
    >
      <Box mb={4}>
        <Paper elevation={0}>
          <WidoTogetherFormPhuture
            type={actionType}
            network={network}
            chainLabel={chainLabel}
            protocolLabel={protocolLabel}
            fromTokens={phutureTestnetTokens}
            toTokens={[
              {
                address: vault.address,
                symbol: vault.symbol,
                name: vault.display_name,
                decimals: vault.decimals,
                logoURI: vault.icon,
              },
            ]}
            unsupported={!vault.wido_together.includes(widoTogetherAction)}
            title={"Batch mint • Phuture Finance"}
          />
        </Paper>
      </Box>

      <Box mb={8}>
        <WidoBatch
          type={actionType}
          network={network}
          protocolLabel={protocolLabel}
          fromTokens={phutureTestnetTokens}
          toTokens={[
            {
              address: vault.address,
              symbol: vault.symbol,
              name: vault.display_name,
              decimals: vault.decimals,
              logoURI: vault.icon,
            },
          ]}
          unsupported={!vault.wido_together.includes(widoTogetherAction)}
        />
      </Box>

      <Box mb={8}>
        <Typography gutterBottom variant="subtitle2" px={2}>
          FAQs
        </Typography>
        <Accordion elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>What is Wido Batch</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Wido batch transactions let you queue your transaction with other
              people and split network fee (gas) with them.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>How much can I save in gas</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Up to 90%. The more people in the batch, the higher the savings.
              With 3 people in the batch (which is a required minimum), the
              savings should be around 60% for each batch participant.{" "}
              <SafeLink
                href="https://www.joinwido.com/blog/how-to-save-90-in-gas-on-ethereum"
                title="Read this article to understand more about how are the savings achieved."
              >
                Read this article to understand how are the savings achieved.
              </SafeLink>
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>How does the saving work</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <SafeLink
                href="https://www.joinwido.com/blog/how-to-save-90-in-gas-on-ethereum"
                title="Read this article to understand more about how are the savings achieved."
              >
                Read this article to understand how are the savings achieved.
              </SafeLink>
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>What if I am the only one in a batch</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography gutterBottom>
              If you are the only one in a batch, nothing will happen and you
              will keep your funds.
            </Typography>
            <Typography>
              Your funds stay with you until the batch executes. If you are the
              only one in a batch, the batch will not execute (minimum three
              participants are required for batch to execute).
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>
              Can I integrate Wido Batching with my protocol
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography gutterBottom>
              Absolutely!{" "}
              <SafeLink href="mailto:info@joinwido.com" title="Reach out">
                Reach out
              </SafeLink>{" "}
              and we will be happy to help.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>
              What happens to my funds after I join Wido Batch
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Your funds stay in your wallet after you join Wido Batch, and you
              keep complete control of it. During batch execution, your funds
              will be deposited into the destination contract, and you will get
              receipt tokens pro-rata to your deposit.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Are Wido Smart Contracts public</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography gutterBottom>
              Yes, the code is available on{" "}
              <SafeLink
                href="https://github.com/widolabs/wido-together"
                title="Wido GitHub"
              >
                Wido GitHub
              </SafeLink>
              .
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Are Wido Smart Contracts audited</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography gutterBottom>
              Not yet, use at your own risk. To learn more about the security,{" "}
              <SafeLink
                href="https://www.joinwido.com/blog/chat-with-facu-about-wido-together-and-its-security-model"
                title="Discussion between Wido and Yearn about Wido Batching"
              >
                read our discussion with Facu, Product Manager at yearn.finance
              </SafeLink>
              .
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Who is behind Wido</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Learn about us{" "}
              <SafeLink
                href="https://www.joinwido.com/about"
                title="here"
                underline="always"
              >
                here
              </SafeLink>{" "}
              and feel free to{" "}
              <SafeLink
                href="https://www.joinwido.com/contact"
                title="reach out"
                underline="always"
              >
                reach out
              </SafeLink>
              !
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>

      <Footer />
    </Stack>
  );
}
