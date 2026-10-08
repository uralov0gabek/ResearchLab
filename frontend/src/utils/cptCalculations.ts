export interface CPTSummary {
  alpha: number | null;
  beta: number | null;
  lambda: number | null;
}

interface ResponseWithCPT {
  calculated_cpt_parameters?: Partial<CPTSummary> | null;
  alpha?: number | string | null;
  beta?: number | string | null;
  lambda?: number | string | null;
}

const finiteParameter = (value: unknown): number | null => {
  if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

// All admin screens display the authoritative server calculation.
export const getResponseCPT = (response: ResponseWithCPT): CPTSummary => {
  const source = response.calculated_cpt_parameters ?? response;
  return {
    alpha: finiteParameter(source.alpha),
    beta: finiteParameter(source.beta),
    lambda: finiteParameter(source.lambda),
  };
};
