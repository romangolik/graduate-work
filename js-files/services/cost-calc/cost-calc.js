import { getEconomicCalculationsData } from '../config-control/config-control.js';

const {
    vat,
    k_ic,
    management,
    tax_payments,
    operator_pay,
    depreciation_of_equipment,
} = getEconomicCalculationsData().coefficients;

const calcMaterialCosts = (width, height, materialCost) => {
    const workpieceCost = ((height * width) / 10000) * materialCost;
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

export const calcTotalSum = (width, height, materialCost, time) => {
    const materialCosts = calcMaterialCosts(width, height, materialCost);
    const processingCost = calcProcessingCost(time);
    const taxPaymentsCost = calcTaxFul(time);

    const printingCost = (processingCost + materialCosts).toFixed(2);

    return {
        totalCost: +(processingCost + materialCosts + taxPaymentsCost).toFixed(2),
        printingCost,
        taxPaymentsCost
    }
}
