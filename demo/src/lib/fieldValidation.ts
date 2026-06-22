export interface FieldRule {
  required?: boolean;
  type?: 'string' | 'integer' | 'decimal' | 'year' | 'month' | 'email' | 'phone' | 'select';
  options?: string[];
  min?: number;
  max?: number;
  regex?: RegExp;
  hint?: string;
  errorMsg?: string;
}

export function validateField(value: string, rule: FieldRule): { valid: boolean; error: string | null } {
  if (rule.required && !value.trim()) {
    return { valid: false, error: rule.errorMsg || 'This field is required' };
  }
  if (!value.trim()) return { valid: true, error: null };

  switch (rule.type) {
    case 'integer': {
      if (!/^\d+$/.test(value)) return { valid: false, error: 'Must be a whole number' };
      const n = parseInt(value);
      if (rule.min !== undefined && n < rule.min) return { valid: false, error: `Minimum value is ${rule.min}` };
      if (rule.max !== undefined && n > rule.max) return { valid: false, error: `Maximum value is ${rule.max}` };
      break;
    }
    case 'decimal': {
      if (!/^\d+\.?\d*$/.test(value)) return { valid: false, error: 'Must be a number (e.g., 1.013)' };
      const n = parseFloat(value);
      if (rule.min !== undefined && n < rule.min) return { valid: false, error: `Minimum is ${rule.min}` };
      if (rule.max !== undefined && n > rule.max) return { valid: false, error: `Maximum is ${rule.max}` };
      break;
    }
    case 'year': {
      if (!/^\d{4}$/.test(value)) return { valid: false, error: 'Must be a 4-digit year (e.g., 2026)' };
      const y = parseInt(value);
      if (y < 2020 || y > 2030) return { valid: false, error: 'Year must be between 2020 and 2030' };
      break;
    }
    case 'month': {
      const months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
      if (!months.includes(value.toLowerCase())) return { valid: false, error: 'Enter a valid month name (e.g., July)' };
      break;
    }
    case 'email': {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { valid: false, error: 'Enter a valid email address' };
      break;
    }
    case 'phone': {
      if (!/^[\d\s\-\(\)\+]+$/.test(value)) return { valid: false, error: 'Enter a valid phone number' };
      break;
    }
    case 'select': {
      if (rule.options && !rule.options.includes(value)) {
        return { valid: false, error: `Select one of: ${rule.options.join(', ')}` };
      }
      break;
    }
  }
  if (rule.regex && !rule.regex.test(value)) {
    return { valid: false, error: rule.errorMsg || 'Invalid format' };
  }
  return { valid: true, error: null };
}

// Controlled vocabulary options (from F6 and F4)
export const bucketOptions = ['0.950', '0.975', '1.000', '1.025', '1.050', '1.075', '1.100'];
export const commissionOptions = [
  { value: '0.02', label: 'GAB (0.02)' },
  { value: '0.03', label: 'OB-Friendly (0.03)' },
  { value: '0.04', label: 'OB (0.04)' },
  { value: '0.05', label: 'Deduct & Credit Only (0.05)' },
];
export const corpTypeOptions = ['C-Corp', 'S-Corp', 'LLC', 'Partnership', 'Sole Proprietor', 'Non-Profit', '501(c)(3)'];
export const carrierOptions = ['BCBS Texas', 'Cigna National', 'UnitedHealthcare', 'Anthem', 'Kaiser', 'Aetna', 'BCBS IL', 'Wellmark', 'Open Market'];
export const monthOptions = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const medicalPlanOptions = ['BCBSTX PPO $500', 'BCBSTX PPO $1000', 'BCBSTX HDHP $3300', 'BCBSTX HDHP $5000', 'Cigna OAP', 'Cigna PPO', 'Open Market', 'Not Offered'];
export const ancillaryPlanOptions = ['Guardian PPO $1500', 'Guardian PPO $2000', 'Guardian Base PPO', 'Unum', 'Northwestern Mutual', 'Open Market', 'Not Offered', ''];

// Field rules for NB1 Seed Information
export const seedFieldRules: Record<string, FieldRule> = {
  company:   { required: true, type: 'string', hint: 'Legal company name', errorMsg: 'Company name is required' },
  planYear:  { required: true, type: 'year', hint: '4-digit year (e.g., 2026)' },
  eeCount:   { required: true, type: 'integer', min: 1, max: 99999, hint: 'Whole number (1–99,999)' },
  effMonth:  { required: true, type: 'select', options: monthOptions, hint: 'Select effective month' },
  carrier:   { required: true, type: 'select', options: carrierOptions, hint: 'Select primary medical carrier' },
};

// Field rules for NB3 Assembly
export const assemblyFieldRules: Record<string, FieldRule> = {
  'Company Info__Company Name':    { required: true, type: 'string' },
  'Company Info__Plan Year':       { required: true, type: 'year' },
  'Company Info__Medical Carrier': { required: true, type: 'select', options: carrierOptions },
  'Company Info__EE Count':        { required: true, type: 'integer', min: 1, hint: 'Whole number' },
  'Company Info__Corp Type':       { required: true, type: 'select', options: corpTypeOptions, hint: 'Select entity type' },
  'Company Info__Client Contact':  { required: true, type: 'string', hint: 'Contact name or email' },
  'Underwriting__Bucket':          { required: true, type: 'select', options: bucketOptions, hint: 'Select carrier bucket band' },
  'Underwriting__Admin Factor':    { required: true, type: 'decimal', min: 1.0, max: 1.05, hint: 'Decimal 1.000–1.050 (e.g., 1.013)' },
  'Underwriting__Commission':      { required: true, type: 'select', options: commissionOptions.map(c => c.value), hint: 'Select commission type' },
  'Underwriting__Risk Factor':     { required: true, type: 'decimal', min: 1.0, max: 1.1, hint: 'Decimal 1.000–1.100 (e.g., 1.043)' },
  'Underwriting__Multiplier':      { type: 'decimal', hint: 'Auto-calculated' },
  'Products__Medical':             { required: true, type: 'select', options: medicalPlanOptions, hint: 'Select master plan' },
  'Products__Dental':              { type: 'select', options: ancillaryPlanOptions, hint: 'Select or leave empty' },
  'Products__Vision':              { type: 'select', options: ancillaryPlanOptions, hint: 'Select or leave empty' },
  'Products__Life / Vol':          { type: 'select', options: ['Unum 1x Salary', 'Unum 2x Salary', 'Open Market', 'Not Offered', ''], hint: 'Select or leave empty' },
};
