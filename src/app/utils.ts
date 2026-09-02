import { useMemo } from "react";
import { IUnitList } from "./dashboard/unit/interfaces/unit.interface";
import { IOrderItemDisplay } from "./dashboard/order/interfaces/order.interface";
import html2canvas from 'html2canvas';

export const formatCurrency = (amount: number) => {
    let nfObject = new Intl.NumberFormat('en-US');
    return nfObject.format(amount) + " MMK"
}

export const roundUpPrice = (amount: string) => {
    const numericAmount = parseFloat(amount);
    if (!Number.isFinite(numericAmount)) {
        return 0;
    }

    return Math.ceil(numericAmount / 100) * 100;
}

export const isDecimal = (input: string) => {
    return input.includes(".");
}

export const calculateRoundUpUnit = (hierarchy: IUnitList[], lowestQty: number) => {
    let roundupUnits = [];
    let currentUnitQuantity = lowestQty
    let currentHierarchy = [...hierarchy];
    currentHierarchy.reverse();
    for (let i = 0; i < currentHierarchy.length; i++) {
        let unit = currentHierarchy[i];
        if (unit.parent_unit) {

            let upperUnitQuantity = Math.floor(currentUnitQuantity / unit.quantity_per_parent_unit);
            let currentUnitRemainderQuantity = currentUnitQuantity % unit.quantity_per_parent_unit;
            if (currentUnitRemainderQuantity > 0) {
                roundupUnits.unshift({ unit_id: unit.unit_id, unit_name: unit.unit_name, quantity: currentUnitRemainderQuantity })
            }
            if (upperUnitQuantity > 0) {
                currentUnitQuantity = upperUnitQuantity;
            } else {
                break;
            }
        } else {
            roundupUnits.unshift({ unit_id: unit.unit_id, unit_name: unit.unit_name, quantity: currentUnitQuantity })
        }
    }
    return roundupUnits;

};

export const calculateLowestUnitQuantity = (hierarchy: IUnitList[], quantityList: any[]) => {
    let currentUnitQuantity = 0;
    let lastUnitId = "";
    let lastUnitName = "";
    for (let i = 0; i < hierarchy.length; i++) {
        let unit = hierarchy[i];
        // skip the first unit which does not have quantity_per_parent_unit
        if (i > 0) {
            currentUnitQuantity *= parseFloat(unit.quantity_per_parent_unit);
        }
        let unitQuantites = quantityList.filter(x => x.unit_id == unit.unit_id);
        unitQuantites.forEach((qty) => {
            currentUnitQuantity += parseFloat(qty.quantity);
        });

        // for lowest unit
        if (i == hierarchy.length - 1) {
            lastUnitId = unit.unit_id;
            lastUnitName = unit.unit_name;
        }
    }

    return { unit_id: lastUnitId, unit_name: lastUnitName, quantity: currentUnitQuantity }
}

export const calculateQuantityWithProduct = async (productId: string, quantityList: any[]) => {
    let unitHierarchy = await getUnitHierarchyByProduct(productId);
    if (unitHierarchy) {
        return calculateQuantityWithHierarchy(unitHierarchy, quantityList);
    }
}

export const calculateQuantityWithHierarchy = (unitHierarchy: IUnitList[], quantityList: any[]) => {
    let lowestQty = calculateLowestUnitQuantity(unitHierarchy, quantityList)
    let roundupQuantityString = "";
    let roundupQuantityList: any[] = [];
    let roundupQuantity = calculateRoundUpUnit(unitHierarchy, lowestQty.quantity);

    roundupQuantity.forEach((qty) => {
        roundupQuantityString += `${qty.quantity} ${qty.unit_name} `;
        roundupQuantityList.push({ id: qty.unit_id, quantity: qty.quantity, unit_id: qty.unit_id, unit_name: qty.unit_name, unit: { value: qty.unit_id, label: qty.unit_name } })
    })
    roundupQuantityString = roundupQuantityString != "" ? roundupQuantityString : "0"
    return { quantityList: roundupQuantityList, quantityString: roundupQuantityString, unitHierarchy };
}

export const getUnitHierarchyByProduct = async (product_id: string) => {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL + "product/getProductUnitHierarchy/" + product_id
    let response = await fetch(url);
    if (response.ok) {
        let result: IUnitList[] = await response.json();
        return result
    }
}

