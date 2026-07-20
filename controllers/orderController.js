const db = require('../models/db');
const PDFDocument = require('pdfkit');
const couponTotals = require('../models/couponTotals');

const methods = ['Cash on Delivery', 'UPI Demo', 'Card Demo'];
const relationships = ['Friend', 'Family', 'Colleague', 'Other'];
const money = value => '₹' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(Number(value || 0));
const clean = value => String(value || '').trim().replace(/\s+/g, ' ');
const validPhone = value => /^\+?\d{10,15}$/.test(String(value || '').replace(/[\s-]/g, ''));

function recipientData(body) {
  const orderFor = body.order_for === 'someone_else' ? 'someone_else' : 'self';
  if (orderFor === 'self') return { orderFor, recipientName: null, recipientPhone: null, recipientAddress: null, landmark: null, instructions: null, relationship: null, surprise: false, giftMessage: null };
  const recipientName = clean(body.recipient_name);
  const recipientPhone = String(body.recipient_phone || '').replace(/[\s-]/g, '');
  const recipientAddress = clean(body.recipient_address || body.delivery_address);
  const landmark = clean(body.recipient_landmark);
  const instructions = clean(body.recipient_instructions);
  const relationship = clean(body.recipient_relationship);
  const giftMessage = String(body.gift_message || '').trim();
  if (recipientName.length < 2 || recipientName.length > 100) throw new Error('Enter a recipient name between 2 and 100 characters.');
  if (!validPhone(recipientPhone)) throw new Error('Enter a valid recipient phone number with 10 to 15 digits.');
  if (recipientAddress.length < 10 || recipientAddress.length > 500) throw new Error('Enter a delivery address between 10 and 500 characters.');
  if (landmark.length > 150 || instructions.length > 300 || giftMessage.length > 200) throw new Error('One of the optional fields is too long.');
  if (relationship && !relationships.includes(relationship)) throw new Error('Choose a valid relationship.');
  return { orderFor, recipientName, recipientPhone, recipientAddress, landmark: landmark || null, instructions: instructions || null, relationship: relationship || null, surprise: Boolean(body.is_surprise), giftMessage: giftMessage || null };
}

// Totals always come from current database prices, never from the browser.
exports.place = async (req, res, next) => {
  let conn;
  let stage = 'starting';
  try {
    const paymentMethod = methods.includes(req.body.payment_method) ? req.body.payment_method : 'Cash on Delivery';
    const recipient = recipientData(req.body);
    if (recipient.orderFor === 'someone_else' && paymentMethod === 'Cash on Delivery' && req.body.cod_recipient_confirmed !== true && req.body.cod_recipient_confirmed !== 'true') throw new Error('Confirm that the recipient may need to pay the Cash on Delivery amount.');
    conn = await db.getConnection();
    await conn.beginTransaction();
    const [addressRows] = await conn.execute('SELECT address FROM users WHERE id=?', [req.user.id]);
    const address = recipient.orderFor === 'self' ? clean(req.body.delivery_address || addressRows[0]?.address) : recipient.recipientAddress;
    if (!address) throw new Error('A delivery address is required.');
    stage = 'loading coupon';
    const [savedCoupon] = await conn.execute('SELECT coupon_code FROM cart_coupons WHERE user_id=?', [req.user.id]);
    const totals = await couponTotals.calculate(conn, req.user.id, req.body.coupon_code || savedCoupon[0]?.coupon_code);
    const items = totals.items;
    if (!items.length) throw new Error('Your cart is empty.');
    const total = totals.grandTotal;
    // Railway may temporarily have an older schema while migrations are being
    // applied. Save all columns that exist instead of failing the whole order.
    const [columnRows] = await conn.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders'"
    );
    const existing = new Set(columnRows.map(row => row.COLUMN_NAME));
    const orderData = {
      user_id: req.user.id,
      total_amount: total,
      delivery_address: address,
      payment_method: paymentMethod,
      payment_status: 'Pending',
      order_for: recipient.orderFor,
      recipient_name: recipient.recipientName,
      recipient_phone: recipient.recipientPhone,
      recipient_address: recipient.recipientAddress,
      recipient_landmark: recipient.landmark,
      recipient_instructions: recipient.instructions,
      recipient_relationship: recipient.relationship,
      is_surprise: recipient.surprise,
      gift_message: recipient.giftMessage,
      subtotal: totals.subtotal,
      delivery_fee: totals.deliveryFee,
      gst_amount: totals.gst,
      coupon_code: totals.couponCode,
      discount_amount: totals.discount,
      grand_total: totals.grandTotal
    };
    const columns = Object.keys(orderData).filter(column => existing.has(column));
    const values = columns.map(column => orderData[column]);
    const placeholders = columns.map(() => '?').join(',');
    stage = 'creating order';
    const [order] = await conn.execute(
      `INSERT INTO orders (${columns.join(',')}) VALUES (${placeholders})`,
      values
    );
    stage = 'saving order items';
    for (const item of items) await conn.execute('INSERT INTO order_items(order_id,food_id,quantity,price) VALUES(?,?,?,?)', [order.insertId, item.food_id, item.quantity, item.price]);
    stage = 'clearing cart';
    await conn.execute('DELETE FROM cart WHERE user_id=?', [req.user.id]);
    await conn.execute('DELETE FROM cart_coupons WHERE user_id=?', [req.user.id]);
    await conn.commit();
    res.status(201).json({ message: recipient.orderFor === 'someone_else' ? `Order placed for ${recipient.recipientName}.` : 'Order placed successfully.', order_id: order.insertId, total_amount: total, payment_method: paymentMethod, payment_status: 'Pending', order_for: recipient.orderFor, recipient_name: recipient.recipientName });
  } catch (error) {
    if (conn) await conn.rollback();
    const validation = ['Enter a recipient', 'Enter a valid recipient', 'Enter a delivery', 'One of the optional', 'Choose a valid', 'Confirm that', 'A delivery', 'Your cart'];
    if (error.status === 400 || validation.some(text => error.message?.startsWith(text))) return res.status(400).json({ message: error.message });
    console.error('ORDER_PLACE_FAILED', { stage, code: error.code, message: error.message });
    next(error);
  } finally { if (conn) conn.release(); }
};

