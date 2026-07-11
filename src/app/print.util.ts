

/* =========================================================
   TYPES
========================================================= */

export interface ThermalOrderItem {
    product_name?: string;
    unit_quantity?: string | number;
    selling_price?: string | number;
}

export interface ThermalOrder {
    voucher_code?: string;
    customer_name?: string;
    customer_address?: string;
    date?: string;

    order_items?: ThermalOrderItem[];

    other_charges?: string | number;
    total?: string | number;
    paid_amount?: string | number;
    change_amount?: string | number;
}

export type PrintTransport = "usb" | "bluetooth";

/* =========================================================
   CONSTANTS
========================================================= */

const ESC = 0x1b;
const GS = 0x1d;

const encoder = new TextEncoder();

/*
 * Most 80mm printers fit roughly:
 * - Font A: 48 characters
 * - Font B: 64 characters
 *
 * Myanmar characters are variable-width, so these values are
 * mainly for English and numeric columns.
 */
const RECEIPT_COLUMNS = 48;

const BLUETOOTH_SERVICE_UUIDS: string[] = [
    "000018f0-0000-1000-8000-00805f9b34fb",
    "0000ffe0-0000-1000-8000-00805f9b34fb",
    "0000ffe5-0000-1000-8000-00805f9b34fb",
    "0000ae30-0000-1000-8000-00805f9b34fb",
];

const sleep = (milliseconds: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, milliseconds));

const toBytes = (...values: number[]): Uint8Array =>
    new Uint8Array(values);

const concatUint8Arrays = (parts: Uint8Array[]): Uint8Array => {
    const totalLength = parts.reduce(
        (length, part) => length + part.byteLength,
        0
    );

    const result = new Uint8Array(totalLength);

    let offset = 0;

    for (const part of parts) {
        result.set(part, offset);
        offset += part.byteLength;
    }

    return result;
};

/*
 * GS ! n
 *
 * 0x00 = normal
 * 0x01 = double height
 * 0x10 = double width
 * 0x11 = double width and height
 */
const normalTextSize = (): Uint8Array =>
    toBytes(GS, 0x21, 0x00);

const doubleHeightText = (): Uint8Array =>
    toBytes(GS, 0x21, 0x01);

const doubleWidthText = (): Uint8Array =>
    toBytes(GS, 0x21, 0x10);

const doubleWidthHeightText = (): Uint8Array =>
    toBytes(GS, 0x21, 0x11);

const partialCut = (): Uint8Array =>
    toBytes(GS, 0x56, 0x01);

const fullCut = (): Uint8Array =>
    toBytes(GS, 0x56, 0x00);

const setDefaultLineSpacing = (): Uint8Array =>
    toBytes(ESC, 0x32);

const setLineSpacing = (dots: number): Uint8Array =>
    toBytes(ESC, 0x33, Math.max(0, Math.min(255, dots)));

const normalizeText = (value: unknown): string => {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value);
};

const containsMyanmar = (value: string): boolean =>
    /[\u1000-\u109f\uAA60-\uAA7F]/.test(value);

const encodeText = (value: unknown): Uint8Array =>
    encoder.encode(value == null ? "" : String(value));

const line = (value = ""): Uint8Array =>
    encodeText(`${value}\n`);

const separator = (
    character = "-",
    length = RECEIPT_COLUMNS
): Uint8Array => line(character.repeat(length));

const padLeft = (value: string, width: number): string => {
    const normalized = normalizeText(value);

    if (normalized.length >= width) {
        return normalized.slice(0, width);
    }

    return normalized.padStart(width, " ");
};

const padRight = (value: string, width: number): string => {
    const normalized = normalizeText(value);

    if (normalized.length >= width) {
        return normalized.slice(0, width);
    }

    return normalized.padEnd(width, " ");
};

/*
 * Use this only for English/numeric columns.
 * Myanmar text has variable visual width and should normally
 * be printed on its own line.
 */
