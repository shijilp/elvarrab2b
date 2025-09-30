"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  PDFDownloadLink,
  PDFViewer,
  Image,
} from "@react-pdf/renderer";

import { format } from "date-fns";

/** Optional: embed your brand font (swap to a TTF/OTF you host) */
Font.register({
  family: "Inter",
  fonts: [
    // TIP: host a TTF/OTF file you control with CORS enabled for reliability
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3Fwr0e2L.woff2" },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 28, fontFamily: "Inter", fontSize: 11, color: "#0a0a0a" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { fontSize: 18, fontWeight: 700 },
  brandSub: { fontSize: 10, color: "#666" },
  section: { marginTop: 12 },
  h2: { fontSize: 13, fontWeight: 700, marginBottom: 6 },
  metaGrid: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 4,
  },
  metaRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#eee" },
  metaKey: {
    width: 110,
    padding: 8,
    backgroundColor: "#fafafa",
    fontWeight: 700,
  },
  metaVal: { flex: 1, padding: 8 },
  addrBlock: {
    marginTop: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 4,
    backgroundColor: "#fcfcfc",
  },
  small: { color: "#666" },
  bold: { fontWeight: 700 },

  /** Table */
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 4,
  },
  tHead: {
    flexDirection: "row",
    backgroundColor: "#f7f7f7",
    borderBottomWidth: 1,
    borderColor: "#e5e5e5",
  },
  tRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#f0f0f0" },
  tCell: { padding: 8, borderRightWidth: 1, borderColor: "#efefef" },
  tRight: { textAlign: "right" },
  skuCol: { width: 110 },
  nameCol: { flex: 1 },
  qtyCol: { width: 50 },
  priceCol: { width: 80 },
  amtCol: { width: 95, borderRightWidth: 0 },

  totalsWrap: { marginTop: 12, alignSelf: "flex-end", width: 300 },
  totRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  totStrong: {
    borderTopWidth: 1,
    borderColor: "#000",
    paddingTop: 6,
    marginTop: 4,
    fontWeight: 700,
  },

  /** Footer */
  footer: {
    position: "absolute",
    left: 28,
    right: 28,
    bottom: 20,
    fontSize: 9,
    color: "#666",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

/** Types you can align with your API response */
export type OrderForPdf = {
  id: number | string;
  created_at: string;
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total_amount: number;
  currency?: string; // default INR
  tax_amount?: number; // optional if you add VAT/GST separately
  tax_label?: string; // e.g., "VAT (15%)" or "GST (18%)"
  items: {
    product: { sku: string; name: string };
    quantity: number;
    price: number;
  }[];
  brand?: { name?: string; tagline?: string; logoUrl?: string };
  invoice_no?: string; // allow different invoice numbering
  paid?: boolean;
  status?: string;
};

function formatMoney(n: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export function InvoiceDocument({ order }: { order: OrderForPdf }) {
  const currency = order.currency || "INR";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>{order.brand?.name || "ELVARRA"}</Text>
            <Text style={styles.brandSub}>
              {order.brand?.tagline || "Luxury Fashion Jewelry"}
            </Text>
          </View>
          {/* Optional logo */}
          {order.brand?.logoUrl ? (
            <Image
              src={order.brand.logoUrl}
              style={{ width: 90, height: 35, objectFit: "contain" }}
            />
          ) : null}
        </View>

        {/* META */}
        <View style={styles.section}>
          <Text style={styles.h2}>Tax Invoice</Text>
          <View style={styles.metaGrid}>
            {[
              ["Invoice #", order.invoice_no || `INV-${order.id}`],
              ["Order #", String(order.id)],
              ["Date", format(new Date(order.created_at), "yyyy-MM-dd HH:mm")],
              ["Status", order.status || ""],
            ].map(([k, v], i, arr) => (
              <View
                key={i}
                style={[
                  styles.metaRow,
                  i === arr.length - 1 ? { borderBottomWidth: 0 } : {},
                ]}
              >
                {/* // eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {/* <Text style={styles.metaKey as React.CSSProperties}>{k}</Text> */}
                {/*  // eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {/* <Text style={styles.metaVal as any}>{v}</Text> */}
              </View>
            ))}
          </View>
        </View>

        {/* BILL TO */}
        <View style={styles.section}>
          <Text style={styles.h2}>Bill To</Text>
          <View style={styles.addrBlock}>
            <Text style={styles.bold}>{order.full_name}</Text>
            <Text>
              {order.line1}
              {order.line2 ? ", " + order.line2 : ""}
            </Text>
            <Text>
              {order.city}, {order.state} {order.pincode}
            </Text>
            <Text>{order.country}</Text>
          </View>
        </View>

        {/* ITEMS TABLE */}
        <View style={[styles.section, styles.table]}>
          <View style={styles.tHead}>
            <Text style={[styles.tCell, styles.skuCol]}>SKU</Text>
            <Text style={[styles.tCell, styles.nameCol]}>Product</Text>
            <Text style={[styles.tCell, styles.qtyCol, styles.tRight]}>
              Qty
            </Text>
            <Text style={[styles.tCell, styles.priceCol, styles.tRight]}>
              Price
            </Text>
            <Text style={[styles.tCell, styles.amtCol, styles.tRight]}>
              Amount
            </Text>
          </View>

          {order.items.map((it, i) => {
            const amount = it.quantity * it.price;
            return (
              <View key={i} style={styles.tRow}>
                <Text style={[styles.tCell, styles.skuCol]}>
                  {it.product.sku}
                </Text>
                <Text style={[styles.tCell, styles.nameCol]}>
                  {it.product.name}
                </Text>
                <Text style={[styles.tCell, styles.qtyCol, styles.tRight]}>
                  {it.quantity}
                </Text>
                <Text style={[styles.tCell, styles.priceCol, styles.tRight]}>
                  {formatMoney(it.price, currency)}
                </Text>
                <Text style={[styles.tCell, styles.amtCol, styles.tRight]}>
                  {formatMoney(amount, currency)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* TOTALS */}
        <View style={styles.totalsWrap}>
          <View style={styles.totRow}>
            <Text>Subtotal</Text>
            <Text>{formatMoney(order.subtotal, currency)}</Text>
          </View>
          {typeof order.tax_amount === "number" ? (
            <View style={styles.totRow}>
              <Text>{order.tax_label || "Tax"}</Text>
              <Text>{formatMoney(order.tax_amount, currency)}</Text>
            </View>
          ) : null}
          <View style={styles.totRow}>
            <Text>Shipping</Text>
            <Text>{formatMoney(order.shipping, currency)}</Text>
          </View>
          <View style={styles.totRow}>
            <Text>Discount</Text>
            <Text>-{formatMoney(order.discount, currency)}</Text>
          </View>
          <View style={[styles.totRow, styles.totStrong]}>
            <Text>Total</Text>
            <Text>{formatMoney(order.total_amount, currency)}</Text>
          </View>
          {typeof order.paid === "boolean" ? (
            <View style={[styles.totRow, { marginTop: 2 }]}>
              <Text>Status</Text>
              <Text>{order.paid ? "PAID" : "UNPAID"}</Text>
            </View>
          ) : null}
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text>Thank you for shopping with Elvarra.</Text>
          <Text>
            Page{" "}
            <Text
              render={({ pageNumber, totalPages }) =>
                `${pageNumber}/${totalPages}`
              }
            />
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/** Button to download the PDF */
export function InvoiceDownloadButton({
  order,
  className,
}: {
  order: OrderForPdf;
  className?: string;
}) {
  return (
    <div className="rounded-xl border px-4 py-2 text-sm inline-block">
      <PDFDownloadLink
        document={<InvoiceDocument order={order} />}
        fileName={`invoice-${order.id}.pdf`}
      >
        {({ loading }) => (loading ? "Preparing…" : "Download Invoice (PDF)")}
      </PDFDownloadLink>
    </div>
  );
}

/** Optional inline preview (embed viewer) */
export function InvoicePreview({
  order,
  height = 600,
}: {
  order: OrderForPdf;
  height?: number;
}) {
  return (
    <PDFViewer style={{ width: "100%", height }}>
      <InvoiceDocument order={order} />
    </PDFViewer>
  );
}
