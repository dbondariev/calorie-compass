import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { Alert, Box, Button, IconButton, Paper, Skeleton, Stack, Typography } from "@mui/material";

import { usePreferences, type TranslationKey } from "../preferences";
import type { CalculationResult, Goal } from "../types/calculation";
import { formatImperialHeight, kilogramsToPounds } from "../utils/units";

interface Props {
  items: CalculationResult[];
  loading: boolean;
  error: string | null;
  deletingId: number | null;
  onDelete: (id: number) => Promise<void>;
  onRetry: () => Promise<void>;
}

export function HistoryList({ items, loading, error, deletingId, onDelete, onRetry }: Props) {
  const { locale, units, t } = usePreferences();
  const numberLocale = locale === "uk" ? "uk-UA" : "en-US";
  const goalKey: Record<Goal, TranslationKey> = { lose: "lose", maintain: "maintain", gain: "gain" };

  return (
    <Box component="section" mt={7}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <HistoryRoundedIcon color="primary" />
        <Typography variant="h5" fontWeight={750}>{t("recent")}</Typography>
      </Stack>
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={() => void onRetry()}>{t("retry")}</Button>}>
          {error}
        </Alert>
      )}
      {loading ? <Stack spacing={1}>{[1, 2].map((item) => <Skeleton key={item} variant="rounded" height={72} />)}</Stack> : items.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, color: "text.secondary" }}>{t("emptyHistory")}</Paper>
      ) : (
        <Stack spacing={1.25}>
          {items.map((item) => (
            <Paper key={item.id} variant="outlined" sx={{ px: 2.5, py: 1.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography fontWeight={750}>{item.targetCalories.toLocaleString(numberLocale)} kcal/{locale === "uk" ? "день" : "day"}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.inputs ? (
                      units === "metric"
                        ? `${item.inputs.weightKg} kg · ${item.inputs.heightCm} cm · ${t(goalKey[item.inputs.goal])}`
                        : `${kilogramsToPounds(item.inputs.weightKg).toFixed(1)} lb · ${formatImperialHeight(item.inputs.heightCm)} · ${t(goalKey[item.inputs.goal])}`
                    ) : t(item.bmiCategory.toLowerCase() as TranslationKey)} · {new Date(item.createdAt).toLocaleDateString(numberLocale)}
                  </Typography>
                </Box>
                <IconButton
                  aria-label={t("deleteCalculation")}
                  disabled={deletingId === item.id}
                  onClick={() => void onDelete(item.id)}
                >
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