const buildNumericItemLine = (
    quantity: string,
    price: string
): string => {
    return `${padLeft(quantity, 18)}${padLeft(price, 30)}`;
};

const buildTotalLine = (
    label: string,
    amount: string
): string => {
    const labelWidth = 28;
    const valueWidth = RECEIPT_COLUMNS - labelWidth;

    return `${padRight(label, labelWidth)}${padLeft(amount, valueWidth)}`;
};

const command = (...values: number[]): Uint8Array =>
    new Uint8Array(values);

const initialize = (): Uint8Array =>
    command(ESC, 0x40);

const alignLeft = (): Uint8Array =>
    command(ESC, 0x61, 0x00);

const alignCenter = (): Uint8Array =>
    command(ESC, 0x61, 0x01);

const alignRight = (): Uint8Array =>
    command(ESC, 0x61, 0x02);

const normalSize = (): Uint8Array =>
    command(GS, 0x21, 0x00);

const boldOff = (): Uint8Array =>
    command(ESC, 0x45, 0x00);

const feedLines = (count: number): Uint8Array =>
    command(ESC, 0x64, count);

const cut = (): Uint8Array =>
    command(GS, 0x56, 0x41, 0x00);

const formatMoney = (value: unknown): string => {
    const numberValue = Number(value ?? 0);

    return Number.isFinite(numberValue)
        ? numberValue.toLocaleString("en-US")
        : "0";
};

const concatBytes = (parts: Uint8Array[]): Uint8Array => {
    const totalLength = parts.reduce(
        (total, part) => total + part.byteLength,
        0
    );

    const result = new Uint8Array(totalLength);

    let offset = 0;

    for (const part of parts) {
        result.set(part, offset);
        offset += part.byteLength;
    }

    return result;
};

export const generateNativeUtf8Receipt = (
    order: ThermalOrder
): Uint8Array => {
    const output: Uint8Array[] = [];

    /*
     * Keep the printer in the same default mode used by printTest.
     */
    output.push(initialize());
    output.push(normalSize());
    output.push(boldOff());

    // Voucher
    output.push(alignRight());
    output.push(line(order.voucher_code ?? "VC0001"));

    // Header: plain Unicode, no Rabbit, no bold, no double size
    output.push(alignCenter());
    output.push(line("သလ္လာထွန်း"));
    output.push(line("ပဲမျိုးစုံရောင်းဝယ်ရေး"));
    output.push(line("၈၇လမ်း၊ ၂၇x၂၈ကြား၊ မန္တလေးမြို့။"));
    output.push(line("09 2032794 | 09 793043753 | 09 779699003"));
    output.push(line(`Date : ${order.date ?? ""}`));

    output.push(feedLines(1));

    // Customer
    output.push(alignLeft());
    output.push(line(`အမည် - ${order.customer_name ?? ""}`));
    output.push(line(`လိပ်စာ - ${order.customer_address ?? ""}`));

    output.push(feedLines(1));

    // English title
    output.push(alignCenter());
    output.push(line("INVOICE"));
    output.push(line("-----------------------------------------------"));

    // Items
    output.push(alignLeft());

    for (const item of order.order_items ?? []) {
        /*
         * Myanmar product name must not be sliced or padded.
         */
        output.push(line(item.product_name ?? ""));

        /*
         * Quantity and price contain mostly ASCII, so spacing is safe.
         */
        const quantity = String(item.unit_quantity ?? "");
        const price = formatMoney(item.selling_price);

        output.push(
            line(
                `${quantity.padStart(18, " ")}${price.padStart(28, " ")}`
            )
        );

        output.push(feedLines(1));
    }

    output.push(
        line("-----------------------------------------------")
    );

    /*
     * Do not pad Myanmar labels with JS string-width calculations.
     * Use label on the left and value on the next line/right side.
     */
    output.push(alignLeft());
    output.push(line("အခြား"));
    output.push(alignRight());
    output.push(line(formatMoney(order.other_charges)));

    output.push(alignLeft());
    output.push(line("စုစုပေါင်း"));
    output.push(alignRight());
    output.push(line(formatMoney(order.total)));

    output.push(alignLeft());
    output.push(line("ပေးငွေ"));
    output.push(alignRight());
    output.push(line(formatMoney(order.paid_amount)));

    output.push(alignLeft());
    output.push(line("ကျန်ငွေ"));
    output.push(alignRight());
    output.push(line(formatMoney(order.change_amount)));

    // Footer
    output.push(feedLines(2));
    output.push(alignCenter());
    output.push(line("*ဝယ်ယူအားပေးမှုကို"));
    output.push(line("ကျေးဇူးအထူးတင်ရှိပါသည်*"));

    output.push(feedLines(5));
    output.push(cut());

    return concatBytes(output);
};