exports.list = async (req, res, next) => { try { const [rows] = await db.execute('SELECT * FROM orders WHERE user_id=? ORDER BY order_date DESC', [req.user.id]); res.json(rows); } catch (error) { next(error); } };
exports.getOne = async (req, res, next) => { try { const [orders] = await db.execute('SELECT * FROM orders WHERE id=? AND user_id=?', [req.params.id, req.user.id]); if (!orders.length) return res.status(404).json({ message: 'Order not found.' }); const [items] = await db.execute('SELECT oi.*,f.name,f.image FROM order_items oi JOIN food_items f ON f.id=oi.food_id WHERE oi.order_id=?', [req.params.id]); res.json({ ...orders[0], items }); } catch (error) { next(error); } };
exports.updateStatus = async (req, res, next) => { try { const allowed = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']; if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status.' }); await db.execute('UPDATE orders SET status=? WHERE id=?', [req.body.status, req.params.id]); res.json({ message: 'Order status updated.' }); } catch (error) { next(error); } };

exports.invoice = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT o.*,u.name,u.email FROM orders o JOIN users u ON u.id=o.user_id WHERE o.id=?', [req.params.id]);
    const order = rows[0]; if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (req.user.role !== 'admin' && Number(order.user_id) !== Number(req.user.id)) return res.status(403).json({ message: 'You cannot download this invoice.' });
    const [items] = await db.execute('SELECT oi.quantity,oi.price,f.name FROM order_items oi JOIN food_items f ON f.id=oi.food_id WHERE oi.order_id=?', [order.id]);
    const doc = new PDFDocument({ size: 'A4', margin: 48 }); res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', `attachment; filename="FlavorHub-Invoice-${order.id}.pdf"`); doc.pipe(res);
    doc.fillColor('#0d1b2a').fontSize(24).text('FlavorHub'); doc.fillColor('#333').fontSize(15).text('Food Order Invoice'); doc.moveDown().fontSize(10).text(`Invoice: FH-INV-${new Date(order.order_date).getFullYear()}-${String(order.id).padStart(6, '0')}`); doc.text(`Order ID: #${order.id}`); doc.text(`Order date: ${new Date(order.order_date).toLocaleString('en-IN')}`); doc.moveDown().fontSize(12).text('Purchased By'); doc.fontSize(10).text(order.name); doc.text(order.email); doc.moveDown().fontSize(12).text('Deliver To'); doc.fontSize(10).text(order.order_for === 'someone_else' ? order.recipient_name : order.name); doc.text(order.order_for === 'someone_else' ? order.recipient_phone : ''); doc.text(order.delivery_address); if (order.recipient_instructions) doc.text(`Instructions: ${order.recipient_instructions}`); doc.moveDown().fontSize(12).text('Items'); doc.moveDown(.4).fontSize(10); items.forEach(item => { doc.text(`${item.name} x ${item.quantity}`, 50, doc.y, { continued: true }); doc.text(`${money(item.price)} each | ${money(Number(item.price) * item.quantity)}`, { align: 'right' }); }); doc.moveDown().fontSize(12).text(`Grand Total: ${money(order.total_amount)}`, { align: 'right' }); doc.fontSize(10).text(`Payment method: ${order.payment_method || 'Cash on Delivery'}`, { align: 'right' }); doc.text(`Payment status: ${order.payment_status || 'Pending'}`, { align: 'right' }); doc.text(`Order status: ${order.status}`, { align: 'right' }); doc.end();
  } catch (error) { next(error); }
};
