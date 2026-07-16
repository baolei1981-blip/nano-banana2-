const dishes = [
  { id: 1, name: "本地老虎斑特色烤鱼", category: "招牌菜", price: 468000, icon: "🐟", tag: "招牌", spicy: true, description: "巴厘岛本地老虎斑，肉质饱满，现烤现煮。" },
  { id: 2, name: "香辣青蟹锅", category: "海鲜", price: 528000, icon: "🦀", tag: "鲜活", spicy: true, description: "鲜活青蟹，肉肥味甜，香辣汤汁越煮越入味。" },
  { id: 3, name: "椒盐富贵虾", category: "海鲜", price: 398000, icon: "🦐", tag: "巴厘岛特色", spicy: false, description: "小臂粗的大皮皮虾，外酥里嫩，满黄带膏。" },
  { id: 4, name: "清蒸富贵虾", category: "海鲜", price: 398000, icon: "🦐", tag: "原汁原味", spicy: false, description: "清蒸锁住海味，虾肉紧实，入口鲜甜。" },
  { id: 5, name: "水煮牛肉", category: "川味热菜", price: 188000, icon: "🌶️", tag: "川味", spicy: true, description: "牛肉嫩滑，花椒香足，适合配米饭。" },
  { id: 6, name: "辣子鸡", category: "川味热菜", price: 168000, icon: "🍗", tag: "下饭", spicy: true, description: "鸡肉外酥里嫩，干香麻辣，越吃越香。" },
  { id: 7, name: "番茄炒蛋", category: "家常菜", price: 88000, icon: "🍅", tag: "儿童友好", spicy: false, description: "酸甜家常味，老人和小朋友都适合。" },
  { id: 8, name: "蒜蓉空心菜", category: "家常菜", price: 68000, icon: "🥬", tag: "清爽", spicy: false, description: "本地时蔬，大火快炒，蒜香清爽。" },
  { id: 9, name: "扬州炒饭", category: "主食", price: 78000, icon: "🍚", tag: "主食", spicy: false, description: "米粒干香，配料丰富，单吃也满足。" },
  { id: 10, name: "白米饭", category: "主食", price: 15000, icon: "🍚", tag: "每份", spicy: false, description: "一人份香米饭，建议按用餐人数选择。" },
  { id: 11, name: "紫菜蛋花汤", category: "汤品", price: 68000, icon: "🥣", tag: "暖胃", spicy: false, description: "清淡鲜香，外卖免费建议配小碗和汤勺。" },
  { id: 12, name: "冰镇酸梅汤", category: "饮品", price: 38000, icon: "🥤", tag: "解辣", spicy: false, description: "酸甜开胃，吃川菜时来一壶更舒服。" }
];

const state = {
  category: "全部",
  search: "",
  cart: JSON.parse(localStorage.getItem("yudo-cart") || "[]")
};

