import "./styles.css";
import { useEffect, useMemo, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

const PASSWORD = "kiosco302";

const defaultProducts = [
  {
    name: "Pulpa de Maracuyá",
    price: 13,
    image: "/maracuya.png",
    category: "Pulpas",
    featured: true,
    stock: 20,
  },
  {
    name: "Pulpa de Guanábana",
    price: 13,
    image: "/guanabana.png",
    category: "Pulpas",
    stock: 20,
  },
  {
    name: "Fruta de Mora",
    price: 13,
    image: "/mora.png",
    category: "Pulpas",
    stock: 20,
  },
  {
    name: "Combo 6 Empanadas",
    price: 12,
    image: "/empanadas.png",
    category: "Fritos",
    featured: true,
    stock: 15,
  },
  {
    name: "Combo 10 Mini Papa",
    price: 15,
    image: "/minipapas.png",
    category: "Fritos",
    stock: 15,
  },
  {
    name: "Combo 6 Buñuelos",
    price: 15,
    image: "/buñuelos.png",
    category: "Fritos",
    featured: true,
    stock: 15,
  },
  {
    name: "Combo 6 Pan de Bono",
    price: 13,
    image: "/pandebono.png",
    category: "Fritos",
    stock: 15,
  },
  {
    name: "Combo 6 Almojábana",
    price: 13,
    image: "/almojabana.png",
    category: "Fritos",
    stock: 15,
  },
  {
    name: "Combo 3 Arepas de Huevo",
    price: 12,
    image: "/arepadehuevo.png",
    category: "Fritos",
    featured: true,
    stock: 15,
  },
  {
    name: "Helado 3 Leches",
    price: 3.5,
    image: "/helado3leches.png",
    category: "Helados",
    featured: true,
    stock: 30,
  },
  {
    name: "Helado Chococono",
    price: 3.5,
    image: "/heladochococono.png",
    category: "Helados",
    stock: 30,
  },
  {
    name: "Helado de Coco",
    price: 3,
    image: "/heladodecoco.png",
    category: "Helados",
    stock: 30,
  },
  {
    name: "Galleta Napolitano",
    price: 3,
    image: "/heladonapolitano.png",
    category: "Helados",
    stock: 30,
  },
  {
    name: "Pony Malta x6",
    price: 12,
    image: "/6pony.png",
    category: "Bebidas",
    featured: true,
    stock: 10,
  },
  {
    name: "Hit Lulo",
    price: 2.5,
    image: "/hitlulo.png",
    category: "Bebidas",
    stock: 20,
  },
  {
    name: "Hit Mango",
    price: 2.5,
    image: "/hitmango.png",
    category: "Bebidas",
    stock: 20,
  },
  {
    name: "Hit Mora",
    price: 2.5,
    image: "/hitmora.png",
    category: "Bebidas",
    stock: 20,
  },
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("kioscoCart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");

  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: "",
    category: "Pulpas",
    stock: "",
    featured: false,
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setProducts(data);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem("kioscoCart", JSON.stringify(cart));
  }, [cart]);

  const categories = useMemo(() => {
    return [
      "Todos",
      "Destacados",
      ...Array.from(new Set(products.map((p) => p.category))),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "Todos" ||
        product.category === selectedCategory ||
        (selectedCategory === "Destacados" && product.featured);

      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, search]);

  const imageToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.readAsDataURL(file);
  };

  const addDefaultProducts = async () => {
    for (const product of defaultProducts) {
      await addDoc(collection(db, "products"), product);
    }
  };

  const addNewProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert("Completa nombre, precio y categoría.");
      return;
    }

    await addDoc(collection(db, "products"), {
      name: newProduct.name,
      price: Number(newProduct.price),
      image: newProduct.image || "/logo.png",
      category: newProduct.category,
      stock: Number(newProduct.stock || 0),
      featured: newProduct.featured,
    });

    setNewProduct({
      name: "",
      price: "",
      image: "",
      category: "Pulpas",
      stock: "",
      featured: false,
    });
  };

  const updateProduct = async (product, field, value) => {
    await updateDoc(doc(db, "products", product.id), {
      [field]:
        field === "price" || field === "stock"
          ? Number(value)
          : field === "featured"
          ? Boolean(value)
          : value,
    });
  };

  const deleteProduct = async (product) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    await deleteDoc(doc(db, "products", product.id));
    setCart(cart.filter((item) => item.id !== product.id));
  };

  const addToCart = async (product) => {
    if (product.stock <= 0) return;

    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }

    await updateDoc(doc(db, "products", product.id), {
      stock: Number(product.stock) - 1,
    });
  };

  const increaseQty = async (item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product || product.stock <= 0) return;

    setCart(
      cart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, qty: cartItem.qty + 1 }
          : cartItem
      )
    );

    await updateDoc(doc(db, "products", item.id), {
      stock: Number(product.stock) - 1,
    });
  };

  const decreaseQty = async (item) => {
    if (item.qty === 1) {
      setCart(cart.filter((cartItem) => cartItem.id !== item.id));
    } else {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, qty: cartItem.qty - 1 }
            : cartItem
        )
      );
    }

    const product = products.find((p) => p.id === item.id);
    if (product) {
      await updateDoc(doc(db, "products", item.id), {
        stock: Number(product.stock) + 1,
      });
    }
  };

  const clearCart = async () => {
    for (const item of cart) {
      const product = products.find((p) => p.id === item.id);

      if (product) {
        await updateDoc(doc(db, "products", item.id), {
          stock: Number(product.stock) + item.qty,
        });
      }
    }

    setCart([]);
    localStorage.removeItem("kioscoCart");
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

  const sendWhatsApp = () => {
    if (cart.length === 0) return;

    const order = cart
      .map(
        (item) =>
          `• ${item.name} x${item.qty} - $${(item.price * item.qty).toFixed(2)}`
      )
      .join("\n");

    const message = `Hola 👋 quiero hacer este pedido:

${order}

Total: $${total.toFixed(2)}

Nombre:
Hora de recogida:`;

    window.open(
      `https://wa.me/19453530587?text=${encodeURIComponent(message)}`,
      "_blank"
    );

    setCart([]);
    localStorage.removeItem("kioscoCart");
  };

  const login = () => {
    if (password === PASSWORD) {
      setLogged(true);
      setShowLogin(false);
      setPassword("");
    } else {
      alert("Clave incorrecta");
    }
  };

  return (
    <div className="container">
      {cart.length > 0 && (
        <div
          className="floatingCart"
          onClick={() =>
            document
              .querySelector(".cart")
              .scrollIntoView({ behavior: "smooth" })
          }
        >
          🛒 {totalItems} productos — ${total.toFixed(2)}
        </div>
      )}

      <div className="hero">
        <img src="/logo.png" alt="Logo" className="logo" />
        <h1>EL KIOSCO COSTEÑO</h1>
        <p>🇨🇴 Un pedacito de Colombia en Dallas</p>
      </div>

      <div className="promoBanner">
        <strong>🔥 Productos colombianos en Dallas</strong>
        <span>Haz tu pedido y recoge en Alpha Rd</span>
      </div>

      <section className="categories">
        {categories.map((category) => (
          <button
            key={category}
            className={selectedCategory === category ? "activeCategory" : ""}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </section>

      <div className="searchBox">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <section className="products">
        {filteredProducts.length === 0 ? (
          <div className="emptyProducts">
            <p>No hay productos todavía.</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div className="card" key={product.id}>
              {product.featured && (
                <div className="featuredBadge">⭐ Popular</div>
              )}

              <div className="imageBox">
                <img
                  src={product.image}
                  alt={product.name}
                  className="productImage"
                />
              </div>

              <span className="tag">{product.category}</span>
              <h2>{product.name}</h2>
              <p className="price">${Number(product.price).toFixed(2)}</p>

              <p className={product.stock > 0 ? "stock" : "soldOut"}>
                {product.stock > 0 ? `Disponible` : "Agotado"}
              </p>

              <button
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
              >
                {product.stock > 0 ? "Agregar" : "Agotado"}
              </button>
            </div>
          ))
        )}
      </section>

      <section className="cart">
        <h2>Tu carrito</h2>

        {cart.length === 0 ? (
          <p>No has agregado productos.</p>
        ) : (
          <>
            {cart.map((item) => (
              <div className="cartItem" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <p>
                    ${Number(item.price).toFixed(2)} x {item.qty}
                  </p>
                </div>

                <div className="qtyButtons">
                  <button onClick={() => decreaseQty(item)}>-</button>
                  <span>{item.qty}</span>
                  <button onClick={() => increaseQty(item)}>+</button>
                </div>
              </div>
            ))}

            <h3>Total: ${total.toFixed(2)}</h3>

            <button className="whatsapp" onClick={sendWhatsApp}>
              Enviar pedido por WhatsApp
            </button>

            <button className="clearBtn" onClick={clearCart}>
              Vaciar carrito
            </button>
          </>
        )}
      </section>

      <div className="adminAccess" onClick={() => setShowLogin(true)}>
        ©
      </div>

      {showLogin && (
        <div className="loginModal">
          <div className="loginBox">
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={login}>Entrar</button>
          </div>
        </div>
      )}

      {logged && (
        <section className="inventoryPanel">
          <h2>Control de productos</h2>

          {products.length === 0 && (
            <button className="saveProductBtn" onClick={addDefaultProducts}>
              Cargar productos iniciales
            </button>
          )}

          <div className="newProductBox">
            <h3>Agregar producto</h3>

            <input
              placeholder="Nombre"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />

            <input
              placeholder="Precio"
              type="number"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
            />

            <input
              placeholder="Categoría"
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
              }
            />

            <input
              placeholder="Existencias"
              type="number"
              value={newProduct.stock}
              onChange={(e) =>
                setNewProduct({ ...newProduct, stock: e.target.value })
              }
            />

            <label className="fileLabel">
              Subir foto
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    imageToBase64(file, (base64) => {
                      setNewProduct({ ...newProduct, image: base64 });
                    });
                  }
                }}
              />
            </label>

            {newProduct.image && (
              <div className="adminPreview">
                <img src={newProduct.image} alt="preview" />
              </div>
            )}

            <label className="checkRow">
              <input
                type="checkbox"
                checked={newProduct.featured}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, featured: e.target.checked })
                }
              />
              Producto popular
            </label>

            <button className="saveProductBtn" onClick={addNewProduct}>
              Guardar producto
            </button>
          </div>

          <h3>Editar inventario</h3>

          {products.map((product) => (
            <div className="editProductCard" key={product.id}>
              <div className="adminPreview">
                <img src={product.image} alt={product.name} />
              </div>

              <input
                value={product.name}
                onChange={(e) => updateProduct(product, "name", e.target.value)}
              />

              <input
                type="number"
                value={product.price}
                onChange={(e) =>
                  updateProduct(product, "price", e.target.value)
                }
              />

              <input
                value={product.category}
                onChange={(e) =>
                  updateProduct(product, "category", e.target.value)
                }
              />

              <input
                type="number"
                value={product.stock}
                onChange={(e) =>
                  updateProduct(product, "stock", e.target.value)
                }
              />

              <label className="fileLabel">
                Cambiar foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      imageToBase64(file, (base64) => {
                        updateProduct(product, "image", base64);
                      });
                    }
                  }}
                />
              </label>

              <label className="checkRow">
                <input
                  type="checkbox"
                  checked={!!product.featured}
                  onChange={(e) =>
                    updateProduct(product, "featured", e.target.checked)
                  }
                />
                Popular
              </label>

              <button
                className="deleteBtn"
                onClick={() => deleteProduct(product)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </section>
      )}

      <div className="pickup">📍 Pickup: 7880 Alpha Rd, Dallas, TX 75240</div>
    </div>
  );
}
