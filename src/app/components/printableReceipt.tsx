import { forwardRef } from "react";

type ReceiptProps = {
    order: any;
};

const PrintableReceipt = forwardRef<
    HTMLDivElement,
    { order: any }
>(({ order }, ref) => (
    <div ref={ref}>
        <div id="printable-receipt" className="thermal-receipt">
            <div className="voucher-code">
                {order.voucher_code ?? "VC0001"}
            </div>

            <section className="store-header">
                <h1 className="font-bolder">သလ္လာထွန်း</h1>
                <div className="store-type font-bold">ပဲမျိုးစုံရောင်းဝယ်ရေး</div>
                <div className="font-bold">၈၇လမ်း၊ ၂၇x၂၈ကြား၊ မန္တလေးမြို့။</div>
                <div className="font-bold text-[11px]">09 2032794 | 09 793043753 | 09 779699003</div>
                <div className="date text-right">Date : {order.date}</div>
            </section>

            <section className="customer">
                <div>အမည် - <b>{order.customer_name ?? ""}</b></div>
                <div>လိပ်စာ - {order.customer_address ?? ""}</div>
            </section>

            <h2 className="invoice-title">INVOICE</h2>

            <div className="separator" />

            <section className="items">
                {(order.order_items ?? []).map((item: any, index: number) => (
                    <div className="item" key={item.item_id ?? index}>
                        <div className="product-name">
                            {item.product_name}
                        </div>

                        <div className="item-detail">
                            <span>{item.unit_quantity} x {Number(item.product?.selling_price ?? 0).toLocaleString("en-US")}</span>
                            <span>
                                {Number(item.selling_price ?? 0).toLocaleString("en-US")}
                            </span>
                        </div>
                    </div>
                ))}
            </section>

            <div className="separator" />

            <section className="totals">
                <TotalRow label="အခြား" value={order.other_charges} />
                <TotalRow label="စုစုပေါင်း" value={order.total} />
                <TotalRow label="ပေးငွေ" value={order.paid_amount} />
                <TotalRow label="ကျန်ငွေ" value={order.change_amount} />
            </section>

            <footer>
                <div className="font-bold">*ဝယ်ပြီးပစ္စည်းပြန်မလဲပါ*</div>
                <div className="font-bold pt-[5px]">*ဝယ်ယူအားပေးမှုကိုကျေးဇူးတင်ပါသည်*</div>
                <div className="text-[12px] pt-[10px]">Print Date: {new Intl.DateTimeFormat('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true
                }).format(new Date()).replace(',', '')}</div>
            </footer>
        </div>
    </div>
));

PrintableReceipt.displayName = 'PrintableReceipt';

export default PrintableReceipt

// export const PrintableReceipt = ({ order }: ReceiptProps) => {
//     return (
//         <div id="printable-receipt" className="thermal-receipt">
//             <div className="voucher-code">
//                 {order.voucher_code ?? "VC0001"}
//             </div>

//             <section className="store-header">
//                 <h1>သလ္လာထွန်း</h1>
//                 <div className="store-type">ပဲမျိုးစုံရောင်းဝယ်ရေး</div>
//                 <div>၈၇လမ်း၊ ၂၇x၂၈ကြား၊ မန္တလေးမြို့။</div>
//                 <div>09 2032794 | 09 793043753 | 09 779699003</div>
//                 <div className="date">Date : {order.date}</div>
//             </section>

//             <section className="customer">
//                 <div>အမည် - {order.customer_name ?? ""}</div>
//                 <div>လိပ်စာ - {order.customer_address ?? ""}</div>
//             </section>

//             <h2 className="invoice-title">INVOICE</h2>

//             <div className="separator" />

//             <section className="items">
//                 {(order.order_items ?? []).map((item: any, index: number) => (
//                     <div className="item" key={item.item_id ?? index}>
//                         <div className="product-name">
//                             {item.product_name}
//                         </div>

//                         <div className="item-detail">
//                             <span>{item.unit_quantity}</span>
//                             <span>
//                                 {Number(item.selling_price ?? 0).toLocaleString("en-US")}
//                             </span>
//                         </div>
//                     </div>
//                 ))}
//             </section>

//             <div className="separator" />

//             <section className="totals">
//                 <TotalRow label="အခြား" value={order.other_charges} />
//                 <TotalRow label="စုစုပေါင်း" value={order.total} />
//                 <TotalRow label="ပေးငွေ" value={order.paid_amount} />
//                 <TotalRow label="ကျန်ငွေ" value={order.change_amount} />
//             </section>

//             <footer>
//                 <div>*ဝယ်ယူအားပေးမှုကို</div>
//                 <div>ကျေးဇူးအထူးတင်ရှိပါသည်*</div>
//             </footer>
//         </div>
//     );
// };

const TotalRow = ({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) => (
    <div className="total-row">
        <span>{label}</span>
        <span>{Number(value ?? 0).toLocaleString("en-US")}</span>
    </div>
);