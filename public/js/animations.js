/* One reusable observer powers page reveals in the vanilla-JS page shell. */
(function(){
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealObserver=reduce?null:new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -30px'});
  const scan=root=>{
    const elements=root.querySelectorAll?.('[data-animate],.food-card,.menu-food-card,.landing-food-card,.offer-card,.feature-card,.landing-trust-card,.review-card,.dash-card,.admin-stat-card,.checkout-card,.checkout-summary,.order-history-card,.contact-info-card,.contact-form-card,.landing-step');
    elements?.forEach((element,index)=>{if(!element.dataset.animate)element.dataset.animate='fade-up';if(!element.style.getPropertyValue('--animate-delay'))element.style.setProperty('--animate-delay',Math.min(index%8,7)*65+'ms');element.classList.add('hover-lift');if(element.dataset.revealObserved)return;element.dataset.revealObserved='true';if(reduce)element.classList.add('is-visible');else revealObserver.observe(element)});
    root.querySelectorAll?.('img[loading="lazy"]').forEach(image=>{if(image.dataset.motionReady)return;image.dataset.motionReady='true';image.classList.add('image-fade');if(image.complete)image.classList.add('image-loaded');else image.addEventListener('load',()=>image.classList.add('image-loaded'),{once:true})});
    root.querySelectorAll?.('.btn').forEach(button=>button.classList.add('button-ripple'));
  };
  scan(document);const app=document.querySelector('#app');if(app)new MutationObserver(()=>scan(app)).observe(app,{childList:true,subtree:true});
  document.addEventListener('click',event=>{const button=event.target.closest('button[onclick^="addCart"]');if(!button)return;button.classList.add('pulse-once');setTimeout(()=>button.classList.remove('pulse-once'),800)});
})();
