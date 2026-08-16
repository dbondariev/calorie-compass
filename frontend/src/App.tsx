import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { Alert, Box, Container, Paper, Snackbar, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { CalculatorForm } from "./components/CalculatorForm";
import { HistoryList } from "./components/HistoryList";
import { ResultPanel } from "./components/ResultPanel";
import { usePreferences } from "./preferences";
import type { CalculationForm } from "./schemas/calculation";
import { ApiError, calculationApi } from "./services/api";
import type { CalculationResult } from "./types/calculation";

export default function App() {
  const { locale, t } = usePreferences();
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [history, setHistory] = useState<CalculationResult[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const friendlyError = useCallback((caught: unknown, fallback: "historyLoadError" | "calculateError" | "deleteError") => {
    if (caught instanceof ApiError) {
      if (caught.status === 0) return t("networkError");
      if (caught.status === 408) return t("requestTimeout");
      if (caught.status >= 500) return t("serviceUnavailable");
      return caught.message;
    }
    return caught instanceof Error ? caught.message : t(fallback);
  }, [t]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await calculationApi.list();
      setHistory(data.items);
    } catch (caught) {
      setHistoryError(friendlyError(caught, "historyLoadError"));
    } finally {
      setHistoryLoading(false);
    }
  }, [friendlyError]);

  useEffect(() => { void loadHistory(); }, [loadHistory]);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);

  const calculate = async (values: CalculationForm) => {
    setSubmitting(true);
    setError(null);
    try {
      const created = await calculationApi.create(values);
      setResult(created);
      await loadHistory();
    } catch (caught) {
      setError(friendlyError(caught, "calculateError"));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: number) => {
    setDeletingId(id);
    try {
      await calculationApi.remove(id);
      setHistory((items) => items.filter((item) => item.id !== id));
      if (result?.id === id) setResult(null);
      setNotification(t("deleted"));
    } catch (caught) {
      setNotification(friendlyError(caught, "deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box minHeight="100vh" pb={8}>
      <Box component="header" py={3}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{ width: 38, height: 38, borderRadius: 2.5, bgcolor: "primary.main", display: "grid", placeItems: "center", color: "white" }}><AutoAwesomeRoundedIcon fontSize="small" /></Box>
            <Typography fontWeight={800} letterSpacing={-0.4}>Calorie Compass</Typography>
          </Stack>
        </Container>
      </Box>

      <Container component="main" maxWidth="lg">
        <Box py={{ xs: 4, md: 7 }} maxWidth={760}>
          <Typography variant="overline" color="primary" fontWeight={750} letterSpacing={1.5}>{t("nutritionPractical")}</Typography>
          <Typography variant="h2" component="h1" fontWeight={800} letterSpacing={-2.5} mt={1}>{t("heroTitle")}</Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400} mt={1.5} maxWidth={620}>{t("heroBody")}</Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.08fr) minmax(380px, .92fr)" }, gap: 3, alignItems: "stretch" }}>
          <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2.5, sm: 4 } }}>
            <CalculatorForm loading={submitting} error={error} onSubmit={calculate} />
          </Paper>
          <ResultPanel result={result} />
        </Box>

        <HistoryList
          items={history}
          loading={historyLoading}
          error={historyError}
          deletingId={deletingId}
          onDelete={remove}
          onRetry={loadHistory}
        />
      </Container>
      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={5000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" variant="filled" onClose={() => setNotification(null)}>{notification}</Alert>
      </Snackbar>
    </Box>
  );
}