interface UsbPrintEndpoint {
    interfaceNumber: number;
    alternateSetting: number;
    endpointNumber: number;
    endpointType: any;
}

const findUsbPrintEndpoint = (
    device: any
): UsbPrintEndpoint | null => {
    const configuration = device.configuration;

    if (!configuration) {
        return null;
    }

    /*
     * Prefer bulk OUT endpoints.
     */
    for (const usbInterface of configuration.interfaces) {
        for (const alternate of usbInterface.alternates) {
            for (const endpoint of alternate.endpoints) {
                if (
                    endpoint.direction === "out" &&
                    endpoint.type === "bulk"
                ) {
                    return {
                        interfaceNumber: usbInterface.interfaceNumber,
                        alternateSetting: alternate.alternateSetting,
                        endpointNumber: endpoint.endpointNumber,
                        endpointType: endpoint.type,
                    };
                }
            }
        }
    }

    /*
     * Some printers expose an interrupt OUT endpoint instead.
     */
    for (const usbInterface of configuration.interfaces) {
        for (const alternate of usbInterface.alternates) {
            for (const endpoint of alternate.endpoints) {
                if (endpoint.direction === "out") {
                    return {
                        interfaceNumber: usbInterface.interfaceNumber,
                        alternateSetting: alternate.alternateSetting,
                        endpointNumber: endpoint.endpointNumber,
                        endpointType: endpoint.type,
                    };
                }
            }
        }
    }

    return null;
};

const ensureUsbConfiguration = async (
    device: any
): Promise<void> => {
    if (device.configuration) {
        return;
    }

    const firstConfiguration = device.configurations[0];

    if (!firstConfiguration) {
        throw new Error("The USB printer has no available configuration.");
    }

    await device.selectConfiguration(
        firstConfiguration.configurationValue
    );
};

const transferUsbData = async (
    device: any,
    endpointNumber: number,
    data: Uint8Array
): Promise<void> => {
    /*
     * 16 KB is usually fast and reliable for USB thermal printers.
     * Lower this to 4096 if the printer rejects large transfers.
     */
    const chunkSize = 16 * 1024;

    for (let offset = 0; offset < data.byteLength; offset += chunkSize) {
        const chunk = data.slice(
            offset,
            Math.min(offset + chunkSize, data.byteLength)
        );

        const result = await device.transferOut(
            endpointNumber,
            chunk
        );

        if (result.status !== "ok") {
            throw new Error(
                `USB transfer failed with status: ${result.status}`
            );
        }
    }
};

export const requestUsbPrinter = async (): Promise<any> => {
    /*
     * Empty filters allow selecting the printer manually.
     *
     * Once you know the printer's vendorId/productId, use:
     *
     * filters: [{
     *   vendorId: 0x1234,
     *   productId: 0x5678
     * }]
     */
    return navigator.usb.requestDevice({
        filters: [],
    });
};

