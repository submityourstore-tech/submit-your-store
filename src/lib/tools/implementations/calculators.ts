import type { UtilityToolField } from "@/types/utility-tools";

// ---------------------------------------------------------------------------
// Type for calculator tool exports
// ---------------------------------------------------------------------------

export type CalculatorToolExport = {
  fields: UtilityToolField[];
  calculate: (values: Record<string, string>) => { label: string; value: string }[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(n: number, decimals = 2): string {
  return Number.isFinite(n) ? n.toFixed(decimals).replace(/\.?0+$/, "") : "—";
}

function currency(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
}

// ---------------------------------------------------------------------------
// 1. Percentage Calculator
// ---------------------------------------------------------------------------

export const percentageCalculator: CalculatorToolExport = {
  fields: [
    {
      key: "mode",
      label: "Calculation mode",
      type: "select",
      defaultValue: "of",
      options: [
        { value: "of", label: "What is X% of Y?" },
        { value: "is", label: "X is what % of Y?" },
        { value: "change", label: "% increase/decrease from X to Y?" },
      ],
      required: true,
    },
    {
      key: "value1",
      label: "Value 1 (X)",
      type: "number",
      placeholder: "Enter X",
      required: true,
    },
    {
      key: "value2",
      label: "Value 2 (Y)",
      type: "number",
      placeholder: "Enter Y",
      required: true,
    },
  ],
  calculate(values) {
    const x = parseFloat(values.value1);
    const y = parseFloat(values.value2);

    if (isNaN(x) || isNaN(y)) {
      return [{ label: "Error", value: "Please enter valid numbers for both values." }];
    }

    switch (values.mode) {
      case "of": {
        const result = (x / 100) * y;
        return [
          { label: "Result", value: fmt(result) },
          { label: "Formula", value: `${fmt(x)}% of ${fmt(y)} = ${fmt(result)}` },
        ];
      }
      case "is": {
        if (y === 0) return [{ label: "Error", value: "Value 2 (Y) cannot be zero." }];
        const result = (x / y) * 100;
        return [
          { label: "Result", value: `${fmt(result)}%` },
          { label: "Formula", value: `${fmt(x)} is ${fmt(result)}% of ${fmt(y)}` },
        ];
      }
      case "change": {
        if (x === 0) return [{ label: "Error", value: "Value 1 (X) cannot be zero for percentage change." }];
        const change = ((y - x) / Math.abs(x)) * 100;
        const direction = change >= 0 ? "increase" : "decrease";
        return [
          { label: "Percentage change", value: `${fmt(Math.abs(change))}%` },
          { label: "Direction", value: direction.charAt(0).toUpperCase() + direction.slice(1) },
          { label: "Formula", value: `From ${fmt(x)} to ${fmt(y)} → ${fmt(change)}% ${direction}` },
        ];
      }
      default:
        return [{ label: "Error", value: "Unknown calculation mode." }];
    }
  },
};

// ---------------------------------------------------------------------------
// 2. GST Calculator
// ---------------------------------------------------------------------------

export const gstCalculator: CalculatorToolExport = {
  fields: [
    {
      key: "amount",
      label: "Amount (₹)",
      type: "number",
      placeholder: "Enter amount",
      required: true,
    },
    {
      key: "gstRate",
      label: "GST Rate",
      type: "select",
      defaultValue: "18",
      options: [
        { value: "5", label: "5%" },
        { value: "12", label: "12%" },
        { value: "18", label: "18%" },
        { value: "28", label: "28%" },
        { value: "custom", label: "Custom rate" },
      ],
      required: true,
    },
    {
      key: "customRate",
      label: "Custom GST Rate (%)",
      type: "number",
      placeholder: "e.g. 7.5",
    },
    {
      key: "calcType",
      label: "Calculation type",
      type: "select",
      defaultValue: "exclusive",
      options: [
        { value: "exclusive", label: "GST Exclusive (add GST)" },
        { value: "inclusive", label: "GST Inclusive (extract GST)" },
      ],
      required: true,
    },
  ],
  calculate(values) {
    const amount = parseFloat(values.amount);
    if (isNaN(amount) || amount < 0) {
      return [{ label: "Error", value: "Please enter a valid positive amount." }];
    }

    const rate = values.gstRate === "custom"
      ? parseFloat(values.customRate)
      : parseFloat(values.gstRate);

    if (isNaN(rate) || rate < 0) {
      return [{ label: "Error", value: "Please enter a valid GST rate." }];
    }

    if (values.calcType === "exclusive") {
      const gstAmount = (amount * rate) / 100;
      const total = amount + gstAmount;
      return [
        { label: "Net amount", value: `₹${currency(amount)}` },
        { label: `GST amount (${fmt(rate)}%)`, value: `₹${currency(gstAmount)}` },
        { label: `CGST (${fmt(rate / 2)}%)`, value: `₹${currency(gstAmount / 2)}` },
        { label: `SGST (${fmt(rate / 2)}%)`, value: `₹${currency(gstAmount / 2)}` },
        { label: "Total amount", value: `₹${currency(total)}` },
      ];
    }

    // Inclusive: extract GST from total
    const netAmount = (amount * 100) / (100 + rate);
    const gstAmount = amount - netAmount;
    return [
      { label: "Total amount (incl. GST)", value: `₹${currency(amount)}` },
      { label: `GST amount (${fmt(rate)}%)`, value: `₹${currency(gstAmount)}` },
      { label: `CGST (${fmt(rate / 2)}%)`, value: `₹${currency(gstAmount / 2)}` },
      { label: `SGST (${fmt(rate / 2)}%)`, value: `₹${currency(gstAmount / 2)}` },
      { label: "Net amount", value: `₹${currency(netAmount)}` },
    ];
  },
};

// ---------------------------------------------------------------------------
// 3. Profit Margin Calculator
// ---------------------------------------------------------------------------

export const profitMarginCalculator: CalculatorToolExport = {
  fields: [
    {
      key: "mode",
      label: "Calculation mode",
      type: "select",
      defaultValue: "prices",
      options: [
        { value: "prices", label: "From cost & selling price" },
        { value: "margin", label: "From cost & desired margin %" },
      ],
      required: true,
    },
    {
      key: "costPrice",
      label: "Cost Price",
      type: "number",
      placeholder: "Enter cost price",
      required: true,
    },
    {
      key: "sellingPrice",
      label: "Selling Price",
      type: "number",
      placeholder: "Enter selling price",
    },
    {
      key: "desiredMargin",
      label: "Desired Margin (%)",
      type: "number",
      placeholder: "e.g. 30",
    },
  ],
  calculate(values) {
    const cost = parseFloat(values.costPrice);
    if (isNaN(cost) || cost < 0) {
      return [{ label: "Error", value: "Please enter a valid cost price." }];
    }

    let selling: number;

    if (values.mode === "margin") {
      const margin = parseFloat(values.desiredMargin);
      if (isNaN(margin) || margin >= 100) {
        return [{ label: "Error", value: "Please enter a valid margin percentage (less than 100)." }];
      }
      selling = cost / (1 - margin / 100);
    } else {
      selling = parseFloat(values.sellingPrice);
      if (isNaN(selling)) {
        return [{ label: "Error", value: "Please enter a valid selling price." }];
      }
    }

    const profit = selling - cost;
    const marginPct = selling !== 0 ? (profit / selling) * 100 : 0;
    const markupPct = cost !== 0 ? (profit / cost) * 100 : 0;

    return [
      { label: "Cost price", value: `₹${currency(cost)}` },
      { label: "Selling price", value: `₹${currency(selling)}` },
      { label: "Profit", value: `₹${currency(profit)}` },
      { label: "Profit margin", value: `${fmt(marginPct)}%` },
      { label: "Markup", value: `${fmt(markupPct)}%` },
    ];
  },
};

// ---------------------------------------------------------------------------
// 4. Discount Calculator
// ---------------------------------------------------------------------------

export const discountCalculator: CalculatorToolExport = {
  fields: [
    {
      key: "originalPrice",
      label: "Original Price",
      type: "number",
      placeholder: "Enter original price",
      required: true,
    },
    {
      key: "discountPercent",
      label: "Discount (%)",
      type: "number",
      placeholder: "e.g. 20",
      required: true,
    },
  ],
  calculate(values) {
    const price = parseFloat(values.originalPrice);
    const discount = parseFloat(values.discountPercent);

    if (isNaN(price) || price < 0) {
      return [{ label: "Error", value: "Please enter a valid original price." }];
    }
    if (isNaN(discount) || discount < 0 || discount > 100) {
      return [{ label: "Error", value: "Please enter a discount between 0 and 100." }];
    }

    const discountAmount = (price * discount) / 100;
    const finalPrice = price - discountAmount;

    return [
      { label: "Original price", value: `₹${currency(price)}` },
      { label: "Discount", value: `${fmt(discount)}%` },
      { label: "Discount amount", value: `₹${currency(discountAmount)}` },
      { label: "Final price", value: `₹${currency(finalPrice)}` },
      { label: "You save", value: `₹${currency(discountAmount)}` },
    ];
  },
};

// ---------------------------------------------------------------------------
// 5. Age Calculator
// ---------------------------------------------------------------------------

export const ageCalculator: CalculatorToolExport = {
  fields: [
    {
      key: "birthDate",
      label: "Birth Date (YYYY-MM-DD)",
      type: "text",
      placeholder: "e.g. 1990-06-15",
      required: true,
    },
  ],
  calculate(values) {
    const birth = new Date(values.birthDate);
    if (isNaN(birth.getTime())) {
      return [{ label: "Error", value: "Please enter a valid date in YYYY-MM-DD format." }];
    }

    const now = new Date();
    if (birth > now) {
      return [{ label: "Error", value: "Birth date cannot be in the future." }];
    }

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;

    const nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= now) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return [
      { label: "Age", value: `${years} years, ${months} months, ${days} days` },
      { label: "Total months", value: fmt(totalMonths, 0) },
      { label: "Total weeks", value: fmt(totalWeeks, 0) },
      { label: "Total days", value: fmt(totalDays, 0) },
      { label: "Next birthday in", value: `${daysUntilBirthday} days` },
      { label: "Born on", value: birth.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
    ];
  },
};

// ---------------------------------------------------------------------------
// 6. BMI Calculator
// ---------------------------------------------------------------------------

export const bmiCalculator: CalculatorToolExport = {
  fields: [
    {
      key: "weight",
      label: "Weight (kg)",
      type: "number",
      placeholder: "e.g. 70",
      required: true,
    },
    {
      key: "height",
      label: "Height (cm)",
      type: "number",
      placeholder: "e.g. 175",
      required: true,
    },
  ],
  calculate(values) {
    const weight = parseFloat(values.weight);
    const height = parseFloat(values.height);

    if (isNaN(weight) || weight <= 0) {
      return [{ label: "Error", value: "Please enter a valid weight in kilograms." }];
    }
    if (isNaN(height) || height <= 0) {
      return [{ label: "Error", value: "Please enter a valid height in centimeters." }];
    }

    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);

    let category: string;
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal weight";
    else if (bmi < 30) category = "Overweight";
    else if (bmi < 35) category = "Obese (Class I)";
    else if (bmi < 40) category = "Obese (Class II)";
    else category = "Obese (Class III)";

    const normalLow = (18.5 * heightM * heightM).toFixed(1);
    const normalHigh = (24.9 * heightM * heightM).toFixed(1);

    return [
      { label: "BMI", value: fmt(bmi) },
      { label: "Category", value: category },
      { label: "Healthy weight range", value: `${normalLow} – ${normalHigh} kg` },
      { label: "Weight", value: `${fmt(weight)} kg` },
      { label: "Height", value: `${fmt(height, 0)} cm (${fmt(heightM)} m)` },
    ];
  },
};

// ---------------------------------------------------------------------------
// 7. Loan EMI Calculator
// ---------------------------------------------------------------------------

export const emiCalculator: CalculatorToolExport = {
  fields: [
    {
      key: "principal",
      label: "Loan Amount",
      type: "number",
      placeholder: "e.g. 500000",
      required: true,
    },
    {
      key: "rate",
      label: "Annual Interest Rate (%)",
      type: "number",
      placeholder: "e.g. 8.5",
      required: true,
    },
    {
      key: "tenure",
      label: "Tenure (months)",
      type: "number",
      placeholder: "e.g. 60",
      required: true,
    },
  ],
  calculate(values) {
    const principal = parseFloat(values.principal);
    const annualRate = parseFloat(values.rate);
    const tenure = parseInt(values.tenure);

    if (isNaN(principal) || principal <= 0) {
      return [{ label: "Error", value: "Please enter a valid loan amount." }];
    }
    if (isNaN(annualRate) || annualRate < 0) {
      return [{ label: "Error", value: "Please enter a valid interest rate." }];
    }
    if (isNaN(tenure) || tenure <= 0) {
      return [{ label: "Error", value: "Please enter a valid tenure in months." }];
    }

    let emi: number;
    if (annualRate === 0) {
      emi = principal / tenure;
    } else {
      const monthlyRate = annualRate / 12 / 100;
      emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    }

    const totalPayment = emi * tenure;
    const totalInterest = totalPayment - principal;

    return [
      { label: "Monthly EMI", value: `₹${currency(emi)}` },
      { label: "Total interest", value: `₹${currency(totalInterest)}` },
      { label: "Total payment", value: `₹${currency(totalPayment)}` },
      { label: "Loan amount", value: `₹${currency(principal)}` },
      { label: "Interest rate", value: `${fmt(annualRate)}% per annum` },
      { label: "Tenure", value: `${tenure} months (${fmt(tenure / 12)} years)` },
    ];
  },
};

// ---------------------------------------------------------------------------
// 8. Tip Calculator
// ---------------------------------------------------------------------------

export const tipCalculator: CalculatorToolExport = {
  fields: [
    {
      key: "billAmount",
      label: "Bill Amount",
      type: "number",
      placeholder: "e.g. 85.50",
      required: true,
    },
    {
      key: "tipPercent",
      label: "Tip Percentage (%)",
      type: "number",
      placeholder: "e.g. 15",
      required: true,
    },
    {
      key: "splitBetween",
      label: "Split Between (people)",
      type: "number",
      placeholder: "e.g. 2",
      required: true,
    },
  ],
  calculate(values) {
    const bill = parseFloat(values.billAmount);
    const tipPct = parseFloat(values.tipPercent);
    const split = parseInt(values.splitBetween);

    if (isNaN(bill) || bill < 0) {
      return [{ label: "Error", value: "Please enter a valid bill amount." }];
    }
    if (isNaN(tipPct) || tipPct < 0) {
      return [{ label: "Error", value: "Please enter a valid tip percentage." }];
    }
    if (isNaN(split) || split < 1) {
      return [{ label: "Error", value: "Please enter at least 1 person for splitting." }];
    }

    const tipAmount = (bill * tipPct) / 100;
    const total = bill + tipAmount;
    const perPerson = total / split;
    const tipPerPerson = tipAmount / split;

    return [
      { label: "Tip amount", value: `$${currency(tipAmount)}` },
      { label: "Total (bill + tip)", value: `$${currency(total)}` },
      { label: "Per person total", value: `$${currency(perPerson)}` },
      { label: "Per person tip", value: `$${currency(tipPerPerson)}` },
      { label: "Bill amount", value: `$${currency(bill)}` },
      { label: "Tip percentage", value: `${fmt(tipPct)}%` },
    ];
  },
};
