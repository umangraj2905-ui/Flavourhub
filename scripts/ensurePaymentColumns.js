/*
 * Safe payment-field setup for an existing FlavorHub database.
 * It checks each column before adding it, so it can be run more than once.
 */
const db=require('../models/db');

(async()=>{
  const columns=[
    ['payment_method',"ALTER TABLE orders ADD COLUMN payment_method VARCHAR(30) NOT NULL DEFAULT 'Cash on Delivery' AFTER delivery_address"],
    ['payment_status',"ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'Pending' AFTER payment_method"],
    ['payment_reference',"ALTER TABLE orders ADD COLUMN payment_reference VARCHAR(100) DEFAULT NULL AFTER payment_status"],
    ['paid_at',"ALTER TABLE orders ADD COLUMN paid_at TIMESTAMP NULL DEFAULT NULL AFTER payment_reference"]
  ];
  try{
    for(const [name,sql] of columns){
      const [rows]=await db.execute('SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?',['orders',name]);
      if(!rows.length){await db.execute(sql);console.log('Added orders.'+name)}else console.log('Already exists: orders.'+name);
    }
    console.log('Payment database check complete.');
  }catch(error){console.error('Payment database setup failed:',error.message);process.exitCode=1}
  finally{await db.end()}
})();
