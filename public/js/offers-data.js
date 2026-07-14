/*
 * Frontend-only offer catalogue. Keep all offer text and dates here.
 * Real discount validation must be implemented on the server before these
 * codes can change an order total.
 */
window.FlavorHubOffers = [
  {id:'welcome',title:'Welcome to FlavorHub',description:'Get 10% OFF on your first order',code:'WELCOME10',type:'New User',minimum_order:0,maximum_discount:100,category:'All',start_date:'2026-01-01',end_date:'2026-12-31T23:59:59',active:true,icon:'balloon-heart',theme:'yellow',button:'Copy Code'},
  {id:'save50',title:'Flat ₹50 OFF',description:'Save ₹50 on orders above ₹399',code:'SAVE50',type:'Food Deals',minimum_order:399,maximum_discount:50,category:'All',start_date:'2026-01-01',end_date:'2026-12-31T23:59:59',active:true,icon:'cash-coin',theme:'orange',button:'Copy Code'},
  {id:'delivery',title:'Free Delivery',description:'Check free delivery availability for your location',code:'FREEDEL',type:'Free Delivery',minimum_order:499,maximum_discount:null,category:'All',start_date:'2026-01-01',end_date:'2026-12-31T23:59:59',active:true,icon:'bicycle',theme:'green',button:'Order Now',button_link:'/menu'},
  {id:'weekend',title:'Weekend Special',description:'Get 15% OFF on Saturday and Sunday',code:'WEEKEND15',type:'Weekend Offers',minimum_order:0,maximum_discount:150,category:'All',start_date:'2026-01-01',end_date:'2026-12-31T23:59:59',active:true,icon:'calendar-heart',theme:'blue',button:'Copy Code'},
  {id:'sweet',title:'Sweet Deal',description:'Get one dessert at 50% OFF',code:'SWEET50',type:'Dessert Deals',minimum_order:0,maximum_discount:null,category:'Desserts',start_date:'2026-01-01',end_date:'2026-12-31T23:59:59',active:true,icon:'cake2',theme:'pink',button:'View Desserts',button_link:'/menu?category=Desserts'},
  {id:'combo',title:'Combo Meal Deal',description:'Discover meals made for sharing',code:'COMBO249',type:'Food Deals',minimum_order:0,maximum_discount:null,category:'Burger',start_date:'2026-01-01',end_date:'2026-12-31T23:59:59',active:true,icon:'box-seam',theme:'orange',button:'View Menu',button_link:'/menu?category=Burger'},
  {id:'drinks',title:'Cool Drinks Offer',description:'Explore refreshing beverage choices',code:'DRINK3',type:'Beverage Deals',minimum_order:0,maximum_discount:null,category:'Drinks',start_date:'2026-01-01',end_date:'2026-12-31T23:59:59',active:true,icon:'cup-straw',theme:'blue',button:'View Beverages',button_link:'/menu?category=Drinks'},
  {id:'family',title:'Family Feast',description:'Save ₹200 on orders above ₹999',code:'FAMILY200',type:'Food Deals',minimum_order:999,maximum_discount:200,category:'All',start_date:'2026-01-01',end_date:'2026-12-31T23:59:59',active:true,icon:'people',theme:'orange',button:'Order Now',button_link:'/menu'},
  {id:'lunch',title:'Lunch Time Deal',description:'Get 12% OFF between 12 PM and 4 PM',code:'LUNCH12',type:'Food Deals',minimum_order:0,maximum_discount:120,category:'All',start_date:'2026-01-01',end_date:'2026-12-31T23:59:59',active:true,icon:'sun',theme:'yellow',button:'Copy Code'},
  {id:'firstdrink',title:'First Order Bonus',description:'Get a free beverage with your first order',code:'FIRSTDRINK',type:'New User',minimum_order:299,maximum_discount:null,category:'Drinks',start_date:'2026-01-01',end_date:'2026-12-31T23:59:59',active:true,icon:'gift',theme:'green',button:'Order Now',button_link:'/menu'}
];
