// 1. Liquid Background Animation
const canvas = document.getElementById('liquid-bg');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
let pts = [];
for(let i=0; i<5; i++) pts.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height, vx:(Math.random()-0.5)*2, vy:(Math.random()-0.5)*2});

function animateBG() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0 || p.x>canvas.width) p.vx*=-1; if(p.y<0 || p.y>canvas.height) p.vy*=-1;
        let g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 400);
        g.addColorStop(0, 'rgba(197, 160, 89, 0.2)'); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.fillRect(0,0,canvas.width, canvas.height);
    });
    requestAnimationFrame(animateBG);
}
animateBG();

// 2. Preloader Timer
window.addEventListener('load', () => {
    setTimeout(() => { document.querySelector('.loader-bar').style.width = '100%'; }, 100);
    setTimeout(() => {
        const pre = document.getElementById('preloader');
        pre.style.opacity = '0';
        setTimeout(() => { pre.style.visibility = 'hidden'; }, 800);
    }, 2000);
});

// 3. App Logic
const perfumes = [
    { id: 1, name: "TERRE D' AMBER", price: 8400, type: "Him", pop: 98, img: "images/terre_amber.png.jpg", discount: 0.15, stock: 10 },
    { id: 2, name: "PROLUX MATTE", price: 4200, type: "Her", pop: 85, img: "images/prolux_matte.png.jpg", discount: 0, stock: 5 },
    { id: 3, name: "MIDNIGHT KAJAL", price: 3100, type: "Him", pop: 70, img: "images/midnight_kajal.png.jpg", discount: 0, stock: 12 },
    { id: 4, name: "SILK OUD", price: 6200, type: "Unisex", pop: 92, img: "images/silk_oud.png.jpg", discount: 0.10, stock: 0 },
    { id: 5, name: "SOLAR CITRUS", price: 2950, type: "Her", pop: 65, img: "images/solar_citrus.png.jpg", discount: 0, stock: 8 },
    { id: 6, name: "VILLAIN NOIR", price: 12500, type: "Him", pop: 98, img: "images/villain_noir.png.jpeg", discount: 0, stock: 3 },
    { id: 7, name: "IMPERIAL GOLD", price: 45000, type: "Unisex", pop: 99, img: "images/imperial_gold.png.jpg", discount: 0.20, stock: 0 }
    ];
let cart = [];
let wishlist = new Set();

function showSection(id) {
    document.querySelectorAll('.page-view').forEach(v => v.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    if(id === 'wishlist-view') renderWishlist();
    window.scrollTo(0,0);
}

function handleTrack() {
    if(document.getElementById('trackInput').value) document.getElementById('track-status').style.display='block';
}

function addToBag(id) {
    const p = perfumes.find(i => i.id === id);
    if(p.stock <= 0) return; // Prevent adding sold out items
    cart.push({...p, cartId: Date.now(), finalPrice: p.price * (1 - (p.discount || 0))});
    updateUI();
    document.getElementById('cart-panel').classList.add('active');
}

function removeFromBag(cartId) {
    cart = cart.filter(i => i.cartId !== cartId);
    updateUI();
}

function updateUI() {
    document.getElementById('cart-count').innerText = cart.length;
    document.getElementById('wish-count').innerText = wishlist.size;
    const total = cart.reduce((s,i) => s + i.finalPrice, 0);
    document.getElementById('total-price').innerText = `₹${total.toLocaleString()}`;
    
    document.getElementById('cart-items').innerHTML = cart.map(item => `
        <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #222; padding-bottom:10px;">
            <span>${item.name}</span>
            <i class="fas fa-trash" onclick="removeFromBag(${item.cartId})" style="cursor:pointer; color:#444"></i>
        </div>
    `).join('') || "<p style='text-align:center; color:#444'>Empty</p>";
}

function toggleWish(id) {
    wishlist.has(id) ? wishlist.delete(id) : wishlist.add(id);
    updateUI();
    filterAndSort();
}

function filterAndSort() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const gender = document.getElementById('genderFilter').value;
    const sort = document.getElementById('sortOption').value;

    let filtered = perfumes.filter(p => p.name.toLowerCase().includes(query));
    if(gender !== 'all') filtered = filtered.filter(p => p.type === gender);

    if(sort === 'low') filtered.sort((a,b) => (a.price*(1-a.discount)) - (b.price*(1-b.discount)));
    else if(sort === 'high') filtered.sort((a,b) => (b.price*(1-b.discount)) - (a.price*(1-a.discount)));
    else filtered.sort((a,b) => b.pop - a.pop);

    renderList(filtered, 'perfume-list');
}

function renderList(data, target) {
    document.getElementById(target).innerHTML = data.map(p => {
        const isSoldOut = p.stock <= 0;
        const currentPrice = p.price * (1 - (p.discount || 0));
        
        return `
        <div class="perfume-card ${isSoldOut ? 'sold-out' : ''}">
            <div class="img-container">
                ${p.discount > 0 ? `<div class="discount-badge">-${p.discount * 100}%</div>` : ''}
                <img src="${p.img}" style="${isSoldOut ? 'filter: grayscale(1); opacity: 0.4;' : ''}">
                ${isSoldOut ? '<div class="sold-out-tag">SOLD OUT</div>' : ''}
            </div>
            <h4 style="font-family:'Cinzel'">${p.name}</h4>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px;">
                <div style="display:flex; flex-direction:column;">
                    <span>₹${currentPrice.toLocaleString()}</span>
                    ${p.discount > 0 ? `<span style="text-decoration:line-through; font-size:0.7rem; color:#666">₹${p.price.toLocaleString()}</span>` : ''}
                </div>
                <div style="display:flex; gap:10px;">
                    <i class="${wishlist.has(p.id)?'fas':'far'} fa-heart" onclick="toggleWish(${p.id})" style="cursor:pointer; color:${wishlist.has(p.id)?'var(--gold)':''}"></i>
                    ${isSoldOut 
                        ? `<button class="cta-btn-alt" style="padding:5px 10px; font-size:0.6rem; opacity:0.5; cursor:not-allowed;" disabled>Out of Stock</button>`
                        : `<button class="cta-btn-alt" style="padding:5px 10px; font-size:0.6rem" onclick="addToBag(${p.id})">Add</button>`
                    }
                </div>
            </div>
        </div>
    `}).join('');
}

function renderWishlist() { renderList(perfumes.filter(p => wishlist.has(p.id)), 'wishlist-grid'); }
function toggleCart() { document.getElementById('cart-panel').classList.toggle('active'); }
function openCheckout() { if(cart.length>0) { toggleCart(); document.getElementById('checkout-modal').style.display='flex'; } }
function closeCheckout() { document.getElementById('checkout-modal').style.display='none'; }
function finalizeOrder(e) { e.preventDefault(); alert("Order Success!"); cart=[]; updateUI(); closeCheckout(); }

filterAndSort();