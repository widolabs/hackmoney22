import React from "react";
import {
  alpha,
  Button as MuiButton,
  ButtonProps,
  CircularProgress,
  styled,
} from "@mui/material";

export const Button = styled(MuiButton)`
  &:not(:hover):not(:disabled):not(:focus) {
    color: ${({ theme }) => theme.palette.secondary.main};
    border-color: ${({ theme }) => alpha(theme.palette.secondary.main, 0.5)};
  }
`;

export type LoadingButtonProps = ButtonProps & {
  loading?: boolean;
  loadingLabel?: string;
  label?: string;
};

export function LoadingButton(props: LoadingButtonProps) {
  const { loading = false, disabled, loadingLabel, label, ...rest } = props;

  return (
    <Button
      {...rest}
      disabled={disabled || loading}
      startIcon={loading && <CircularProgress color="inherit" size={20} />}
    >
      {loading ? loadingLabel : label}
    </Button>
  );
}
