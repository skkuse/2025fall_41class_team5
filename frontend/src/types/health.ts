export type HealthCheckupFormData = {
  // generalInfo
  age: string;
  gender: string;
  height_cm: string;
  weight_kg: string;
  waist_cm: string;
  bmi: string;

  // bloodPressure
  systolic: string;
  diastolic: string;

  // bloodTest
  cholesterol_total: string;
  cholesterol_ldl: string;
  cholesterol_hdl: string;
  triglyceride: string;
  glucose_fasting: string;
  hemoglobin: string;

  // liverFunction
  ast: string;
  alt: string;
  gamma_gtp: string;

  // kidneyFunction
  creatinine: string;
  bun: string;
  gfr: string;

  // urineTest
  protein: string;
  glucose: string;
  ketone: string;
  occult_blood: string;

  // lifestyle
  drinking: string;
  smoking: string;
  exercise_per_week: string;
};
