import { zodResolver } from "@hookform/resolvers/zod";
import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import {
  Alert,
  Button,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";

import { calculationSchema, type CalculationForm } from "../schemas/calculation";

interface Props {
  loading: boolean;
  error: string | null;
  onSubmit: (values: CalculationForm) => Promise<void>;
}

const defaults: CalculationForm = {
  age: 30,
  sex: "male",
  heightCm: 175,
  weightKg: 75,
  activityLevel: "moderate",
  goal: "maintain",
};

export function CalculatorForm({ loading, error, onSubmit }: Props) {
  const { control, register, handleSubmit, formState: { errors } } = useForm<CalculationForm>({
    resolver: zodResolver(calculationSchema),
    defaultValues: defaults,
    mode: "onBlur",
  });

  return (
    <Stack component="form" noValidate spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Typography variant="h5" fontWeight={750}>Your daily target</Typography>
        <Typography color="text.secondary" mt={0.5}>Add your details for a science-based daily estimate.</Typography>
      </div>

      {error && <Alert severity="error">{error}</Alert>}

      <Controller name="sex" control={control} render={({ field }) => (
        <FormControl error={Boolean(errors.sex)}>
          <Typography component="label" variant="body2" fontWeight={650} mb={1}>Sex used in the BMR formula</Typography>
          <ToggleButtonGroup
            value={field.value}
            onBlur={field.onBlur}
            onChange={(_event, value) => value && field.onChange(value)}
            exclusive
            fullWidth
            aria-label="Sex used in the formula"
          >
            <ToggleButton value="female">Female</ToggleButton>
            <ToggleButton value="male">Male</ToggleButton>
          </ToggleButtonGroup>
          <FormHelperText>{errors.sex?.message}</FormHelperText>
        </FormControl>
      )} />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField fullWidth label="Age" type="number" error={Boolean(errors.age)} helperText={errors.age?.message ?? "14–100 years"} slotProps={{ htmlInput: { min: 14, max: 100, step: 1 } }} {...register("age")} />
        <TextField fullWidth label="Height" type="number" error={Boolean(errors.heightCm)} helperText={errors.heightCm?.message ?? "120–230 cm"} slotProps={{ htmlInput: { min: 120, max: 230, step: 0.1 }, input: { endAdornment: <InputAdornment position="end">cm</InputAdornment> } }} {...register("heightCm")} />
        <TextField fullWidth label="Weight" type="number" error={Boolean(errors.weightKg)} helperText={errors.weightKg?.message ?? "35–300 kg"} slotProps={{ htmlInput: { min: 35, max: 300, step: 0.1 }, input: { endAdornment: <InputAdornment position="end">kg</InputAdornment> } }} {...register("weightKg")} />
      </Stack>

      <Controller name="activityLevel" control={control} render={({ field }) => (
        <FormControl fullWidth error={Boolean(errors.activityLevel)}>
          <InputLabel id="activity-label">Activity level</InputLabel>
          <Select {...field} labelId="activity-label" label="Activity level">
            <MenuItem value="sedentary">Sedentary · little or no exercise</MenuItem>
            <MenuItem value="light">Light · 1–3 workouts/week</MenuItem>
            <MenuItem value="moderate">Moderate · 3–5 workouts/week</MenuItem>
            <MenuItem value="active">Active · 6–7 workouts/week</MenuItem>
            <MenuItem value="very_active">Very active · intense daily training</MenuItem>
          </Select>
          <FormHelperText>{errors.activityLevel?.message}</FormHelperText>
        </FormControl>
      )} />

      <Controller name="goal" control={control} render={({ field }) => (
        <FormControl error={Boolean(errors.goal)}>
          <Typography component="label" variant="body2" fontWeight={650} mb={1}>Goal</Typography>
          <ToggleButtonGroup
            value={field.value}
            onBlur={field.onBlur}
            onChange={(_event, value) => value && field.onChange(value)}
            exclusive
            fullWidth
            aria-label="Nutrition goal"
          >
            <ToggleButton value="lose">Lose</ToggleButton>
            <ToggleButton value="maintain">Maintain</ToggleButton>
            <ToggleButton value="gain">Gain</ToggleButton>
          </ToggleButtonGroup>
          <FormHelperText>{errors.goal?.message}</FormHelperText>
        </FormControl>
      )} />

      <Button type="submit" variant="contained" size="large" disabled={loading} startIcon={<CalculateRoundedIcon />} sx={{ py: 1.5 }}>
        {loading ? "Calculating…" : "Calculate my target"}
      </Button>
      <Typography variant="caption" color="text.secondary" textAlign="center">
        Educational estimate only. Consult a qualified professional for medical nutrition advice.
      </Typography>
    </Stack>
  );
}