export const getAllUnitHierarchies = async () => {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL + "unit/getUnitHierarchies";
    let response = await fetch(url);
    if (response.ok) {
        let result: IUnitList[][] = await response.json();
        return result;
    }
}

export const findAndCalculateUnitHierarchy = (hierarchies: IUnitList[][], unit_id: string, qunatityList: any[], per_bag_unit_id: string, per_bag_unit_qunatity: string) => {
    let unitHierarchy = hierarchies.find(x => x.some(y => y.unit_id == unit_id));
    if (unitHierarchy) {
        // let bagUnit = { unit_id: process.env.NEXT_PUBLIC_BAG_UNIT_ID ?? '', unit_name: process.env.NEXT_PUBLIC_BAG_UNIT_NAME ?? '', unit_symbol: process.env.NEXT_PUBLIC_BAG_UNIT_NAME ?? '' }
        // let bagConnectedUnitIndex = unitHierarchy.findIndex(x => x.unit_id == per_bag_unit_id);
        // if (bagConnectedUnitIndex >= 0) {
        //     unitHierarchy[bagConnectedUnitIndex].parent_unit = bagUnit;
        //     unitHierarchy[bagConnectedUnitIndex].quantity_per_parent_unit = per_bag_unit_qunatity;
        //     unitHierarchy.splice(0, bagConnectedUnitIndex);
        //     unitHierarchy.unshift(bagUnit);
        // }
        // return calculateQuantityWithHierarchy(unitHierarchy, qunatityList);
        return bindAndCalculatePerBagUnitHierarchy(unitHierarchy, qunatityList, per_bag_unit_id, per_bag_unit_qunatity);
    }
}

export const bindAndCalculatePerBagUnitHierarchy = (unitHierarchy: IUnitList[], qunatityList: any[], per_bag_unit_id: string, per_bag_unit_qunatity: string) => {
    unitHierarchy = bindPerBagUnitHierarchy(unitHierarchy, per_bag_unit_id, per_bag_unit_qunatity)
    return calculateQuantityWithHierarchy(unitHierarchy, qunatityList);
}

export const bindPerBagUnitHierarchy = (unitHierarchy: IUnitList[], per_bag_unit_id: string, per_bag_unit_qunatity: string) => {
    let bagUnit = { unit_id: process.env.NEXT_PUBLIC_BAG_UNIT_ID ?? '', unit_name: process.env.NEXT_PUBLIC_BAG_UNIT_NAME ?? '', unit_symbol: process.env.NEXT_PUBLIC_BAG_UNIT_NAME ?? '' }
    let bagConnectedUnitIndex = unitHierarchy.findIndex(x => x.unit_id == per_bag_unit_id);
    if (bagConnectedUnitIndex >= 0) {
        unitHierarchy[bagConnectedUnitIndex].parent_unit = bagUnit;
        unitHierarchy[bagConnectedUnitIndex].quantity_per_parent_unit = per_bag_unit_qunatity;
        unitHierarchy.splice(0, bagConnectedUnitIndex);
        unitHierarchy.unshift(bagUnit);
    }
    return unitHierarchy;
}

export const handleNextFocus = (e: any, nextRef: React.RefObject<HTMLInputElement | null>) => {
    if (e.key === 'Enter') {
        if (nextRef && nextRef.current) {
            nextRef.current.focus();
        }
    }
}

// export const generateReceiptBuffer = (order: any): Uint8Array => {
//     const encoder = new TextEncoder();

//     const ESC = 0x1b;
//     const GS = 0x1d;
//     const Initialize = [ESC, 0x40];
//     const BoldOn = [ESC, 0x45, 0x01];
//     const BoldOff = [ESC, 0x45, 0x00];
//     const Center = [ESC, 0x61, 0x01];
//     const Cut = [GS, 0x56, 0x41, 0x00];

//     let commands: number[] = [
//         ...Initialize,
//         ...Center,
//         ...BoldOn,
//         ...Array.from(encoder.encode("THALARHTUN\n")),
//         ...BoldOff,
//         ...Array.from(encoder.encode(`Voucher No: ${order.voucher_code}\n`)),
//         ...Array.from(encoder.encode("--------------------------\n")),
//     ];