export const printViaUsb = async (
    data: Uint8Array,
    existingDevice?: any
): Promise<any> => {
    if (!("usb" in navigator)) {
        throw new Error(
            "WebUSB is unavailable. Use Chrome or Edge over HTTPS or localhost."
        );
    }

    const device =
        existingDevice ??
        (await requestUsbPrinter());

    try {
        if (!device.opened) {
            await device.open();
        }

        await ensureUsbConfiguration(device);

        const endpoint = findUsbPrintEndpoint(device);

        if (!endpoint) {
            throw new Error(
                "No USB OUT endpoint was found on this printer."
            );
        }

        /*
         * Some operating systems attach a kernel/driver to the
         * printer interface. WebUSB may fail here with:
         *
         * - Access denied
         * - Unable to claim interface
         * - NetworkError
         */
        await device.claimInterface(endpoint.interfaceNumber);

        if (endpoint.alternateSetting !== 0) {
            await device.selectAlternateInterface(
                endpoint.interfaceNumber,
                endpoint.alternateSetting
            );
        }

        await transferUsbData(
            device,
            endpoint.endpointNumber,
            data
        );

        return device;
    } catch (error) {
        throw new Error(
            `USB printing failed: ${error instanceof Error
                ? error.message
                : String(error)
            }`
        );
    } finally {
        /*
         * Leave the device open for faster repeated printing.
         * Call disconnectUsbPrinter() when the page closes.
         */
    }
};

export const disconnectUsbPrinter = async (
    device: any | null
): Promise<void> => {
    if (!device?.opened) {
        return;
    }

    try {
        await device.close();
    } catch (error) {
        console.warn("Unable to close USB printer:", error);
    }
};

export const getAuthorizedUsbPrinters =
    async (): Promise<any[]> => {
        if (!("usb" in navigator)) {
            return [];
        }

        return navigator.usb.getDevices();
    };

interface BluetoothPrinterConnection {
    device: any;
    characteristic: any;
}

let cachedBluetoothConnection:
    | BluetoothPrinterConnection
    | null = null;

const findBluetoothWriteCharacteristic = async (
    server: any
): Promise<any> => {
    const services = await server.getPrimaryServices();

    for (const service of services) {
        const characteristics =
            await service.getCharacteristics();

        /*
         * Prefer write without response for speed.
         */
        const fastWrite = characteristics.find(
            (characteristic: any) =>
                characteristic.properties.writeWithoutResponse
        );

        if (fastWrite) {
            return fastWrite;
        }

        const confirmedWrite = characteristics.find(
            (characteristic: any) =>
                characteristic.properties.write
        );

        if (confirmedWrite) {
            return confirmedWrite;
        }
    }

    throw new Error(
        "No writable Bluetooth characteristic was found."
    );
};

export const connectBluetoothPrinter =
    async (): Promise<BluetoothPrinterConnection> => {
        if (!("bluetooth" in navigator)) {
            throw new Error(
                "Web Bluetooth is unavailable in this browser."
            );
        }

        if (
            cachedBluetoothConnection?.device.gatt?.connected
        ) {
            return cachedBluetoothConnection;
        }

        const device =
            await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: BLUETOOTH_SERVICE_UUIDS,
            });

        const server = await device.gatt?.connect();

        if (!server) {
            throw new Error(
                "Unable to connect to the Bluetooth printer."
            );
        }

        const characteristic =
            await findBluetoothWriteCharacteristic(server);

        cachedBluetoothConnection = {
            device,
            characteristic,
        };

        device.addEventListener(
            "gattserverdisconnected",
            () => {
                cachedBluetoothConnection = null;
            }
        );

        return cachedBluetoothConnection;
    };

const writeBluetoothChunk = async (
    characteristic: any,
    chunk: Uint8Array
): Promise<void> => {
    if (
        characteristic.properties.writeWithoutResponse
    ) {
        await characteristic.writeValueWithoutResponse(
            chunk
        );

        return;
    }

    if (characteristic.properties.write) {
        await characteristic.writeValueWithResponse(
            chunk
        );

        return;
    }

    throw new Error(
        "Bluetooth characteristic is not writable."
    );
};

