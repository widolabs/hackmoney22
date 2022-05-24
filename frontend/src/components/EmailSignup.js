import React, { useState } from "react";

import { Box, Grid, Typography, TextField, Alert } from "@mui/material";

import { useAddMailchimpSubscriberMutation } from "../state/apiSlice";
import { isValidEmailAddress } from "../utils/utils";
import { Button } from "./Button";

export default function EmailSignup() {
  let [addMailchimpSubscriber, { error: subscriptionError }] =
    useAddMailchimpSubscriberMutation();

  const [isValidEmail, setIsValidEmail] = useState(false);
  const [emailInputValue, setEmailInputValue] = useState("");
  const [emailValidityMessage, setEmailValidityMessage] = useState("");

  const [isSubscriptionSuccess, setIsSubscriptionSucces] = useState(false);

  const [noValidate, setNoValidate] = useState(true); // do not validate by default

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (isValidEmail) {
      addMailchimpSubscriber(emailInputValue)
        .unwrap()
        .then(() => {
          setIsSubscriptionSucces(true);
        })
        .catch(() => {});
    } else {
      setNoValidate(false);
    }
  };

  const handleEmailInputChange = (e) => {
    const _isValidEmail = isValidEmailAddress(e.target.value);
    let errorMsg = "";

    if (!_isValidEmail) {
      errorMsg = "Invalid email address";
    }

    setEmailValidityMessage(errorMsg);
    setEmailInputValue(e.target.value);
    setIsValidEmail(_isValidEmail);
  };

  let showEmailError = false,
    emailErrorMessage = "";
  if (!noValidate) {
    showEmailError = !isValidEmail;
    emailErrorMessage = emailValidityMessage;
  }

  let serverErrorMsg;
  if (subscriptionError && subscriptionError.status) {
    serverErrorMsg = (
      <Alert mt={2} severity="error" variant="outlined">
        Something went wrong. Please try again.
      </Alert>
    );
  }

  let componentContent;
  if (!isSubscriptionSuccess) {
    componentContent = (
      <React.Fragment>
        <Typography variant="body2" gutterBottom>
          Stay up to date with what&apos;s new at Wido.
        </Typography>
        {serverErrorMsg}
        <form onSubmit={handleFormSubmit}>
          <Grid container spacing={1} alignItems="flex-start" mt={1}>
            <Grid item xs={true}>
              <TextField
                error={showEmailError}
                helperText={emailErrorMessage}
                placeholder="email@you.xyz"
                type="email"
                variant="standard"
                size="small"
                value={emailInputValue}
                onChange={handleEmailInputChange}
              />
            </Grid>
            <Grid item xs="auto">
              <Button
                disabled={showEmailError}
                type="submit"
                variant="outlined"
                size="small"
                color="secondary"
              >
                Sign up
              </Button>
            </Grid>
          </Grid>
        </form>
      </React.Fragment>
    );
  } else {
    componentContent = (
      <Alert severity="success" variant="outlined">
        Subscription created for {emailInputValue}
      </Alert>
    );
  }

  return (
    <Box m={3}>
      <Typography variant="subtitle1" gutterBottom>
        Wido Newsletter
      </Typography>
      {componentContent}
    </Box>
  );
}