//     order.order_items.forEach((item: IOrderItemDisplay) => {
//         const line = `${item.product_name?.padEnd(15)} x${item.unit_quantity} ${item.selling_price}\n`;
//         commands.push(...Array.from(encoder.encode(line)));
//     });

//     commands.push(
//         ...Array.from(encoder.encode("--------------------------\n")),
//         ...BoldOn,
//         ...Array.from(encoder.encode(`TOTAL: ${order.total}\n\n\n`)),
//         ...BoldOff,
//         ...Cut
//     );

//     return new Uint8Array(commands);
// };


// export const generateReceiptBufferFromHTML = async (order: any): Promise<Uint8Array> => {
//     // 1. Create a hidden container for the receipt layout
//     const container = document.createElement('div');
//     container.style.position = 'absolute';
//     container.style.left = '-9999px';
//     container.style.top = '-9999px';
//     container.style.width = '384px'; // Standard width for 58mm thermal printers (80mm uses ~576px)
//     container.style.backgroundColor = '#ffffff';
//     container.style.color = '#000000';
//     container.style.fontFamily = '"Myanmar Text", "Padauk", "Pyidaungsu", sans-serif';
//     container.style.fontSize = '14px';
//     container.style.lineHeight = '1.6';
//     container.style.padding = '10px';

//     // Format fallbacks dynamically
//     const voucherCode = order?.voucher_code ?? 'VC0001';
//     const dateStr = order?.date ?? '10.05.2026 8:43 PM';
//     const customerName = order?.customer_name ?? 'ထက်အောင်ဟိန်း';
//     const customerAddress = order?.customer_address ?? 'မန္တလေး';

//     const otherCharges = order?.other_charges ?? '-';
//     const totalAmount = order?.total ?? '-';
//     const paidAmount = order?.paid_amount ?? '-';
//     const changeAmount = order?.change_amount ?? '-';

//     // 2. Build the exact visual layout using HTML & Inline CSS
//     container.innerHTML = `
//         <div style="text-align: right; font-size: 14px; font-weight: bold; margin-bottom: 10px;">${voucherCode}</div>

//         <div style="text-align: center; margin-bottom: 15px;">
//             <div style="font-size: 26px; font-weight: bold; margin-bottom: 2px;">သလ္လာထွန်း</div>
//             <div style="font-size: 18px; margin-bottom: 4px;">ပဲမျိုးစုံရောင်းဝယ်ရေး</div>
//             <div style="font-size: 13px; margin-bottom: 2px;">၈၇လမ်း၊ ၂၇x၂၈ကြား၊ မန္တလေးမြို့။</div>
//             <div style="font-size: 13px; margin-bottom: 6px;">09 2032794 | 09 793043753 | 09 779699003</div>
//             <div style="font-size: 13px;">Date : ${dateStr}</div>
//         </div>

//         <div style="margin-bottom: 15px; font-size: 15px;">
//             <div>အမည် - ${customerName}</div>
//             <div>လိပ်စာ - ${customerAddress}</div>
//         </div>

//         <div style="text-align: center; font-size: 16px; font-weight: bold; letter-spacing: 1px; margin-bottom: 10px;">INVOICE</div>

//         <div id="items-section">
//             ${(order?.order_items || [{}, {}, {}]).map((item: any) => `
//                 <div style="text-align: center; color: #000000; letter-spacing: 1px; margin: 2px 0; display:flex; justify-content: space-between;">
//                 <span>${item.product_name}</span>
//                 <span>${item.unit_quantity}</span>
//                 <span>${item.selling_price}</span>
//                 </div>
//                 <div style="text-align: center; font-size: 12px; margin: 2px 0;">++++++</div>
//             `).join('')}
//             <div style="text-align: center; color: #000000; letter-spacing: 1px; margin: 2px 0;">++++++++++++++++++++++++++++++++++++</div>
//         </div>

//         <div style="margin-top: 15px; padding: 0 5px; font-size: 15px;">
//             <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
//                 <span>အခြား</span>
//                 <span>${otherCharges}</span>
//             </div>
//             <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
//                 <span>စုစုပေါင်း</span>
//                 <span>${totalAmount}</span>
//             </div>
//             <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
//                 <span>ပေးငွေ</span>
//                 <span>${paidAmount}</span>
//             </div>
//             <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
//                 <span>ကျန်ငွေ</span>
//                 <span>${changeAmount}</span>
//             </div>
//         </div>

