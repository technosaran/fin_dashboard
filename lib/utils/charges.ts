import { AppSettings } from '../types';

// Real math for Indian Stock Market Charges
export const calculateStockCharges = (
    type: 'BUY' | 'SELL',
    quantity: number,
    price: number,
    settings: AppSettings
) => {
    const turnover = quantity * price;

    // 1. Brokerage
    const brokerage = settings.brokerageType === 'flat'
        ? settings.brokerageValue
        : (turnover * settings.brokerageValue) / 100;

    // 2. STT (0.1% for Delivery)
    const stt = Math.round(turnover * (settings.sttRate / 100));

    // 3. Transaction Charges (NSE: 0.00325%)
    const transCharges = turnover * (settings.transactionChargeRate / 100);

    // 4. SEBI Charges (0.0001%)
    const sebiCharges = turnover * (settings.sebiChargeRate / 100);

    // 5. Stamp Duty (0.015% on Buy only)
    const stampDuty = type === 'BUY' ? turnover * (settings.stampDutyRate / 100) : 0;

    // 6. GST (18% on Brokerage + Trans Charges + SEBI)
    const gst = (brokerage + transCharges + sebiCharges) * (settings.gstRate / 100);

    // 7. DP Charges (Flat ₹13.5 + GST on Sell Scrip)
    const dpCharges = type === 'SELL' ? settings.dpCharges : 0;

    const totalCharges = brokerage + stt + transCharges + sebiCharges + stampDuty + gst + dpCharges;

    return {
        brokerage: Number(brokerage.toFixed(2)),
        stt: Number(stt.toFixed(2)),
        transactionCharges: Number(transCharges.toFixed(2)),
        sebiCharges: Number(sebiCharges.toFixed(2)),
        stampDuty: Number(stampDuty.toFixed(2)),
        gst: Number(gst.toFixed(2)),
        dpCharges: Number(dpCharges.toFixed(2)),
        taxes: Number((totalCharges - brokerage).toFixed(2)),
        total: Number(totalCharges.toFixed(2))
    };
};

export const calculateMfCharges = (
    type: 'BUY' | 'SELL' | 'SIP',
    amount: number
) => {
    // Stamp duty is 0.005% on Purchase/SIP (0.00005)
    const stampDuty = (type === 'BUY' || type === 'SIP') ? amount * 0.00005 : 0;

    return {
        stampDuty: Number(stampDuty.toFixed(2)),
        total: Number(stampDuty.toFixed(2))
    };
};

export const calculateBondCharges = (
    type: 'BUY' | 'SELL',
    quantity: number,
    price: number,
    settings: AppSettings
) => {
    const turnover = quantity * price;

    // Brokerage
    const brokerage = settings.brokerageType === 'flat'
        ? settings.brokerageValue
        : (turnover * settings.brokerageValue) / 100;

    // Stamp Duty for bonds is 0.0001% (0.000001)
    const stampDuty = type === 'BUY' ? turnover * 0.000001 : 0;

    // GST on brokerage (usually 18%)
    const gst = brokerage * (settings.gstRate / 100);

    const total = brokerage + stampDuty + gst;

    return {
        brokerage: Number(brokerage.toFixed(2)),
        stampDuty: Number(stampDuty.toFixed(2)),
        gst: Number(gst.toFixed(2)),
        total: Number(total.toFixed(2))
    };
};