const money = value => `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
const categories = ["全部", ...new Set(dishes.map(dish => dish.category))];
const els = {
  grid: document.querySelector("#menuGrid"),
  tabs: document.querySelector("#categoryTabs"),
  search: document.querySelector("#searchInput"),
  cartButton: document.querySelector("#cartButton"),
  cartCount: document.querySelector("#cartCount"),
  drawer: document.querySelector("#cartDrawer"),
  overlay: document.querySelector("#overlay"),
  closeCart: document.querySelector("#closeCart"),
  cartItems: document.querySelector("#cartItems"),
  subtotal: document.querySelector("#subtotal"),
  form: document.querySelector("#checkoutForm"),
  orderType: document.querySelector("#orderType"),
  addressField: document.querySelector("#addressField"),
  dialog: document.querySelector("#orderDialog"),
  closeDialog: document.querySelector("#closeDialog"),
  orderText: document.querySelector("#orderText"),
  copyOrder: document.querySelector("#copyOrder"),
  copyStatus: document.querySelector("#copyStatus")
};

function renderTabs() {
  els.tabs.innerHTML = categories.map(category => `
    <button class="tab ${state.category === category ? "active" : ""}" type="button" data-category="${category}">${category}</button>
  `).join("");
}

function renderMenu() {
  const query = state.search.trim().toLowerCase();
  const visible = dishes.filter(dish =>
    (state.category === "全部" || dish.category === state.category) &&
    (!query || `${dish.name}${dish.description}${dish.category}`.toLowerCase().includes(query))
  );

  els.grid.innerHTML = visible.length ? visible.map(dish => `
    <article class="dish-card">
      <div class="dish-top"><span class="dish-icon" aria-hidden="true">${dish.icon}</span><span class="dish-tag">${dish.tag}</span></div>
      <h3>${dish.name}</h3>
      <p>${dish.description}</p>
      <span class="price">${money(dish.price)}</span>
      <div class="dish-actions">
        ${dish.spicy ? `<select class="spice-select" aria-label="${dish.name}辣度"><option>微辣</option><option>中辣</option><option>特辣</option><option>不辣</option></select>` : `<input type="hidden" value="正常口味" />`}
        <button class="add-button" type="button" data-id="${dish.id}">加入</button>
      </div>
    </article>
  `).join("") : `<div class="empty-menu">没有找到相关菜品，换个关键词试试。</div>`;
}

function persistCart() {
  localStorage.setItem("yudo-cart", JSON.stringify(state.cart));
}

function addToCart(id, flavor) {
  const key = `${id}-${flavor}`;
  const current = state.cart.find(item => item.key === key);
  if (current) current.qty += 1;
  else state.cart.push({ key, id, flavor, qty: 1 });
  persistCart();
  renderCart();
  openCart();
}

function changeQty(key, delta) {
  const item = state.cart.find(line => line.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter(line => line.key !== key);
  persistCart();
  renderCart();
}

function renderCart() {
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = state.cart.reduce((sum, item) => {
    const dish = dishes.find(d => d.id === item.id);
    return sum + dish.price * item.qty;
  }, 0);
  els.cartCount.textContent = count;
  els.subtotal.textContent = money(subtotal);
  els.cartItems.innerHTML = state.cart.length ? state.cart.map(item => {
    const dish = dishes.find(d => d.id === item.id);
    return `<div class="cart-line">
      <div><h4>${dish.name}</h4><small>${item.flavor}</small></div>
      <div class="qty-control">
        <button type="button" data-action="decrease" data-key="${item.key}" aria-label="减少">−</button>
        <b>${item.qty}</b>
        <button type="button" data-action="increase" data-key="${item.key}" aria-label="增加">+</button>
      </div>
      <div class="line-price"><span>${money(dish.price * item.qty)}</span><button class="remove-button" type="button" data-action="remove" data-key="${item.key}">删除</button></div>
    </div>`;
  }).join("") : `<div class="cart-empty">购物车还是空的，先选几道喜欢的菜吧。</div>`;
}

function openCart() {
  els.overlay.hidden = false;
  els.drawer.classList.add("open");
  els.drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  els.overlay.hidden = true;
  els.drawer.classList.remove("open");
  els.drawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function selectedValues(formData, name) {
  const values = formData.getAll(name).filter(Boolean);
  return values.length ? values.join("、") : "未选择";
}

function buildOrder(formData) {
  const total = state.cart.reduce((sum, item) => sum + dishes.find(d => d.id === item.id).price * item.qty, 0);
  const lines = state.cart.map((item, index) => {
    const dish = dishes.find(d => d.id === item.id);
    return `${index + 1}. ${dish.name} × ${item.qty}（${item.flavor}）— ${money(dish.price * item.qty)}`;
  });
  const orderType = formData.get("orderType");
  return [
    "【Yudo 中文订单】",
    `下单时间：${new Date().toLocaleString("zh-CN", { hour12: false })}`,
    "",
    ...lines,
    "",
    `菜品小计：${money(total)}`,
    "配送费：待客服确认",
    "",
    `联系人：${formData.get("customerName")}`,
    `联系电话：${formData.get("phone")}`,
    `用餐方式：${orderType}`,
    ...(orderType === "外卖配送" ? [`酒店/地址：${formData.get("address")}`] : []),
    `用餐人数：${formData.get("people")} 人`,
    `预计时间：${formData.get("deliveryTime")}`,
    `用餐人员：${selectedValues(formData, "diners")}`,
    `免费餐具：${selectedValues(formData, "utensils")}`,
    `备注：${formData.get("notes") || "无"}`,
    "",
    "请客服确认菜品库存、配送费和预计送达时间，谢谢。"
  ].join("\n");
}

els.tabs.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  renderTabs();
  renderMenu();
});

els.search.addEventListener("input", event => {
  state.search = event.target.value;
  renderMenu();
});

els.grid.addEventListener("click", event => {
  const button = event.target.closest("[data-id]");
  if (!button) return;
  const actions = button.closest(".dish-actions");
  const flavor = actions.querySelector(".spice-select")?.value || "正常口味";
  addToCart(Number(button.dataset.id), flavor);
});

els.cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, key } = button.dataset;
  if (action === "increase") changeQty(key, 1);
  if (action === "decrease") changeQty(key, -1);
  if (action === "remove") {
    state.cart = state.cart.filter(item => item.key !== key);
    persistCart();
    renderCart();
  }
});

els.cartButton.addEventListener("click", openCart);
els.closeCart.addEventListener("click", closeCart);
els.overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", event => { if (event.key === "Escape") closeCart(); });

els.orderType.addEventListener("change", event => {
  const delivering = event.target.value === "外卖配送";
  els.addressField.hidden = !delivering;
  els.addressField.querySelector("textarea").required = delivering;
});

els.form.addEventListener("submit", event => {
  event.preventDefault();
  if (!state.cart.length) {
    els.cartItems.scrollIntoView({ behavior: "smooth" });
    els.cartItems.innerHTML = `<div class="cart-empty">请先添加至少一道菜，再生成订单。</div>`;
    return;
  }
  els.orderText.textContent = buildOrder(new FormData(els.form));
  els.copyStatus.textContent = "";
  closeCart();
  els.dialog.showModal();
});

els.closeDialog.addEventListener("click", () => els.dialog.close());
els.copyOrder.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(els.orderText.textContent);
    els.copyStatus.textContent = "已复制，可以直接粘贴给中文客服。";
    els.copyOrder.textContent = "已复制";
    setTimeout(() => { els.copyOrder.textContent = "复制订单内容"; }, 1800);
  } catch {
    els.copyStatus.textContent = "浏览器未允许自动复制，请长按上方订单内容手动复制。";
  }
});

renderTabs();
renderMenu();
renderCart();
