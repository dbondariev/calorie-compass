import { zodResolver } from "@hookform/resolvers/zod";
import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import {
  Alert,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";

import { usePreferences } from "../preferences";
import { createCalculationSchema, type CalculationForm } from "../schemas/calculation";
import { inchesToCentimeters, kilogramsToPounds, poundsToKilograms, splitHeight } from "../utils/units";

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
  const { locale, setLocale, units, setUnits, t } = usePreferences();
  const schema = useMemo(() => createCalculationSchema({
    wholeNumber: t("wholeNumber"), minAge: t("minAge"), maxAge: t("maxAge"),
    selectSex: t("selectSex"), minHeight: t("minHeight"), maxHeight: t("maxHeight"),
    minWeight: t("minWeight"), maxWeight: t("maxWeight"),
    selectActivity: t("selectActivity"), selectGoal: t("selectGoal"),
  }), [t]);
  const { control, register, handleSubmit, clearErrors, formState: { errors } } = useForm<CalculationForm>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    mode: "onBlur",
  });
  useEffect(() => { clearErrors(); }, [clearErrors, locale, units]);

  return (
    <Stack component="form" noValidate spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "flex-start" }} gap={1.5}>
        <div>
          <Typography variant="h5" fontWeight={750}>{t("dailyTarget")}</Typography>
          <Typography color="text.secondary" mt={0.5}>{t("formIntro")}</Typography>
        </div>
        <Stack direction="row" alignItems="center" spacing={1} flexShrink={0}>
          <Tooltip title={t("language")}>
            <FormControlLabel
              sx={{ mr: 0 }}
              label={<Typography variant="body2" fontWeight={700}>{locale === "uk" ? "UA" : "EN"}</Typography>}
              control={<Switch size="small" checked={locale === "uk"} onChange={(_event, checked) => setLocale(checked ? "uk" : "en")} inputProps={{ "aria-label": `${t("english")} / ${t("ukrainian")}` }} />}
            />
          </Tooltip>
          <Tooltip title={t("units")}>
            <FormControlLabel
              sx={{ mr: 0 }}
              label={<Typography variant="body2" fontWeight={700}>{units === "imperial" ? "lb / ft" : "kg / cm"}</Typography>}
              control={<Switch size="small" checked={units === "imperial"} onChange={(_event, checked) => setUnits(checked ? "imperial" : "metric")} inputProps={{ "aria-label": `${t("metric")} / ${t("imperial")}` }} />}
            />
          </Tooltip>
        </Stack>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Controller name="sex" control={control} render={({ field }) => (
        <FormControl error={Boolean(errors.sex)}>
          <Typography component="label" variant="body2" fontWeight={650} mb={1}>{t("sexFormula")}</Typography>
          <ToggleButtonGroup
            value={field.value}
            onBlur={field.onBlur}
            onChange={(_event, value) => value && field.onChange(value)}
            exclusive
            fullWidth
            aria-label={t("sexFormula")}
          >
            <ToggleButton value="female">{t("female")}</ToggleButton>
            <ToggleButton value="male">{t("male")}</ToggleButton>
          </ToggleButtonGroup>
          <FormHelperText>{errors.sex?.message}</FormHelperText>
        </FormControl>
      )} />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField fullWidth label={t("age")} type="number" error={Boolean(errors.age)} helperText={errors.age?.message ?? t("ageRange")} slotProps={{ htmlInput: { min: 14, max: 100, step: 1 } }} {...register("age")} />
        {units === "metric" ? (
          <TextField fullWidth label={t("height")} type="number" error={Boolean(errors.heightCm)} helperText={errors.heightCm?.message ?? t("metricHeightRange")} slotProps={{ htmlInput: { min: 120, max: 230, step: 0.1 }, input: { endAdornment: <InputAdornment position="end">cm</InputAdornment> } }} {...register("heightCm")} />
        ) : (
          <Controller name="heightCm" control={control} render={({ field }) => {
            const height = splitHeight(Number(field.value));
            const updateHeight = (feet: number, inches: number) => field.onChange(inchesToCentimeters(feet * 12 + inches));
            return (
              <Stack direction="row" spacing={1} flex={1}>
                <TextField label={t("feet")} type="number" value={height.feet} onBlur={field.onBlur} onChange={(event) => updateHeight(Number(event.target.value), height.inches)} error={Boolean(errors.heightCm)} helperText={errors.heightCm?.message ?? t("imperialHeightRange")} slotProps={{ htmlInput: { min: 3, max: 7, step: 1 } }} />
                <TextField label={t("inches")} type="number" value={height.inches} onBlur={field.onBlur} onChange={(event) => updateHeight(height.feet, Number(event.target.value))} error={Boolean(errors.heightCm)} slotProps={{ htmlInput: { min: 0, max: 11.9, step: 0.1 } }} />
              </Stack>
            );
          }} />
        )}
        {units === "metric" ? (
          <TextField fullWidth label={t("weight")} type="number" error={Boolean(errors.weightKg)} helperText={errors.weightKg?.message ?? t("metricWeightRange")} slotProps={{ htmlInput: { min: 35, max: 300, step: 0.1 }, input: { endAdornment: <InputAdornment position="end">kg</InputAdornment> } }} {...register("weightKg")} />
        ) : (
          <Controller name="weightKg" control={control} render={({ field }) => (
            <TextField fullWidth label={t("weight")} type="number" value={Number(kilogramsToPounds(Number(field.value)).toFixed(1))} onBlur={field.onBlur} onChange={(event) => field.onChange(poundsToKilograms(Number(event.target.value)))} error={Boolean(errors.weightKg)} helperText={errors.weightKg?.message ?? t("imperialWeightRange")} slotProps={{ htmlInput: { min: 77, max: 661, step: 0.1 }, input: { endAdornment: <InputAdornment position="end">lb</InputAdornment> } }} />
          )} />
        )}
      </Stack>

      <Controller name="activityLevel" control={control} render={({ field }) => (
        <FormControl fullWidth error={Boolean(errors.activityLevel)}>
          <InputLabel id="activity-label">{t("activityLevel")}</InputLabel>
          <Select {...field} labelId="activity-label" label={t("activityLevel")}>
            <MenuItem value="sedentary">{t("sedentary")}</MenuItem>
            <MenuItem value="light">{t("light")}</MenuItem>
            <MenuItem value="moderate">{t("moderate")}</MenuItem>
            <MenuItem value="active">{t("active")}</MenuItem>
            <MenuItem value="very_active">{t("veryActive")}</MenuItem>
          </Select>
          <FormHelperText>{errors.activityLevel?.message}</FormHelperText>
        </FormControl>
      )} />

      <Controller name="goal" control={control} render={({ field }) => (
        <FormControl error={Boolean(errors.goal)}>
          <Typography component="label" variant="body2" fontWeight={650} mb={1}>{t("goal")}</Typography>
          <ToggleButtonGroup
            value={field.value}
            onBlur={field.onBlur}
            onChange={(_event, value) => value && field.onChange(value)}
            exclusive
            fullWidth
            aria-label={t("goal")}
          >
            <ToggleButton value="lose">{t("lose")}</ToggleButton>
            <ToggleButton value="maintain">{t("maintain")}</ToggleButton>
            <ToggleButton value="gain">{t("gain")}</ToggleButton>
          </ToggleButtonGroup>
          <FormHelperText>{errors.goal?.message}</FormHelperText>
        </FormControl>
      )} />

      <Button type="submit" variant="contained" size="large" disabled={loading} startIcon={<CalculateRoundedIcon />} sx={{ py: 1.5 }}>
        {loading ? t("calculating") : t("calculate")}
      </Button>
      <Typography variant="caption" color="text.secondary" textAlign="center">
        {t("disclaimer")}
      </Typography>
    </Stack>
  );
}
