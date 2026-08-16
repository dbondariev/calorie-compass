import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { Alert, Box, Button, IconButton, Paper, Skeleton, Stack, Typography } from "@mui/material";

import type { CalculationResult } from "../types/calculation";

interface Props {
  items: CalculationResult[];
  loading: boolean;
  error: string | null;
  deletingId: number | null;
  onDelete: (id: number) => Promise<void>;
  onRetry: () => Promise<void>;
}

export function HistoryList({ items, loading, error, deletingId, onDelete, onRetry }: Props) {
  return (
    <Box component="section" mt={7}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <HistoryRoundedIcon color="primary" />
        <Typography variant="h5" fontWeight={750}>Recent calculations</Typography>
      </Stack>
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={() => void onRetry()}>Retry</Button>}>
          {error}
        </Alert>
      )}
      {loading ? <Stack spacing={1}>{[1, 2].map((item) => <Skeleton key={item} variant="rounded" height={72} />)}</Stack> : items.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, color: "text.secondary" }}>No saved calculations yet.</Paper>
      ) : (
        <Stack spacing={1.25}>
          {items.map((item) => (
            <Paper key={item.id} variant="outlined" sx={{ px: 2.5, py: 1.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography fontWeight={750}>{item.targetCalories.toLocaleString()} kcal/day</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.inputs ? `${item.inputs.weightKg} kg · ${item.inputs.heightCm} cm · ${item.inputs.goal}` : item.bmiCategory} · {new Date(item.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <IconButton
                  aria-label="Delete calculation"
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