export const printViaBluetooth = async (
    data: Uint8Array
): Promise<void> => {
    const { characteristic } =
        await connectBluetoothPrinter();

    /*
     * Start conservatively at 180 bytes.
     *
     * Because native UTF-8 receipts are much smaller than images,
     * this will still print quickly.
     *
     * Lower to 100 or 20 only if the printer drops data.
     */
    const chunkSize = 180;

    /*
     * Minimal pacing prevents small BLE printer buffers from
     * overflowing while remaining much faster than 20-byte
     * chunks with a 25ms delay.
     */
    const pauseEveryChunks = 8;
    const pauseMilliseconds = 3;

    let sentChunks = 0;

    for (
        let offset = 0;
        offset < data.byteLength;
        offset += chunkSize
    ) {
        const chunk = data.slice(
            offset,
            Math.min(offset + chunkSize, data.byteLength)
        );

        await writeBluetoothChunk(
            characteristic,
            chunk
        );

        sentChunks++;

        if (sentChunks % pauseEveryChunks === 0) {
            await sleep(pauseMilliseconds);
        }
    }
};

export const disconnectBluetoothPrinter = (): void => {
    if (
        cachedBluetoothConnection?.device.gatt?.connected
    ) {
        cachedBluetoothConnection.device.gatt.disconnect();
    }

    cachedBluetoothConnection = null;
};

let cachedUsbDevice: any | null = null;

export const printReceipt = async (
    order: ThermalOrder,
    preferredTransport: PrintTransport = "usb"
): Promise<PrintTransport> => {
    const receiptData =
        generateNativeUtf8Receipt(order);
    if (preferredTransport === "usb") {
        try {
            const authorizedDevices =
                await getAuthorizedUsbPrinters();

            if (!cachedUsbDevice) {
                cachedUsbDevice =
                    authorizedDevices[0] ?? null;
            }

            cachedUsbDevice = await printViaUsb(
                receiptData,
                cachedUsbDevice ?? undefined
            );

            return "usb";
        } catch (usbError) {
            console.error("USB printing failed:", usbError);

            await printViaBluetooth(receiptData);

            return "bluetooth";
        }
    }

    try {
        await printViaBluetooth(receiptData);

        return "bluetooth";
    } catch (bluetoothError) {
        console.error(
            "Bluetooth printing failed:",
            bluetoothError
        );

        cachedUsbDevice = await printViaUsb(
            receiptData,
            cachedUsbDevice ?? undefined
        );

        return "usb";
    }
};

export const inspectUsbPrinter = async (): Promise<void> => {
    const device = await requestUsbPrinter();

    await device.open();

    await ensureUsbConfiguration(device);

    console.log({
        manufacturerName: device.manufacturerName,
        productName: device.productName,
        serialNumber: device.serialNumber,
        vendorId: `0x${device.vendorId
            .toString(16)
            .padStart(4, "0")}`,
        productId: `0x${device.productId
            .toString(16)
            .padStart(4, "0")}`,
        configurations: device.configurations,
        activeConfiguration: device.configuration,
    });

    for (
        const usbInterface of
        device.configuration?.interfaces ?? []
    ) {
        for (const alternate of usbInterface.alternates) {
            console.log({
                interfaceNumber:
                    usbInterface.interfaceNumber,

                alternateSetting:
                    alternate.alternateSetting,

                interfaceClass:
                    alternate.interfaceClass,

                interfaceSubclass:
                    alternate.interfaceSubclass,

                interfaceProtocol:
                    alternate.interfaceProtocol,

                endpoints:
                    alternate.endpoints.map((endpoint: any) => ({
                        endpointNumber:
                            endpoint.endpointNumber,

                        direction:
                            endpoint.direction,

                        type:
                            endpoint.type,

                        packetSize:
                            endpoint.packetSize,
                    })),
            });
        }
    }

    await device.close();
};