//         <div style="text-align: center; margin-top: 30px; font-size: 15px; line-height: 1.4;">
//             <div>*ဝယ်ယူအားပေးမှုကို</div>
//             <div>ကျေးဇူးအထူးတင်ရှိပါသည်*</div>
//         </div>
//     `;

//     document.body.appendChild(container);

//     // 3. Render the DOM element into a canvas image map
//     const canvas = await html2canvas(container, {
//         width: 384,
//         scale: 1, // Keep standard scale to map pixels beautifully to thermal dots
//         logging: false,
//         backgroundColor: '#ffffff'
//     });

//     document.body.removeChild(container);

//     // 4. Convert Canvas Pixel data to raw ESC/POS Bit-Image Data
//     const ctx = canvas.getContext('2d');
//     if (!ctx) throw new Error('Could not get 2D canvas context');

//     const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//     const commands: number[] = [];

//     // ESC/POS Initialization
//     commands.push(0x1b, 0x40); // Initialize printer

//     // Print parameters
//     const widthPixels = canvas.width;
//     const heightPixels = canvas.height;
//     const widthBytes = Math.ceil(widthPixels / 8);

//     // GS v 0 Command for Raster Bit Image Printing
//     commands.push(0x1d, 0x76, 0x30, 0x00);
//     commands.push(widthBytes & 0xff, (widthBytes >> 8) & 0xff); // xL, xH bytes
//     commands.push(heightPixels & 0xff, (heightPixels >> 8) & 0xff); // yL, yH bytes

//     // Pack 8 pixels per byte (1 bit per pixel: 1 = Black, 0 = White)
//     for (let y = 0; y < heightPixels; y++) {
//         for (let xBytes = 0; xBytes < widthBytes; xBytes++) {
//             let byteValue = 0;
//             for (let bit = 0; bit < 8; bit++) {
//                 const xPixel = xBytes * 8 + bit;
//                 if (xPixel < widthPixels) {
//                     const idx = (y * widthPixels + xPixel) * 4;
//                     const r = imgData.data[idx];
//                     const g = imgData.data[idx + 1];
//                     const b = imgData.data[idx + 2];
//                     const alpha = imgData.data[idx + 3];

//                     // Simple luminance threshold to classify pixel as light or dark
//                     const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
//                     if (alpha > 128 && luminance < 128) {
//                         byteValue |= (1 << (7 - bit)); // Set the bit to 1 (Black)
//                     }
//                 }
//             }
//             commands.push(byteValue);
//         }
//     }

//     // Paper Cut Commands
//     commands.push(0x1d, 0x56, 0x41, 0x00);

//     return new Uint8Array(commands);
// };

export const sleep = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

const ESC = 0x1b;
const GS = 0x1d;

const PRINTER_WIDTH = 576; // 80mm printer
const IMAGE_BLOCK_HEIGHT = 120;

const uint8Concat = (arrays: Uint8Array[]) => {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);

    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }

    return result;
};

