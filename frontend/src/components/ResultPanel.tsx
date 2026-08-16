import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import { Box, Chip, Divider, LinearProgress, Paper, Stack, Typography } from "@mui/material";

import type { CalculationResult } from "../types/calculation";

interface Props { result: CalculationResult | null }

function Macro({ label, grams, color }: { label: string; grams: number; color: string }) {
  return (
    <Box flex={1} minWidth={85}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h6" fontWeight={750}>{grams}<Typography component="span" variant="body2"> g</Typography></Typography>
      <LinearProgress variant="determinate" value={Math.min(100, grams / 2)} sx={{ mt: 0.75, height: 5, bgcolor: "grey.100", "& .MuiLinearProgress-bar": { bgcolor: color } }} />
    </Box>
  );
}

export function ResultPanel({ result }: Props) {
  if (!result) {
    return (
      <Paper variant="outlined" sx={{ p: 4, minHeight: 360, display: "grid", placeItems: "center", textAlign: "center", borderStyle: "dashed", bgcolor: "rgba(255,255,255,.5)" }}>
        <Box maxWidth={300}>
          <LocalFireDepartmentRoundedIcon sx={{ fontSize: 54, color: "primary.light", mb: 1 }} />
          <Typography variant="h6" fontWeight={700}>Your result will appear here</Typography>
          <Typography color="text.secondary" mt={1}>Complete the form to see calories, BMI, metabolism and daily macros.</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper aria-live="polite" elevation={0} sx={{ p: { xs: 3, md: 4 }, color: "common.white", background: "linear-gradient(145deg, #163832 0%, #205f50 100%)", overflow: "hidden", position: "relative" }}>
      <Box sx={{ position: "absolute", width: 210, height: 210, borderRadius: "50%", bgcolor: "rgba(255,255,255,.06)", right: -60, top: -70 }} />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="overline" sx={{ opacity: 0.75, letterSpacing: 1.4 }}>Daily calorie target</Typography>
        <Chip label={result.bmiCategory} size="small" sx={{ bgcolor: "rgba(255,255,255,.14)", color: "white" }} />
      </Stack>
      <Typography variant="h2" fontWeight={800} mt={2} letterSpacing={-2}>
        {result.targetCalories.toLocaleString()}
        <Typography component="span" variant="h6" ml={1} sx={{ opacity: 0.7 }}>kcal</Typography>
      </Typography>
      <Typography sx={{ opacity: 0.72 }}>A practical daily target based on your goal.</Typography>

      <Stack direction="row" spacing={4} my={3}>
        <Box><Typography variant="caption" sx={{ opacity: 0.65 }}>Maintenance</Typography><Typography fontWeight={700}>{result.maintenanceCalories.toLocaleString()} kcal</Typography></Box>
        <Box><Typography variant="caption" sx={{ opacity: 0.65 }}>Base metabolism</Typography><Typography fontWeight={700}>{result.bmr.toLocaleString()} kcal</Typography></Box>
        <Box><Typography variant="caption" sx={{ opacity: 0.65 }}>BMI</Typography><Typography fontWeight={700}>{result.bmi}</Typography></Box>
      </Stack>
      <Divider sx={{ borderColor: "rgba(255,255,255,.15)", mb: 2.5 }} />
      <Typography variant="subtitle2" mb={1.5}>Suggested daily macros</Typography>
      <Stack direction="row" spacing={2.5}>
        <Macro label="Protein" grams={result.macros.proteinGrams} color="#8be0c2" />
        <Macro label="Fat" grams={result.macros.fatGrams} color="#ffc97b" />
        <Macro label="Carbs" grams={result.macros.carbGrams} color="#a9c8ff" />
      </Stack>
    </Paper>
  );
}
