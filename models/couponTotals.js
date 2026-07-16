const DELIVERY_FEE = 40;
const GST_RATE = 0.05;
const money = value => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

async function cartSubtotal(conn, userId) {
  const [items] = await conn.execute(
    'SELECT c.food_id,c.quantity,f.price,f.category_id FROM cart c JOIN food_items f ON f.id=c.food_id WHERE c.user_id=? AND f.availability=1',
    [userId]
  );
  return { items, subtotal: money(items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)) };
}

async function calculate(conn, userId, code) {
  const { items, subtotal } = await cartSubtotal(conn, userId);
  let offer = null;
  let discount = 0;
  let delivery = subtotal ? DELIVERY_FEE : 0;
  const normalized = String(code || '').trim().toUpperCase();
  if (normalized) {
    const [rows] = await conn.execute('SELECT * FROM offers WHERE coupon_code=?', [normalized]);
    if (!rows.length) throw Object.assign(new Error('Invalid coupon code.'), { status: 400 });
    offer = rows[0];
    const now = new Date();
    if (!offer.active) throw Object.assign(new Error('This coupon is not active.'), { status: 400 });
    if ((offer.starts_at && now < new Date(offer.starts_at)) || (offer.ends_at && now > new Date(offer.ends_at))) {
      throw Object.assign(new Error('This coupon has expired.'), { status: 400 });
    }
    if (subtotal < Number(offer.minimum_order)) {
      throw Object.assign(new Error(`Add ₹${money(Number(offer.minimum_order) - subtotal).toFixed(0)} more to use ${normalized}.`), { status: 400 });
    }
    if (offer.discount_type === 'percentage') discount = subtotal * Number(offer.discount_value) / 100;
    else if (offer.discount_type === 'flat') discount = Number(offer.discount_value);
    else if (offer.discount_type === 'free_delivery') delivery = 0;
    if (offer.maximum_discount != null) discount = Math.min(discount, Number(offer.maximum_discount));
    discount = Math.min(discount, subtotal);
  }
  const gst = money(subtotal * GST_RATE);
  const grandTotal = Math.max(0, money(subtotal + delivery + gst - discount));
  return { items, subtotal, deliveryFee: money(delivery), gst, discount: money(discount), grandTotal, offer, couponCode: offer?.coupon_code || null };
}

module.exports = { calculate, money, DELIVERY_FEE, GST_RATE };
