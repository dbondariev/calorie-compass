import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { Button, Container, Paper, Typography } from "@mui/material";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Unhandled UI rendering error", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <ErrorOutlineRoundedIcon color="error" sx={{ fontSize: 52 }} />
          <Typography variant="h5" fontWeight={750} mt={2}>The page could not be displayed</Typography>
          <Typography color="text.secondary" mt={1} mb={3}>
            Your data is safe. Reload the page to try again.
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>Reload page</Button>
        </Paper>
      </Container>
    );
  }
}