export const buildReceiptElement = (order: any): HTMLDivElement => {
    const container = document.createElement("div");

    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.width = `${PRINTER_WIDTH}px`;
    container.style.backgroundColor = "#ffffff";
    container.style.color = "#000000";
    container.style.fontFamily = `"Myanmar Text", "Padauk", "Pyidaungsu", sans-serif`;
    container.style.fontSize = "24px";
    container.style.lineHeight = "1.45";
    container.style.padding = "0 24px";
    container.style.boxSizing = "border-box";

    const items = order?.order_items ?? [];

    container.innerHTML = `
    <div style="text-align:right;font-size:22px;font-weight:bold;margin-top:10px;">
      ${order?.voucher_code ?? "VC0001"}
    </div>

    <div style="text-align:center;margin-top:25px;">
      <div style="font-size:46px;font-weight:bold;">သလ္လာထွန်း</div>
      <div style="font-size:30px;">ပဲမျိုးစုံရောင်းဝယ်ရေး</div>
      <div style="font-size:24px;">၈၇လမ်း၊ ၂၇x၂၈ကြား၊ မန္တလေးမြို့။</div>
      <div style="font-size:22px;">09 2032794 | 09 793043753 | 09 779699003</div>
      <div style="font-size:22px;margin-top:8px;">Date : ${order?.date ?? ""}</div>
    </div>

    <div style="margin-top:20px;font-size:26px;">
      <div>အမည် - ${order?.customer_name ?? ""}</div>
      <div>လိပ်စာ - ${order?.customer_address ?? ""}</div>
    </div>

    <div style="text-align:center;font-size:30px;font-weight:bold;margin:28px 0 18px;">
      INVOICE
    </div>

    <div style="font-size:24px;">
      ${items.length > 0
            ? items.map((item: any) => `
              <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:8px;">
                <div style="width:45%;word-break:break-word;">${item.product_name ?? ""}</div>
                <div style="width:30%;text-align:center;">${item.unit_quantity ?? ""}</div>
                <div style="width:25%;text-align:right;">${item.selling_price ?? ""}</div>
              </div>
            `).join("")
            : `
              <div style="text-align:center;">++++++++++++++++++++++++++++++++++++</div>
              <div style="text-align:center;margin:18px 0;">++++++</div>
              <div style="text-align:center;">++++++++++++++++++++++++++++++++++++</div>
              <div style="text-align:center;margin:18px 0;">++++++</div>
              <div style="text-align:center;">++++++++++++++++++++++++++++++++++++</div>
              <div style="text-align:center;margin:18px 0;">++++++</div>
            `
        }
    </div>

    <div style="margin-top:35px;font-size:26px;">
      <div style="display:flex;justify-content:space-between;">
        <span>အခြား</span>
        <span>${order?.other_charges ?? "-"}</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span>စုစုပေါင်း</span>
        <span>${order?.total ?? "-"}</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span>ပေးငွေ</span>
        <span>${order?.paid_amount ?? "-"}</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span>ကျန်ငွေ</span>
        <span>${order?.change_amount ?? "-"}</span>
      </div>
    </div>

    <div style="text-align:center;margin-top:60px;font-size:28px;line-height:1.5;">
      <div>*ဝယ်ယူအားပေးမှုကို</div>
      <div>ကျေးဇူးအထူးတင်ရှိပါသည်*</div>
    </div>
  `;

    return container;
};

export const generateReceiptBufferFromHTML = async (order: any): Promise<Uint8Array> => {
    const container = buildReceiptElement(order);
    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
        width: PRINTER_WIDTH,
        scale: 1,
        backgroundColor: "#ffffff",
        logging: false,
    });

    document.body.removeChild(container);

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not found");

    const commands: Uint8Array[] = [];

    // Init printer
    commands.push(new Uint8Array([ESC, 0x40]));

    const widthPixels = canvas.width;
    const heightPixels = canvas.height;
    const widthBytes = Math.ceil(widthPixels / 8);

    for (let blockY = 0; blockY < heightPixels; blockY += IMAGE_BLOCK_HEIGHT) {
        const blockHeight = Math.min(IMAGE_BLOCK_HEIGHT, heightPixels - blockY);
        const imgData = ctx.getImageData(0, blockY, widthPixels, blockHeight);

        const block: number[] = [];

        // GS v 0
        block.push(GS, 0x76, 0x30, 0x00);

        // Width bytes
        block.push(widthBytes & 0xff, (widthBytes >> 8) & 0xff);

        // Height dots
        block.push(blockHeight & 0xff, (blockHeight >> 8) & 0xff);

        for (let y = 0; y < blockHeight; y++) {
            for (let xb = 0; xb < widthBytes; xb++) {
                let byteValue = 0;

                for (let bit = 0; bit < 8; bit++) {
                    const x = xb * 8 + bit;

                    if (x < widthPixels) {
                        const idx = (y * widthPixels + x) * 4;
                        const r = imgData.data[idx];
                        const g = imgData.data[idx + 1];
                        const b = imgData.data[idx + 2];
                        const a = imgData.data[idx + 3];

                        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

                        if (a > 128 && luminance < 150) {
                            byteValue |= 1 << (7 - bit);
                        }
                    }
                }

                block.push(byteValue);
            }
        }

        commands.push(new Uint8Array(block));

        // Small feed between blocks
        commands.push(new Uint8Array([ESC, 0x64, 0x00]));
    }

    // Feed and cut
    commands.push(new Uint8Array([
        ESC, 0x64, 0x04,
        GS, 0x56, 0x41, 0x00,
    ]));

    return uint8Concat(commands);
};
