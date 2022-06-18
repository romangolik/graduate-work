import { getEconomicCalculationsData } from '../config-control/config-control.js';

const {
    vat,
    k_ic,
    management,
    tax_payments,
    operator_pay,
    depreciation_of_equipment,
} = getEconomicCalculationsData().coefficients;

const calcMaterialCosts = (size, materialCost) => {
    const workpieceCost = ((size.height * size.width) / 10000) * materialCost;
    return workpieceCost * (1 + k_ic);
}

const calcProcessingCost = time => {
    const t_pcb = time / 3600;
    return +(t_pcb * (operator_pay + depreciation_of_equipment)).toFixed(2);
}

const calcTaxFul = time => {
    const t_pcb = time / 3600;
    return +((t_pcb * operator_pay + calcProcessingCost(time) * (1 + management)) * (tax_payments + vat)).toFixed(2);
}

export const calcTotalSum = (size, materialCost, time) => {
    const materialCosts = calcMaterialCosts(size, materialCost);
    const processingCost = calcProcessingCost(time);
    const taxPayments = calcTaxFul(time);

    const printingCost = (processingCost + materialCosts).toFixed(2);

    return {
        totalCost: +(processingCost + materialCosts + taxPayments).toFixed(2),
        printingCost,
        taxPayments
    }
}
